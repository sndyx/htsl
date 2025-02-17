import type { CompileCtx } from "../context.js";
import { isAction, partialEq } from "../helpers.js";
import type { Action } from "housing-common/src/actions/actions.js";
import type { Mode, Amount } from "housing-common/src/actions/types.js";
import type { Lexer } from "./lexer.js";
import {
	type Delimiter,
	type I64Kind, type PlaceholderKind,
	type StrKind,
	type Token,
	tokenToString,
} from "./token.js";
import { type SemanticType, type Span, span } from "./meta.js";
import { Diagnostic } from "./diagnostic.js";

export class Parser {
	ctx: CompileCtx;
	lexer: Lexer;

	token: Token;
	prev: Token;

	constructor(ctx: CompileCtx, lexer: Lexer) {
		this.ctx = ctx;
		this.lexer = lexer;
		this.token = { kind: "eof", span: span(0, 0) };
		this.prev = this.token;
		this.next();
	}

	parseCompletely(): Array<Action> {
		const actions = [];
		while (true) {
			try {
				const action = this.parseAction();
				if (!action) break;
				actions.push(action);
			} catch (e) {
				if (e instanceof Diagnostic) this.ctx.emit(e);
				this.recover();
			}
		}
		return actions;
	}

	parseAction(): Action | undefined {
		if (this.eatIdent("stat")) {
			return this.parseActionChangeStat();
		}
		if (this.eatIdent("globalstat")) {
			return this.parseActionChangeGlobalStat();
		}
		if (this.eatIdent("teamstat")) {
			return this.parseActionChangeTeamStat();
		}
		if (this.eatIdent("changeHealth")) {
			return this.parseActionChangeHealth();
		}
		if (this.eatIdent("title")) {
			return this.parseActionTitle();
		}
		if (this.eatIdent("chat")) {
			return this.parseActionMessage();
		}
		if (this.eatIdent("if")) {
			return this.parseActionConditional();
		}

		if (this.check("ident")) {
			throw Diagnostic.error("Unknown action", this.token.span);
		}
		if (!this.check("eof")) {
			throw Diagnostic.error("Expected action", this.token.span);
		}
		return undefined;
	}

	parseActionChangeStat(): Action {
		let stat, mode, amount;
		this.parseRecovering(() => {
			stat = this.parseMeta("stat_name", () => this.parseStatName());
			mode = this.parseMeta("mode", () => this.parseStatMode());
			amount = this.parseMeta("amount", () => this.parseStatAmount());
		});

		return { type: "CHANGE_STAT", stat, mode, amount };
	}

	parseActionChangeGlobalStat(): Action {
		let stat, mode, amount;
		this.parseRecovering(() => {
			stat = this.parseMeta("global_stat_name", () => this.parseStatName());
			mode = this.parseMeta("mode", () => this.parseStatMode());
			amount = this.parseMeta("amount", () => this.parseStatAmount());
		});

		return { type: "CHANGE_GLOBAL_STAT", stat, mode, amount };
	}

	parseActionChangeTeamStat(): Action {
		let stat, team, mode, amount;
		this.parseRecovering(() => {
			stat = this.parseMeta("team_stat_name", () => this.parseStatName());
			team = this.parseMeta("team_name", () => this.parseStatName());
			mode = this.parseMeta("mode", () => this.parseStatMode());
			amount = this.parseMeta("amount", () => this.parseStatAmount());
		});

		return { type: "CHANGE_TEAM_STAT", stat, team, mode, amount };
	}

	parseActionChangeHealth(): Action {
		let mode, amount;
		this.parseRecovering(() => {
			mode = this.parseMeta("mode", () => this.parseStatMode());
			amount = this.parseMeta("amount", () => this.parseStatAmount());
		});

		return { type: "CHANGE_HEALTH", mode, amount };
	}

	parseActionTitle(): Action {
		let title, subtitle, fadein, stay, fadeout;
		this.parseRecovering(() => {
			title = this.parseMeta("string", () => this.parseStr());
			subtitle = this.parseMeta("string", () => this.parseStr());

			fadein = this.parseMeta("amount", () => this.parseI64());
			stay = this.parseMeta("amount", () => this.parseI64());
			fadeout = this.parseMeta("amount", () => this.parseI64());
		});

		return { type: "TITLE", title, subtitle, fadein, stay, fadeout };
	}

	parseActionMessage(): Action {
		let message;
		this.parseRecovering(() => {
			message = this.parseMeta("string", () => this.parseStr());
		});

		return { type: "MESSAGE", message };
	}

	parseActionConditional(): Action {
		let matchAny, conditions, ifActions, elseActions;
		this.parseRecovering(() => {
			matchAny = this.parseMeta("keyword", () => {
				this.eatIdent("and");
				return this.eatIdent("or");
			});

			conditions = this.parseMeta("conditions", () => this.parseDelimitedCommaSeq("parenthesis", () => {
				return "";
			}));

			ifActions = this.parseMeta("block", () => this.parseBlock());

			if (this.eatIdent("else")) {
				elseActions = this.parseMeta("block", () => this.parseBlock());
			}
		});

		return { type: "CONDITIONAL", matchAny, ifActions, elseActions };
	}

	parseStatName(): string {
		if (this.token.kind !== "ident" && this.token.kind !== "str") {
			throw Diagnostic.error("Expected stat name", this.token.span);
		}
		const value = this.token.value;
		if (value.length > 16) {
			throw Diagnostic.error("Stat name exceeds 16-character limit", this.token.span);
		}
		if (value.length < 1) {
			// we check this because of: ""
			throw Diagnostic.error("Stat name cannot be empty", this.token.span);
		}
		if (value.includes(" ")) {
			throw Diagnostic.error("Stat name cannot contain spaces", this.token.span);
		}

		this.next();
		return value;
	}

	parseStatMode(): Mode {
		if (this.eatOption("increment") || this.eatOption("inc") || this.eat({ kind: "bin_op_eq", op: "plus" })) {
			return "increment";
		}
		if (this.eatOption("decrement") || this.eatOption("dec") || this.eat({ kind: "bin_op_eq", op: "minus" })) {
			return "decrement";
		}
		if (this.eatOption("multiply") || this.eatOption("mul") || this.eat({ kind: "bin_op_eq", op: "star" })) {
			return "multiply";
		}
		if (this.eatOption("divide") || this.eatOption("div") || this.eat({ kind: "bin_op_eq", op: "slash" })) {
			return "divide";
		}
		if (this.eatOption("set") || this.eat({ kind: "cmp_op", op: "equal" })) {
			return "set";
		}
		if (this.check("str") || this.check("ident")) {
			throw Diagnostic.error("Expected operation (increment, decrement, multiply, divide, set)", this.token.span);
		}
		throw Diagnostic.error("Expected operation", this.token.span);
	}

	parseStatAmount(): Amount {
		if (this.check("i64") || this.check({ kind: "bin_op", op: "minus" })) {
			return this.parseI64();
		}
		if (this.check("placeholder")) {
			this.next();
			return (this.prev as PlaceholderKind).value;
		}
		if (this.check("str")) {
			this.next();
			return (this.prev as StrKind).value;
		}
		if (this.eatIdent("stat")) {
			const name = this.parseStatName();
			return `%stat.player/${name}%`;
		}
		if (this.eatIdent("globalstat")) {
			const name = this.parseStatName();
			return `%stat.global/${name}%`;
		}
		if (this.eatIdent("teamstat")) {
			const name = this.parseStatName();

			if (!this.check("ident") && !this.check("str")) {
				throw Diagnostic.error("Expected team name", this.token.span);
			}
			const team = this.parseStatName();
			return `%stat.team/${name} ${team}%`;
		}
		throw Diagnostic.error("expected amount", this.token.span);
	}

	parseStr(): string {
		this.expect("str");
		return (this.prev as StrKind).value;
	}

	parseI64(): bigint {
		const negative = this.eat({ kind: "bin_op", op: "minus" });

		this.expect("i64");
		let value = BigInt((this.prev as I64Kind).value); // bigint constructor should never fail?
		if (negative) value *= -1n;

		if (
			value < BigInt("-9223372036854775808") ||
			value > BigInt("9223372036854775807")
		) {
			throw Diagnostic.error("Number exceeds 64-bit integer limit", this.prev.span);
		}
		return value;
	}

	parseF64(): number {
		if (this.token.kind !== "i64" && this.token.kind !== "f64") {
			throw Diagnostic.error("Expected number", this.token.span);
		}
		this.next();

		return Number.parseFloat(this.token.value);
	}

	parseRecovering(parser: () => void) {
		try {
			return parser();
		} catch (e) {
			if (e instanceof Diagnostic) {
				// cursed span creation? maybe I will do this one day
				/*
				if (this.token.kind === "ident" && isAction(this.token.value)) {
					const endPos = this.prev.span.hi;
					e.span = span(endPos, endPos);
				}
				 */
				this.ctx.emit(e);
				this.recover();

			}
			else throw e;
		}
	}

	parseBlock(): Array<Action> {
		const actions = [];
		this.expect({ kind: "open_delim", delim: "brace" });
		while (true) {
			if (this.check("eof")) throw Diagnostic.error("expected }");
			if (this.eat({ kind: "close_delim", delim: "brace" })) break;
			try {
				const action = this.parseAction();
				if (!action) break;
				actions.push(action);
			} catch (e) {
				if (e instanceof Diagnostic) this.ctx.emit(e);
				this.recover();
			}
		}
		return actions;
	}

	parseDelimitedCommaSeq<T>(delim: Delimiter, parser: () => T) {
		this.expect({ kind: "open_delim", delim });

		const seq: Array<T> = [];
		while (!this.check({ kind: "close_delim", delim })) {
			if (this.token.kind === "eof") break; // will catch the below `expect` and error gracefully

			seq.push(parser());

			if (!this.eat("comma")) break;
		}
		this.expect({ kind: "close_delim", delim });

		return seq;
	}

	parseMeta<T>(
		type: SemanticType, parser: () => T
	): { value: T, span: Span, type: SemanticType } {
		const lo = this.token.span.lo;
		const value = parser();
		const hi = this.prev.span.hi;

		return { value, span: span(lo, hi), type };
	}

	eatOption(value: string): boolean {
		if (this.eatIdent(value)) return true;
		return this.eat({ kind: "str", value });
	}

	eatIdent(value: string): boolean {
		return this.eat({ kind: "ident", value });
	}

	recover() {
		while (true) {
			if (
				this.check("eof")
				|| (this.token.kind === "ident" && isAction(this.token.value))
			) return;
			this.next();
		}
	}

	expect(tok: Token["kind"] | Partial<Token>) {
		if (!this.eat(tok)) {
			throw Diagnostic.error(`Expected ${tokenToString(tok)}`, this.token.span);
		}
	}

	eat(tok: Token["kind"] | Partial<Token>): boolean {
		const matches = this.check(tok);
		if (matches) this.next();
		return matches;
	}

	check(tok: Token["kind"] | Partial<Token>): boolean {
		return typeof tok === "string"
			? this.token.kind === tok // match just kind
			: partialEq(this.token, tok); // match partial token
	}

	next() {
		this.prev = this.token;
		this.token = this.lexer.advanceToken();
	}
}

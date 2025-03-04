import { partialEq } from "../helpers.js";
import type { Operation, Amount, Location, Comparison, Gamemode } from "housing-common/src/types/";
import type { Lexer } from "./lexer.js";
import {
	type Delimiter,
	type I64Kind, type IdentKind,
	type PlaceholderKind,
	type StrKind,
	type Token,
	tokenToString,
} from "./token.js";
import { type Span, span } from "./span.js";
import { type Diagnostic, error } from "./diagnostic.js";
import type { IrAction, ParseResult } from "./ir.js";
import { parseAction } from "./actions.js";
import { parseNumericalPlaceholder } from "./placeholders";

export class Parser {
	readonly result: ParseResult;
	readonly lexer: Lexer;

	tokenQueue: Token[];
	token: Token;
	prev: Token;

	private readonly shortcuts: Map<string, Token[]>;

	constructor(lexer: Lexer) {
		this.result = { holders: [], diagnostics: [] };
		this.lexer = lexer;
		this.tokenQueue = [];
		this.token = { kind: "eof", span: span(0, 0) };
		this.prev = this.token;
		this.shortcuts = new Map();
		this.next();
	}

	parseCompletely(): ParseResult {
		const defaultActions = this.parseSpanned(this.parseActions);
		this.result.holders.push({
			type: "UNKNOWN", kwSpan: { start: 0, end: 0 },
			actions: defaultActions
		});

		while (true) {
			if (!this.eatIdent("goto")) break;

			const kwSpan = this.token.span;
			if (this.eatIdent("function")) {
				const name = this.parseSpanned(this.parseString);
				const actions = this.parseSpanned(this.parseActions);

				this.result.holders.push({ type: "FUNCTION", kwSpan, name, actions });
			} else {
				this.addDiagnostic(error("Expected action holder (function, event)", kwSpan));
			}
		}

		return this.result;
	}

	parseActions(): IrAction[] {
		const actions: IrAction[] = [];
		while (true) {
			this.eatNewlines();
			if (this.check({ kind: "ident", value: "goto" }) || this.check("eof")) break;
			if (this.eat({ kind: "ident", value: "define" })) {
				this.parseShortcut();
				continue;
			}
			const action = this.parseRecovering(["eol"], () => parseAction(this));
			if (!this.eat("eol") && !this.check("eof")) {
				this.addDiagnostic(error("Expected end of line", this.token.span));
			}
			if (action === undefined) continue;
			actions.push(action);
		}
		return actions;
	}

	parseBlock(): Array<IrAction> {
		const actions = [];
		this.expect({ kind: "open_delim", delim: "brace" });
		while (true) {
			this.eatNewlines();
			if (this.check("eof")) throw error("expected }", this.token.span);
			if (this.eat({ kind: "close_delim", delim: "brace" })) break;
			try {
				const action = parseAction(this);
				if (!action) break;
				if (
					!this.eat("eol") &&
					!this.check("eof") &&
					!this.check({ kind: "close_delim", delim: "brace" })
				) {
					this.addDiagnostic(error("Expected end of line", this.token.span));
				}

				actions.push(action);
			} catch (e) {
				this.addDiagnostic(e as Diagnostic);
				this.recover(["eol"]);
			}
		}
		return actions;
	}

	parseShortcut() {
		const name = this.parseIdent();
		const tokens: Token[] = [];

		while (!this.check("eol") && !this.check("eof")) {
			tokens.push(this.token);
			this.next();
		}

		this.shortcuts.set(name, tokens);
	}

	parseLocation(): Location {
		if (
			this.eatIdent("custom_location") ||
			this.eat({ kind: "str", value: "custom_location" })
		) {
			return { type: "LOCATION_CUSTOM" };
		}
		if (
			this.eatIdent("house_spawn") ||
			this.eat({ kind: "str", value: "house_spawn" })
		) {
			return { type: "LOCATION_SPAWN" };
		}
		throw error("Invalid location", this.token.span);
	}

	parseGamemode(): Gamemode {
		if (this.eatOption("survival")) {
			return "survival";
		}
		if (this.eatOption("adventure")) {
			return "adventure";
		}
		if (this.eatOption("creative")) {
			return "creative";
		}
		if (this.check("str") || this.check("ident")) {
			this.addDiagnostic(error("Expected gamemode (survival, adventure, creative)", this.token.span));
		} else {
			this.addDiagnostic(error("Expected gamemode", this.token.span));
		}
		this.next();
		return "survival";
	}

	parseComparison(): Comparison {
		if (
			this.eatOption("equals") ||
			this.eatOption("equal") ||
			this.eat({ kind: "cmp_op", op: "equals" }) ||
			this.eat({ kind: "cmp_op_eq", op: "equals" })
		) {
			return "equals";
		}
		if (this.eatOption("less than") || this.eat({ kind: "cmp_op", op: "less_than" })) {
			return "less_than";
		}
		if (
			this.eatOption("less than or equals") ||
			this.eatOption("less than or equal") ||
			this.eat({ kind: "cmp_op_eq", op: "less_than" })
		) {
			return "less_than_or_equals";
		}
		if (this.eatOption("greater than") || this.eat({ kind: "cmp_op", op: "greater_than" })) {
			return "greater_than";
		}
		if (
			this.eatOption("greater than or equals") ||
			this.eatOption("greater than or equal") ||
			this.eat({ kind: "cmp_op_eq", op: "greater_than" })
		) {
			return "greater_than_or_equals";
		}
		if (this.check("str") || this.check("ident")) {
			this.addDiagnostic(
				error(
					"Expected comparison (less than, less than or equals, equals, greater than, greater than or equals)",
					this.token.span
				)
			);
		} else {
			this.addDiagnostic(error("Expected comparison", this.token.span));
		}
		this.next();
		return "equals";
	}

	parseStatName(): string {
		if (this.token.kind !== "ident" && this.token.kind !== "str") {
			throw error("Expected stat name", this.token.span);
		}
		const value = this.token.value;
		if (value.length > 16) {
			throw error("Stat name exceeds 16-character limit", this.token.span);
		}
		if (value.length < 1) {
			throw error("Stat name cannot be empty", this.token.span);
		}
		if (value.includes(" ")) {
			throw error("Stat name cannot contain spaces", this.token.span);
		}
		this.next();
		return value;
	}

	parseOperation(): Operation {
		if (
			this.eatOption("increment") ||
			this.eatOption("inc") ||
			this.eat({ kind: "bin_op_eq", op: "plus" })
		) {
			return "increment";
		}
		if (
			this.eatOption("decrement") ||
			this.eatOption("dec") ||
			this.eat({ kind: "bin_op_eq", op: "minus" })
		) {
			return "decrement";
		}
		if (
			this.eatOption("multiply") ||
			this.eatOption("mul") ||
			this.eat({ kind: "bin_op_eq", op: "star" })
		) {
			return "multiply";
		}
		if (
			this.eatOption("divide") ||
			this.eatOption("div") ||
			this.eat({ kind: "bin_op_eq", op: "slash" })
		) {
			return "divide";
		}
		if (
			this.eatOption("set") ||
			this.eat({ kind: "cmp_op", op: "equals" })
		) {
			return "set";
		}
		if (this.check("str") || this.check("ident")) {
			this.addDiagnostic(
				error("Expected operation (increment, decrement, set, multiply, divide)", this.token.span)
			);
		} else {
			this.addDiagnostic(error("Expected operation", this.token.span));
		}
		this.next();
		return "set";
	}

	parseAmount(): Amount {
		if (this.check("i64") || this.check({ kind: "bin_op", op: "minus" })) {
			return this.parseNumber();
		}
		if (this.check("placeholder")) {
			this.next();
			return (this.prev as PlaceholderKind).value;
		}
		if (this.check("str")) {
			return parseNumericalPlaceholder(this);
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
				throw error("Expected team name", this.token.span);
			}
			const team = this.parseStatName();
			return `%stat.team/${name} ${team}%`;
		}
		throw error("expected amount", this.token.span);
	}

	parseBoolean(): boolean {
		let value;
		if (this.eatIdent("true")) value = true;
		if (this.eatIdent("false")) value = false;
		if (!value) throw error("expected true/false value", this.token.span);
		return value;
	}

	parseIdent(): string {
		this.expect("ident");
		return (this.prev as IdentKind).value;
	}

	parseString(): string {
		this.expect("str");
		return (this.prev as StrKind).value;
	}

	parseBoundedNumber(min: number, max: number): number {
		const { value, span } = this.parseSpanned(this.parseNumber);
		if (value < min) {
			this.addDiagnostic(error(`Value must be greater than or equal to ${min}`, span));
		}
		if (value > max) {
			this.addDiagnostic(error(`Value must be less than or equal to ${max}`, span));
		}
		return Number(value);
	}

	parseNumber(): bigint {
		const negative = this.eat({ kind: "bin_op", op: "minus" });
		this.expect("i64");
		let value = BigInt((this.prev as I64Kind).value);
		if (negative) value *= -1n;
		if (value < BigInt("-9223372036854775808") || value > BigInt("9223372036854775807")) {
			throw error("Number exceeds 64-bit integer limit", this.prev.span);
		}
		return value;
	}

	parseFloat(): number {
		if (this.token.kind !== "i64" && this.token.kind !== "f64") {
			throw error("Expected number", this.token.span);
		}
		this.next();
		return Number.parseFloat(this.token.value);
	}

	parseDelimitedCommaSeq<T>(delim: Delimiter, parser: () => T) {
		parser.bind(this);
		this.expect({ kind: "open_delim", delim });
		const seq: Array<T> = [];
		this.eatNewlines();
		while (!this.eat({ kind: "close_delim", delim })) {
			if (this.token.kind === "eof") break;
			seq.push(parser());
			this.eatNewlines();
			if (!this.eat("comma")) {
				if (!this.eat({ kind: "close_delim", delim })) {
					this.addDiagnostic(error("expected ,", this.token.span));
				} else break;
			}
			this.eatNewlines();
		}
		return seq;
	}

	parseRecovering<T>(
		recoveryTokens: Array<Token["kind"] | Partial<Token>>,
		parser: () => T
	): T | undefined {
		try {
			return parser.call(this);
		} catch (e) {
			this.addDiagnostic(e as Diagnostic);
			this.recover(recoveryTokens);
		}
	}

	parseSpanned<T>(parser: () => T): { value: T; span: Span } {
		const lo = this.token.span.start;
		const value = parser.call(this);
		const hi = this.prev.span.end;
		return { value, span: span(lo, hi) };
	}

	eatOption(value: string): boolean {
		if (this.token.kind !== "str" && this.token.kind !== "ident") return false;
		if (this.token.value.toLowerCase() == value.toLowerCase()) {
			this.next();
			return true;
		}
		return false;
	}

	eatIdent(value: string): boolean {
		return this.eat({ kind: "ident", value });
	}

	eatNewlines() {
		while (this.eat("eol")) { }
	}

	recover(recoveryTokens: Array<Token["kind"] | Partial<Token>>) {
		while (true) {
			if (recoveryTokens.find(token => this.check(token)) || this.check("eof")) {
				return;
			}
			this.next();
		}
	}

	expect(tok: Token["kind"] | Partial<Token>) {
		if (!this.eat(tok)) {
			throw error(`Expected ${tokenToString(tok)}`, this.token.span);
		}
	}

	eat(tok: Token["kind"] | Partial<Token>): boolean {
		const matches = this.check(tok);
		if (matches) this.next();
		return matches;
	}

	check(tok: Token["kind"] | Partial<Token>): boolean {
		return typeof tok === "string"
			? this.token.kind === tok
			: partialEq(this.token, tok);
	}

	next() {
		this.prev = this.token;

		let token;
		while (!token) {
			try {
				token = this.tokenQueue.length === 0 ? this.lexer.advanceToken() : this.tokenQueue.shift()!;
			} catch (e) {
				this.addDiagnostic(e as Diagnostic);
			}
		}

		if (token.kind === "ident") {
			const value = (token as IdentKind).value;

			if (this.shortcuts.has(value)) {
				const tokens = this.shortcuts.get(value)!;
				for (const innerToken of tokens) {
					innerToken.span = token.span;
				}
				this.tokenQueue.unshift(...tokens);
			} else {
				this.token = token;
				return;
			}

			this.next();
		} else {
			this.token = token;
		}
	}

	addDiagnostic(diagnostic: Diagnostic) {
		this.result.diagnostics.push(diagnostic);
	}
}
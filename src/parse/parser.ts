import { partialEq } from '../helpers.js';
import type { Lexer } from './lexer.js';
import {
    type CloseDelimKind,
    type Delimiter,
    type I64Kind,
    type IdentKind,
    type StrKind,
    type Token,
    tokenToString,
} from './token.js';
import { type Span, span } from '../span.js';
import { type Diagnostic, error } from '../diagnostic.js';
import type { IrAction, ParseResult } from '../ir.js';
import { parseAction } from './actions.js';
import { parseHolder } from './holders';

export class Parser {
    readonly result: ParseResult;
    readonly lexer: Lexer;

    tokens: Token[];
    token: Token;
    prev: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.result = { holders: [], diagnostics: [] };
        this.tokens = [];
        this.token = { kind: 'eof', span: span(0, 0) };
        this.prev = this.token;
        this.next();
    }

    parseCompletely(): ParseResult {
        while (!this.check('eof')) {
            this.parseRecovering(['eol'], () => {
                this.result.holders.push(parseHolder(this));
            });
        }

        return this.result;
    }

    parseActions(): IrAction[] {
        const actions: IrAction[] = [];
        while (true) {
            this.eatNewlines();
            if (this.check({ kind: 'ident', value: 'goto' }) || this.check('eof')) break;
            const action = this.parseRecovering(['eol'], () => parseAction(this));
            if (!this.eat('eol') && !this.check('eof')) {
                this.addDiagnostic(error('Expected end of line', this.token.span));
            }
            if (action === undefined) continue;
            actions.push(action);
        }
        return actions;
    }

    parseBlock(): Array<IrAction> {
        const actions = [];
        this.expect({ kind: 'open_delim', delim: 'brace' });
        while (true) {
            this.eatNewlines();
            if (this.check('eof')) throw error('expected }', this.token.span);
            if (this.eat({ kind: 'close_delim', delim: 'brace' })) break;

            const action = this.parseRecovering(
                ['eol', { kind: 'close_delim', delim: 'brace' }],
                parseAction
            );
            if (!action) continue;

            if (
                !this.eat('eol') &&
                !this.check('eof') &&
                !this.check({ kind: 'close_delim', delim: 'brace' })
            ) {
                this.addDiagnostic(error('Expected end of line', this.token.span));
            }

            actions.push(action);
        }
        return actions;
    }

    parseName(): string {
        if (this.token.kind !== 'ident' && this.token.kind !== 'str') {
            throw error('Expected name', this.token.span);
        }

        const value = this.token.value;
        this.next();
        return value;
    }

    parseBoolean(): boolean {
        let value;
        if (this.eatIdent('true')) value = true;
        if (this.eatIdent('false')) value = false;
        if (value === undefined)
            throw error('expected true/false value', this.token.span);
        return value;
    }

    parseIdent(): string {
        this.expect('ident');
        return (this.prev as IdentKind).value;
    }

    parseString(): string {
        this.expect('str');
        return (this.prev as StrKind).value;
    }

    parseBoundedNumber(min: number, max: number): number {
        const { value, span } = this.spanned(this.parseNumber);
        if (value < min) {
            this.addDiagnostic(
                error(`Value must be greater than or equal to ${min}`, span)
            );
        }
        if (value > max) {
            this.addDiagnostic(error(`Value must be less than or equal to ${max}`, span));
        }
        return Number(value);
    }

    parseNumber(): bigint {
        const negative = this.eat({ kind: 'bin_op', op: 'minus' });
        this.expect('i64');
        let value = BigInt((this.prev as I64Kind).value);
        if (negative) value *= -1n;
        if (
            value < BigInt('-9223372036854775808') ||
            value > BigInt('9223372036854775807')
        ) {
            throw error('Number exceeds 64-bit integer limit', this.prev.span);
        }
        return value;
    }

    parseFloat(): number {
        if (this.token.kind !== 'i64' && this.token.kind !== 'f64') {
            throw error('Expected number', this.token.span);
        }
        this.next();
        return Number.parseFloat(this.token.value);
    }

    parseDelimitedTokens(delim: Delimiter): Token[] {
        const tokens: Token[] = [];
        this.expect({ kind: 'open_delim', delim });

        let depth = 1;
        while (true) {
            if (this.check('eof')) {
                throw error(
                    `expected ${tokenToString({ kind: 'close_delim', delim })}`,
                    this.token.span
                );
            }

            if (this.check({ kind: 'close_delim', delim })) {
                if (depth === 1) break;
                depth--;
            } else if (this.check({ kind: 'open_delim', delim })) {
                depth++;
            }

            tokens.push(this.token);
            this.next();
        }
        this.next();

        return tokens;
    }

    parseDelimitedCommaSeq<T>(delim: Delimiter, parser: ((p: Parser) => T) | (() => T)) {
        this.expect({ kind: 'open_delim', delim });
        const seq: Array<T> = [];
        this.eatNewlines();

        const closeDelim: CloseDelimKind = { kind: 'close_delim', delim };
        while (!this.eat(closeDelim)) {
            if (this.token.kind === 'eof') {
                // we have reached the end of the file without finding a close delim
                throw error(`Expected ${tokenToString(closeDelim)}`, this.token.span);
            }

            seq.push(parser.call(this, this));
            this.eatNewlines();
            if (!this.eat('comma')) {
                if (!this.eat(closeDelim)) {
                    this.addDiagnostic(error('expected ,', this.token.span));
                    this.recover([closeDelim]);
                } else break;
            }
            this.eatNewlines();
        }
        return seq;
    }

    parseRecovering<T>(
        recoveryTokens: Array<Token['kind'] | Partial<Token>>,
        parser: ((p: Parser) => T) | (() => T)
    ): T | undefined {
        try {
            return parser.call(this, this);
        } catch (e) {
            if (e instanceof Error) throw e;
            this.addDiagnostic(e as Diagnostic);
            this.recover(recoveryTokens);
        }
    }

    spanned<T>(parser: ((p: Parser) => T) | (() => T)): { value: T; span: Span } {
        const lo = this.token.span.start;
        const value = parser.call(this, this);
        const hi = this.prev.span.end;
        return { value, span: span(lo, hi) };
    }

    eatOption(value: string): boolean {
        if (this.token.kind !== 'str' && this.token.kind !== 'ident') return false;
        if (this.token.value.toLowerCase() == value.toLowerCase()) {
            this.next();
            return true;
        }
        return false;
    }

    eatIdent(value: string): boolean {
        return this.eat({ kind: 'ident', value });
    }

    eatNewlines() {
        while (this.eat('eol')) {}
    }

    recover(recoveryTokens: Array<Token['kind'] | Partial<Token>>) {
        while (true) {
            if (recoveryTokens.find((token) => this.check(token)) || this.check('eof')) {
                return;
            }
            this.next();
        }
    }

    expect(tok: Token['kind'] | Partial<Token>) {
        if (!this.eat(tok)) {
            throw error(`Expected ${tokenToString(tok)}`, this.token.span);
        }
    }

    eat(tok: Token['kind'] | Partial<Token>): boolean {
        const matches = this.check(tok);
        if (matches) this.next();
        return matches;
    }

    check(tok: Token['kind'] | Partial<Token>): boolean {
        return typeof tok === 'string'
            ? this.token.kind === tok
            : partialEq(this.token, tok);
    }

    next() {
        this.prev = this.token;
        if (this.tokens.length === 0) {
            this.tokens.push(this.lexer.advanceToken());
        }
        this.token = this.tokens.shift()!; // this is fine
    }

    addDiagnostic(diagnostic: Diagnostic) {
        this.result.diagnostics.push(diagnostic);
    }
}

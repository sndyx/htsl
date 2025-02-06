import type { Lexer } from "./lexer.js";
import type { Delimiter, Token } from "./token.js";
import { span } from "../span.js";
import { error } from "../diagnostic.js";

export class Parser {

    lexer: Lexer;

    token: Token;
    prev: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.token = { kind: "eof", span: span(0, 0) };
        this.prev = this.token;
    }

    parseStatName(): string {
        if (this.token.kind != "ident" && this.token.kind != "str") {
            throw error("expected stat name", this.token.span);
        }
        const value = this.token.value;
        this.next();
        return value;
    }

    parseI64(): BigInt {
        if (this.token.kind != "i64") {
            throw error("expected number", this.token.span);
        }
        const value = BigInt(this.token.value); // this should never fail
        this.next();

        if (value < BigInt("-9223372036854775808") || value > BigInt("9223372036854775807")) {
            throw error("number exceeds 64-bit integer limit", this.token.span);
        }
        return value;
    }

    parseF64(): number {
        if (this.token.kind != "i64" && this.token.kind != "f64") {
            throw error("expected number", this.token.span);
        }

        return parseFloat(this.token.value);
    }

    parseDelimitedCommaSeq<T>(delim: Delimiter, parser: () => T) {
        if (this.token.kind != "open_delim" || this.token.delim != delim) {
            throw error("expected (", this.token.span);
        }
        this.next();

        while (this.token.kind != "eof") {
            
        }
    }

    match(kind: Token["kind"]) {
        if (!this.eat(kind)) {
            throw error(`expected ${kind}`, this.token.span);
        }
    }

    eat(kind: Token["kind"]): boolean {
        const matches = this.token.kind == kind;
        if (matches) this.next();
        return matches;
    }

    next() {
        this.prev = this.token;
        this.token = this.lexer.advanceToken();
    }

}
import { token, type Token } from "./token.js";

class Lexer {

    src: string;
    pos: number;

    constructor(src: string, pos: number) {
        this.src = src;
        this.pos = pos;
    }

    advanceToken(): Token {
        // eat whitespace
        while (this.hasNext() && /^\s+$/.test(this.peek())) { this.next(); }
        if (!this.hasNext()) return token("eof");

        const lo = this.pos;
        const c = this.next();

        if (c == "/" && this.peek() == "/") {
            // eat line comment
            do {
                this.next();
            } while (this.hasNext() && this.peek() != "\n");

            return this.advanceToken();
        }

        if (c == "/" && this.peek() == "*") {
            this.next();

            // eat block comment
            let depth = 1;
            while (this.hasNext()) {
                const c = this.next();
                if (c == "/" && this.peek() == "*") {
                    this.next();
                    depth++;
                }
                else if (c == "*" && this.peek() == "/") {
                    this.next();
                    depth--;
                    if (depth == 0) break;
                }
            }

            return this.advanceToken();
        }

        
    }

    hasNext(): boolean {
        return this.pos < this.src.length;
    }
    
    next(): string {
        return this.src.charAt(this.pos++);
    }

    peek(skip?: number): string {
        return this.src.charAt(this.pos + (skip ?? 0));
    }

}
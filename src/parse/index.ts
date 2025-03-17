import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import type { ParseResult } from "../ir.js";
import { validate } from "../validate";

export function parseFromString(src: string): ParseResult {
    const lexer = new Lexer(src);
    const parser = new Parser(lexer);
    const result = parser.parseCompletely();
    validate(result);
    return result;
}
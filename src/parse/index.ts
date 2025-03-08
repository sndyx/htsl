import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import type { ParseResult } from "./ir.js";
import { checkContext, checkLimits, checkNesting } from "../lower";

export * from "./ir.js";
export * from "./diagnostic.js";

export function parse(src: string): ParseResult {
    const lexer = new Lexer(src);
    const parser = new Parser(lexer);
    const result = parser.parseCompletely();

    checkLimits(result);
    checkNesting(result);
    checkContext(result);

    return result;
}
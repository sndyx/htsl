import { Lexer } from "./parse/lexer.js";
import { Parser } from "./parse/parser.js";
import { CompileCtx } from "./context.js";
import type { Action } from "housing-common/src/actions/actions.js";

export * from "./analysis/providers.js";

export function getActions(src: string): Array<Action> {
	const ctx = new CompileCtx();
	const lexer = new Lexer(src);
	const parser = new Parser(ctx, lexer);
	return parser.parseCompletely();
}
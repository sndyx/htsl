import { Lexer } from "./parse/lexer.js";
import { Parser } from "./parse/parser.js";
import { CompileCtx } from "./context.js";
import type { Action } from "./action/action.js";
import type { InlayHint } from "./types/hint.js";
import type { Diagnostic } from "./types/diagnostic.js";

export function getActions(src: string): Array<Action> {
	const ctx = new CompileCtx();
	const lexer = new Lexer(src);
	const parser = new Parser(ctx, lexer);
	return parser.parseCompletely();
}

export function getDiagnostics(src: string): Array<Diagnostic> {
	const ctx = new CompileCtx();
	const lexer = new Lexer(src);
	const parser = new Parser(ctx, lexer);
	parser.parseCompletely();
	return ctx.diagnostics;
}

export function getInlayHints(src: string): Array<InlayHint> {
	const actions = getActions(src);

	const hints: Array<InlayHint> = [];

	actions
		.filter(action => !["CHANGE_STAT"].includes(action.type))
		.map(action => {
			for (const key of Object.keys(action)) {
				if (key === "type") continue;
				// @ts-ignore
				if (!action[key]) continue;
				hints.push({
					label: `${key}:`,
					// @ts-ignore
					span: action[key].span
				});
			}
		});

	return hints;
}

export function getSignatureHelp(src: string, pos: number) {

}
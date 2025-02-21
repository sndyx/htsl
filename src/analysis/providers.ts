import { type Diagnostic, type IrAction, Lexer, Parser } from "../parse/index.js";
import { CompileCtx } from "../context.js";
import type { InlayHint, SemanticToken } from "./entities.js";
import { SEMANTIC_DESCRIPTORS } from "./semantics.js";

function getActions(src: string): Array<IrAction> {
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

export function getTokens(src: string): SemanticToken[] {
    return getActions(src).flatMap(action => {
        const tokens: SemanticToken[] = [];
        for (const key of Object.keys(action)) {
            if (key === "type") continue;
            if (key === "span") continue;

            // @ts-ignore
            const value = action[key];

            if (value === undefined) continue;

            // @ts-ignore
            const kind = SEMANTIC_DESCRIPTORS[action.type][key];

            tokens.push({
                action: action.type,
                name: key,
                kind,
                span: value.span
            });
        }
        return tokens;
    });
}

export function getInlayHints(src: string): InlayHint[] {
    const tokens = getTokens(src);

    return tokens
        .filter(token => !["CHANGE_STAT", "CHANGE_GLOBAL_STAT", "CHANGE_TEAM_STAT"].includes(token.action))
        .map(token => {
            return { label: token.name + ":", span: token.span }
        });
}
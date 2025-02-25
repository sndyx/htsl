import { type Diagnostic, type IrAction, type IrCondition, Lexer, Parser } from "../parse/index.js";
import { CompileCtx } from "../context.js";
import type { InlayHint, SemanticToken } from "./entities.js";
import { SEMANTIC_DESCRIPTORS, type SemanticKind } from "./semantics.js";

export function getActionMetadata(src: string): Array<IrAction> {
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
    function getSemanticTokens(entity: any) {
        const tokens: SemanticToken[] = [];
        for (const key of Object.keys(entity)) {
            if (key === "type") continue;

            // @ts-ignore
            const value = entity[key];

            if (value === undefined) continue;

            // @ts-ignore
            const kind: SemanticKind = SEMANTIC_DESCRIPTORS[entity.type][key];

            if (kind === "block") {
                value.value.forEach((subAction: IrAction) => {
                    tokens.push(...getSemanticTokens(subAction));
                });
            }
            if (kind === "conditions") {
                value.value.forEach((condition: IrCondition) => {
                    tokens.push(...getSemanticTokens(condition));
                })
            }

            tokens.push({
                action: entity.type,
                name: key,
                kind,
                span: value.span
            });
        }
        return tokens;
    }

    return getActionMetadata(src).flatMap(action => {
        return getSemanticTokens(action);
    });
}

export function getInlayHints(src: string): InlayHint[] {
    const tokens = getTokens(src);

    return tokens
        .filter(token => ![
            "CHANGE_STAT", "CHANGE_GLOBAL_STAT", "CHANGE_TEAM_STAT",
            "COMPARE_STAT",
        ].includes(token.action))
        .filter(token => ![
            "ifActions", "elseActions"
        ].includes(token.name))
        .map(token => {
            return { label: token.name + ":", span: token.span }
        });
}
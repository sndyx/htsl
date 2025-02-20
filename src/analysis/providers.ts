import { type Diagnostic, Lexer, Parser, type Span } from "../parse/index.js";
import { CompileCtx } from "../context.js";
import type { InlayHint, SignatureHint } from "./entities.js";
import { ACTION_NAMES } from "../helpers.js";
import { getActions } from "../index.js";

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
        .filter(action => !["CHANGE_STAT", "CHANGE_GLOBAL_STAT", "CHANGE_TEAM_STAT"].includes(action.type))
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

export function getSignatureHelp(src: string, pos: number): SignatureHint | undefined {
    const actions = getActions(src.substring(0, pos));
    const action = actions[actions.length - 1];

    if (!action) return undefined;

    let index = 0;
    let broken = false;
    for (const key of Object.keys(action)) {
        if (key === "type") continue;

        // @ts-ignore
        if (!action[key]) {
            broken = true;
            break;
        }
        // @ts-ignore
        const span: Span = action[key].span;

        if (span.hi > pos - 1) {
            broken = true;
            break;
        }
        index++;
    }

    if (!broken) return undefined;

    return {
        action: ACTION_NAMES[action.type]!,
        parameters: Object.keys(action)
            .filter(it => it !== "type"),
        activeParameter: index
    };
}
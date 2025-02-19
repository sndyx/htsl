import { type Diagnostic, type IrAction, Lexer, Parser } from "../parse/index.js";
import { CompileCtx } from "../context.js";
import type { Completion, InlayHint, SignatureHint, SemanticToken } from "./entities.js";
import { ACTION_NAMES, ACTIONS } from "../helpers.js";
import { SEMANTIC_DESCRIPTORS, SEMANTIC_KIND_OPTIONS, type SemanticKind } from "./semantics.js";
import { span, type Span } from "../parse/span.js";
import type { Token } from "../parse/token.js";

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

export function getSignatureHelp(src: string, pos: number): SignatureHint | undefined {
    const actions = getActions(src.substring(0, pos));
    const action = actions[actions.length - 1];

    if (!action) return undefined;

    let index = 0;
    let broken = false;
    for (const key of Object.keys(action)) {
        if (key === "type" || key === "span") continue;

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
            .filter(it => it !== "type" && it !== "span"),
        activeParameter: index
    };
}

function getTokenAtPos(src: string, pos: number): Token | undefined {
    const lexer = new Lexer(src);
    while (lexer.hasNext()) {
        const token = lexer.advanceToken();
        if (token.span.lo <= pos && token.span.hi >= pos) return token;
    }
}

function getActionAtPos(src: string, pos: number): IrAction | undefined {
    const actions = getActions(src);
    for (const action of actions) {
        console.log(action.span, pos);
        if (action.span.lo <= pos && action.span.hi >= pos) return action;
    }
}

export function getCompletions(src: string, pos: number): Completion[] | undefined {
    const action = getActionAtPos(src, pos);
    if (!action) {
        const tokenSpan = getTokenAtPos(src, pos)?.span ?? span(pos, pos);
        return ACTIONS.map(option => {
            return { label: option, span: tokenSpan };
        });
    }

    const descriptor = SEMANTIC_DESCRIPTORS[action.type];

    for (const key of Object.keys(action)) {
        if (key === "type" || key === "span") continue;

        // @ts-ignore
        const value: { value: any, span: Span } = action[key];
        if (!value) {
            // @ts-ignore
            const kind: SemanticKind = descriptor[key];

            const options = SEMANTIC_KIND_OPTIONS[kind];
            if (!options) return;

            return options.map(option => {
                return { label: option, span: span(pos, pos) };
            });
        }

        if (value.span.lo <= pos && value.span.hi >= pos) {
            // @ts-ignore
            const kind: SemanticKind = descriptor[key];

            const options = SEMANTIC_KIND_OPTIONS[kind];
            if (!options) return;

            return options.map(option => {
                return { label: option, span: value.span };
            });
        }
    }
}
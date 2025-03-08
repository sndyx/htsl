import { type Diagnostic, type IrAction, type IrCondition, parse } from "../parse/";
import type { InlayHint, RenameLocation, SemanticToken, TextEdit } from "./entities.js";
import { SEMANTIC_DESCRIPTORS, type SemanticKind } from "./semantics.js";

export function getIntermediateActions(src: string): Array<IrAction> {
    const result = parse(src);

    const actions: IrAction[] = [];
    for (const holder of result.holders) {
        if (!holder.actions) continue;
        actions.push(...holder.actions.value);
    }

    return actions;
}

export function getDiagnostics(src: string): Array<Diagnostic> {
    const result = parse(src);
    return result.diagnostics;
}

export function getTokens(src: string): SemanticToken[] {
    function getSemanticTokens(entity: any) {
        const tokens: SemanticToken[] = [];
        for (const key of Object.keys(entity)) {
            if (key === "type") continue;
            if (key === "kwSpan") continue;

            // @ts-ignore
            const value = entity[key];

            if (value === undefined) continue;

            // @ts-ignore
            const kind: SemanticKind = SEMANTIC_DESCRIPTORS[entity.type][key];

            if (kind === "actions") {
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
                kwSpan: entity.kwSpan,
                name: key,
                kind,
                span: value.span,
                value: value.value
            });
        }
        return tokens;
    }

    return getIntermediateActions(src).flatMap(action => {
        return getSemanticTokens(action);
    });
}

export function getInlayHints(src: string): InlayHint[] {
    const tokens = getTokens(src);

    const count = new Map<number, number>();

    tokens.forEach(token => {
        count.set(token.span.start, (count.get(token.span.start) || 0) + 1);
    });

    return tokens
        .filter(token => count.get(token.span.start) === 1)
        .filter(token => token.kwSpan.start !== token.span.start)
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

export function resolveRename(src: string, pos: number): RenameLocation | undefined {
    const tokens = getTokens(src);

    for (const token of tokens) {
        if (["stat_name", "global_stat_name", "team_stat_name"].includes(token.kind)) {
            if (token.span.start <= pos && token.span.end >= pos) {
                return {
                    span: token.span,
                    text: token.value
                }
            }
        }
    }
}

export function getRenameLocations(src: string, pos: number, newName: string): TextEdit[] | undefined {
    const tokens = getTokens(src);

    const location = resolveRename(src, pos);
    if (!location) return;

    const edits: TextEdit[] = [];

    for (const token of tokens) {
        if (["stat_name", "global_stat_name", "team_stat_name"].includes(token.kind)) {
            if (token.value === location.text) {
                edits.push({
                    span: token.span,
                    text: newName
                });
            }
        }
    }

    return edits;
}
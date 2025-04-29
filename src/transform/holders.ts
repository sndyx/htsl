import type { PartialActionHolder } from "housing-common/src/types/partial";
import { type Span, span } from "../span";
import { edit, type TextEdit } from "./edit";
import { type IrActionHolder, irKeys } from "../ir";
import type { CodeStyle } from "./style";
import { insertActions, modifyActions } from "./actions";
import { diff } from "./diff";
import { ACTION_HOLDER_SEMANTIC_DESCRIPTORS, type SemanticKind } from "../semantics";
import { insertArgument, modifyArgument } from "./arguments";

export function modifyHolders(
    from: IrActionHolder[], to: PartialActionHolder[],
    style: CodeStyle
) {
    const edits: TextEdit[] = [];

    const diffs = diff(from, to);

    let pos = 0;
    for (const diff of diffs) {
        if (diff.type === "insert") {
            edits.push(...insertHolder(diff.to, pos, style));
            edits.push(edit(span(pos, pos), "\n"));
        } else if (diff.type === "delete") {
            pos = diff.from.span.end;
            edits.push(edit(diff.from.span, "")); // remove
        } else { // diff.type === "modify"
            pos = diff.from.span.end;
            edits.push(...modifyHolder(diff.from, diff.to, style));
        }
    }

    return edits;
}

export function insertHolder(
    holder: PartialActionHolder, pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];
    const sp = span(pos, pos);

    switch (holder.type) {
        case "UNKNOWN":
            // add no goto
            break;
        case "FUNCTION":
            edits.push(edit(sp, `goto function "${holder.name}"\n`));
            break;
        case "EVENT":
            edits.push(edit(sp, `goto event "${holder.event}"\n`));
            break;
    }

    edits.push(...insertActions(holder.actions ?? [], pos, false, style));

    return edits;
}

export function modifyHolder(
    from: IrActionHolder, to: PartialActionHolder,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    let pos = from.kwSpan.end;
    for (const property of irKeys(from)) {
        // @ts-ignore
        const kind: SemanticKind = ACTION_HOLDER_SEMANTIC_DESCRIPTORS[to.type][property];

        if (kind === "actions") {
            edits.push(...modifyActions(from.actions?.value ?? [], to.actions ?? [], pos, false, style));
            continue;
        }

        // @ts-ignore
        const fromArgument: { value: any, span: Span } = from[property];
        // @ts-ignore
        const toArgument = to[property];

        if (fromArgument !== undefined) {
            pos = from.span.end;
            edits.push(...modifyArgument(fromArgument, toArgument, kind, style));
        } else {
            edits.push(edit(span(pos, pos), " "));
            edits.push(...insertArgument(toArgument, pos, kind, style));
        }
    }

    return edits;
}
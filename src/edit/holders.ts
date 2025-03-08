import type { ActionHolder } from "housing-common/src/types";
import { span, type Span } from "../parse/span";
import { edit, type TextEdit } from "./edit";
import type { IrActionHolder } from "../parse";
import type { CodeStyle } from "./style";
import { createAction, modifyActions } from "./actions";
import { diff } from "./diff";

export function modifyHolders(
    from: IrActionHolder[], to: ActionHolder[],
    style: CodeStyle
) {
    const edits: TextEdit[] = [];

    const diffs = diff(from, to);

    let pos = 0;
    for (const diff of diffs) {
        if (diff.type === "insert") {
            edits.push(...createHolder(diff.to, span(pos, pos), style));
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

export function createHolder(
    holder: ActionHolder, span: Span,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    switch (holder.type) {
        case "UNKNOWN":
            // add no goto
            break;
        case "FUNCTION":
            edits.push(edit(span, `goto function "${holder.name}"\n`));
            break;
        case "EVENT":
            edits.push(edit(span, `goto event "${holder.event}"\n`));
            break;
    }

    for (const action of holder.actions) {
        edits.push(...createAction(action, span, style));
    }

    return edits;
}

export function modifyHolder(
    from: IrActionHolder, to: ActionHolder,
    style: CodeStyle
): TextEdit[] {
    return modifyActions(from.actions?.value ?? [], to.actions, from.kwSpan.end, false, style);
}
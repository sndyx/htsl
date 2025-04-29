import { span, type Span } from "../span";
import type { CodeStyle } from "./style";
import { edit, type TextEdit } from "./edit";
import { irKeys, type IrCondition } from "../ir";
import type { Condition } from "housing-common/src/types";
import { diff } from "./diff";
import { CONDITIONS } from "../helpers";
import { CONDITION_SEMANTIC_DESCRIPTORS } from "../semantics";
import { insertArgument, modifyArgument } from "./arguments";
import type { PartialCondition } from "housing-common/src/types/partial";

export function insertConditions(
    conditions: PartialCondition[],
    pos: number,
    style: CodeStyle
): TextEdit[] {
    return modifyConditions([], conditions, pos, style);
}

export function modifyConditions(
    from: IrCondition[], to: PartialCondition[],
    pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    const diffs = diff(from, to);

    let currentPos = pos + 1;
    for (const diff of diffs) {
        const sp = span(currentPos, currentPos);
        if (diff.type === "insert") {
            edits.push(...insertCondition(diff.to, currentPos, style));
            edits.push(edit(sp, ", "));
        } else if (diff.type === "delete") {
            currentPos = diff.from.span.end;
            edits.push(edit(diff.from.span, "")); // remove
        } else { // diff.type === "modify"
            currentPos = diff.from.span.end;
            edits.push(...modifyCondition(diff.from, diff.to, style));
        }
    }

    return edits;
}

export function insertCondition(
    condition: PartialCondition, pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];
    const sp = span(pos, pos);

    const kw = CONDITIONS[condition.type];

    if (condition.inverted === true) edits.push(edit(sp, "!"));
    edits.push(edit(sp, kw));

    for (const property of irKeys(condition)) {
        if (property === "inverted") continue; // DONT do this one

        // @ts-ignore
        const kind = CONDITION_SEMANTIC_DESCRIPTORS[condition.type][property];
        // @ts-ignore
        const argument = condition[property];

        edits.push(edit(sp, " "));
        edits.push(...insertArgument(argument, pos, kind, style));
    }

    return edits;
}

export function modifyCondition(
    from: IrCondition, to: PartialCondition,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    let pos = from.kwSpan.end;
    for (const property of irKeys(from)) {
        // @ts-ignore
        const kind = CONDITION_SEMANTIC_DESCRIPTORS[to.type][property];
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
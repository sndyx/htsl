import type { Action, ActionConditional, ActionRandom } from "housing-common/src/types";
import { span, type Span } from "../span";
import type { CodeStyle } from "./style";
import { edit, type TextEdit } from "./edit";
import { irKeys, type IrAction } from "../ir";
import { ACTION_KWS } from "../helpers";
import { insertCondition } from "./conditions";
import { diff } from "./diff";
import { ACTION_SEMANTIC_DESCRIPTORS } from "../semantics";
import { insertArgument, modifyArgument } from "./arguments";

export function insertActions(
    actions: Action[],
    pos: number, tab: boolean,
    style: CodeStyle
): TextEdit[] {
    return modifyActions([], actions, pos, tab, style);
}

export function modifyActions(
    from: IrAction[], to: Action[],
    pos: number, tab: boolean,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    const diffs = diff(from, to);

    let currentPos = pos;
    for (const diff of diffs) {
        const sp = span(currentPos, currentPos);
        if (diff.type === "insert") {
            edits.push(edit(sp, "\n"));
            if (tab) edits.push(edit(sp, style.tab));
            edits.push(...insertAction(diff.to, currentPos, style));
            // edits.push(edit(sp, "\n"));
        } else if (diff.type === "delete") {
            currentPos = diff.from.span.end;
            edits.push(edit(diff.from.span, "")); // remove
        } else { // diff.type === "modify"
            currentPos = diff.from.span.end;
            edits.push(...modifyAction(diff.from, diff.to, style));
        }
    }

    return edits;
}

export function insertAction(
    action: Action, pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];
    const sp = span(pos, pos);

    // handle special syntax
    if (action.type === "CONDITIONAL") {
        return insertActionConditional(action, pos, style);
    }
    if (action.type === "RANDOM") {
        return insertActionRandom(action, pos, style);
    }

    const kw = ACTION_KWS[action.type];

    edits.push(edit(sp, kw));

    for (const property of irKeys(action)) {
        // @ts-ignore
        const kind = ACTION_SEMANTIC_DESCRIPTORS[action.type][property];
        // @ts-ignore
        const argument = action[property];

        edits.push(edit(sp, " "));
        edits.push(...insertArgument(argument, pos, kind, style));
    }

    return edits;
}

export function modifyAction(
    from: IrAction, to: Action,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    let pos = from.kwSpan.end;
    for (const property of irKeys(to)) {
        // @ts-ignore
        const kind = ACTION_SEMANTIC_DESCRIPTORS[to.type][property];
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

function insertActionConditional(
    action: ActionConditional, pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];
    const sp = span(pos, pos);

    // conditions
    edits.push(edit(sp, "if "));
    if (!(!style.explicitConditionalAnd && !action.matchAny)) {
        edits.push(edit(sp, action.matchAny ? "or" : "and"));
    }
    edits.push(edit(sp, "("));

    const conditionEdits: TextEdit[][] = [];

    for (let i = 0; i < action.conditions.length; i++) {
        const condition = action.conditions[i];

        conditionEdits.push(insertCondition(condition, pos, style));
    }

    let length = 0;
    for (const editGroup of conditionEdits) {
        for (const edit of editGroup) {
            length += edit.text.length;
        }
    }

    const doWrap = length > style.lineLength;

    if (doWrap) edits.push(edit(sp, "\n"));
    for (const editGroup of conditionEdits) {
        edits.push(...editGroup);
        edits.push(edit(sp, ", \n"));
    }

    // if actions
    edits.push(edit(sp, ") {\n"));
    for (const ifAction of action.ifActions) {
        edits.push(edit(sp, style.tab));
        edits.push(...insertAction(ifAction, pos, style));
        edits.push(edit(sp, "\n"));
    }
    edits.push(edit(sp, "}"));

    // else actions
    if (action.elseActions.length > 0) {
        // maybe add a code style for else being on new line
        edits.push(edit(sp, " else {\n"));
        for (const elseAction of action.elseActions) {
            edits.push(edit(sp, style.tab));
            edits.push(...insertAction(elseAction, pos, style));
            edits.push(edit(sp, "\n"));
        }
        edits.push(edit(sp, "}"));
    }

    return edits;
}

function insertActionRandom(
    action: ActionRandom, pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    edits.push(edit(span(pos, pos), "random {\n"));
    edits.push(...insertActions(action.actions, pos, true, style))
    edits.push(edit(span(pos, pos), "}"));

    return edits;
}
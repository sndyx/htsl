import type { Action, ActionConditional, ActionRandom } from "housing-common/src/types";
import { span, type Span } from "../parse/span";
import type { CodeStyle } from "./style";
import { edit, type TextEdit } from "./edit";
import type { IrAction } from "../parse";
import { ACTION_KWS, irKeys } from "../helpers";
import { createCondition } from "./conditions";
import { diff } from "./diff";
import { SEMANTIC_DESCRIPTORS } from "../analysis/semantics";
import { createArgument, modifyArgument } from "./arguments";

export function createActions(
    actions: Action[],
    startPos: number, tab: boolean,
    style: CodeStyle
): TextEdit[] {
    return modifyActions([], actions, startPos, tab, style);
}

export function modifyActions(
    from: IrAction[], to: Action[],
    startPos: number, tab: boolean,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    const diffs = diff(from, to);

    let pos = startPos;
    for (const diff of diffs) {
        if (diff.type === "insert") {
            edits.push(edit(span(pos, pos), "\n"));
            if (tab) edits.push(edit(span(pos, pos), style.tab));
            edits.push(...createAction(diff.to, span(pos, pos), style));
            edits.push(edit(span(pos, pos), "\n"));
        } else if (diff.type === "delete") {
            pos = diff.from.span.end;
            edits.push(edit(diff.from.span, "")); // remove
        } else { // diff.type === "modify"
            pos = diff.from.span.end;
            edits.push(...modifyAction(diff.from, diff.to, style));
        }
    }

    return edits;
}

export function createAction(
    action: Action, span: Span,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    // handle special syntax
    if (action.type === "CONDITIONAL") {
        return createActionConditional(action, span, style);
    }
    if (action.type === "RANDOM") {
        return createActionRandom(action, span, style);
    }

    const kw = ACTION_KWS[action.type];

    edits.push(edit(span, kw));

    for (const property of irKeys(action)) {
        // @ts-ignore
        const kind = SEMANTIC_DESCRIPTORS[action.type][property];
        // @ts-ignore
        const argument = action[property];

        edits.push(edit(span, " "));
        edits.push(...createArgument(argument, span, kind, style));
    }

    return edits;
}

export function modifyAction(
    from: IrAction, to: Action,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    for (const property of irKeys(to)) {
        // @ts-ignore
        const kind = SEMANTIC_DESCRIPTORS[to.type][property];
        // @ts-ignore
        const fromArgument: { value: any, span: Span } = from[property];
        // @ts-ignore
        const toArgument = to[property];

        edits.push(...modifyArgument(fromArgument, toArgument, kind, style));
    }

    return edits;
}

function createActionConditional(
    action: ActionConditional, span: Span,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    // conditions
    edits.push(edit(span, "if "));
    if (!(!style.explicitConditionalAnd && !action.matchAny)) {
        edits.push(edit(span, action.matchAny ? "or" : "and"));
    }
    edits.push(edit(span, "("));

    const conditionEdits: TextEdit[][] = [];

    for (let i = 0; i < action.conditions.length; i++) {
        const condition = action.conditions[i];

        conditionEdits.push(createCondition(condition, span, style));
    }

    let length = 0;
    for (const editGroup of conditionEdits) {
        for (const edit of editGroup) {
            length += edit.text.length;
        }
    }

    const doWrap = length > style.lineLength;

    if (doWrap) edits.push(edit(span, "\n"));
    for (const editGroup of conditionEdits) {
        edits.push(...editGroup);
        edits.push(edit(span, ", \n"));
    }

    // if actions
    edits.push(edit(span, ") {\n"));
    for (const ifAction of action.ifActions) {
        edits.push(edit(span, style.tab));
        edits.push(...createAction(ifAction, span, style));
        edits.push(edit(span, "\n"));
    }
    edits.push(edit(span, "}"));

    // else actions
    if (action.elseActions.length > 0) {
        // maybe add a code style for else being on new line
        edits.push(edit(span, " else {\n"));
        for (const elseAction of action.elseActions) {
            edits.push(edit(span, style.tab));
            edits.push(...createAction(elseAction, span, style));
            edits.push(edit(span, "\n"));
        }
        edits.push(edit(span, "}"));
    }

    return edits;
}

function createActionRandom(
    action: ActionRandom, span: Span,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];

    edits.push(edit(span, "random {\n"));
    for (const subAction of action.actions) {
        edits.push(edit(span, style.tab));
        edits.push(...createAction(subAction, span, style));
        edits.push(edit(span, "\n"));
    }
    edits.push(edit(span, "}"));

    return edits;
}
import type { Span } from "../parse/span";
import type { CodeStyle, WrittenStyle } from "./style";
import { edit, type TextEdit } from "./edit";
import type { SemanticKind } from "../analysis/semantics";
import type { Action, Condition, Operation } from "housing-common/src/types";
import type { IrAction, IrCondition } from "../parse";
import { createActions, modifyActions } from "./actions";
import { createConditions, modifyConditions } from "./conditions";
import { OPERATION_SYMBOLS } from "../helpers";

export function modifyArgument(
    from: { value: any, span: Span }, to: any,
    kind: SemanticKind,
    style: CodeStyle
): TextEdit[] {
    if (from.value === to) return []; // do not edit

    switch (kind) {
        case "actions":
            const fromActions = from.value as IrAction[];
            const toActions = to as Action[];

            return modifyActions(fromActions, toActions, from.span.start, true, style);

        case "conditions":
            const fromConditions = from.value as IrCondition[];
            const toConditions = to as Condition[];

            return modifyConditions(fromConditions, toConditions, from.span.start, style);

        default:
            return createArgument(to, from.span, kind, style);
    }
}

export function createArgument(
    argument: any, span: Span,
    kind: SemanticKind,
    style: CodeStyle,
): TextEdit[] {
    switch (kind) {
        case "string":
            return [edit(span, `"${argument}"`)];

        case "actions": {
            const edits: TextEdit[] = [];

            const actions = argument as Action[];
            edits.push(edit(span, "{\n"));
            edits.push(...createActions(actions, span.start, true, style)); // not sure if this is good
            edits.push(edit(span, "}"));

            return edits;
        }
        case "conditions": {
            const edits: TextEdit[] = [];

            const conditions = argument as Condition[];
            edits.push(edit(span, "{\n"));
            edits.push(...createConditions(conditions, span.start, style)); // not sure if this is good
            edits.push(edit(span, "}"));

            return edits;
        }
        case "operation":
            let operation: Operation = argument;
            if (style.binOpStyle === "symbolic") {
                 return [edit(span, OPERATION_SYMBOLS[operation])];
            } else {
                return [edit(span, operation)];
            }

        case "conditional_mode":
            const matchAny = argument as boolean;

            let text = "";
            if (!(!style.explicitConditionalAnd && !matchAny)) {
                text = matchAny ? "or" : "and";
            }
            return [edit(span, text)];

        default:
            return [edit(span, argument.toString())];
    }
}

function createString(text: string, style: WrittenStyle) {
    let capitalized: string;
    if (style.capitalization === "lowercase") {
        capitalized = text.toLowerCase(); // should be lowercase by default but who knows
    } else if (style.capitalization === "uppercase") {
        capitalized = text.toUpperCase();
    } else {
        capitalized = text[0].toUpperCase() + text.slice(1).toLowerCase();
    }

    if (style.quoted) {
        return `"${capitalized}"`;
    } else {
        return capitalized;
    }
}
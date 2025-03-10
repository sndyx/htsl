import type { Span } from "../parse/span";
import type { CodeStyle } from "./style";
import type { TextEdit } from "./edit";
import type { IrCondition } from "../parse";
import type { Condition } from "housing-common/src/types";

export function insertConditions(
    conditions: Condition[],
    startPos: number,
    style: CodeStyle
): TextEdit[] {
    return modifyConditions([], conditions, startPos, style);
}

export function modifyConditions(
    from: IrCondition[], to: Condition[],
    startPos: number,
    style: CodeStyle
): TextEdit[] {


    return [];
}

export function createCondition(
    condition: Condition, span: Span,
    style: CodeStyle
): TextEdit[] {

    return [];
}

export function modifyCondition(
    from: IrCondition, to: Condition,
    style: CodeStyle
): TextEdit[] {

    return [];
}
import type { ActionInput } from "housing-common/src/actions/actions.js";
import type { Span } from "./span.js";
import type { ConditionInput } from "../../../housing-common/src/actions/conditions.js";

export type WithMeta<T> = {
    [K in keyof T]: K extends "type" ? T[K] : { value: T[K], span: Span };
};

export type IrAction = WithMeta<ActionInput>;

export type IrCondition = WithMeta<ConditionInput>;
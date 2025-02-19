import type { Action } from "housing-common/src/actions/actions.js";
import type { Span } from "./span.js";

export type WithMeta<T> = {
    [K in keyof T]: K extends "type" ? T[K] : { value: T[K], span: Span };
};

export type UnspannedIrAction = WithMeta<Action>;

export type IrAction = UnspannedIrAction & { span: Span };
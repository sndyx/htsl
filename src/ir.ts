import type { Action, ActionHolder, Condition } from "housing-common/src/types";
import type { Span } from "./span";
import type { Diagnostic } from "./parse";

type Wrap<T> = {
    value: T extends Action ? IrAction :
        T extends Condition ? IrCondition :
        T extends (infer U)[] ? WrapArray<U> :
        T;
    span: Span;
};

type WrapArray<U> = U extends Action ? IrAction[] :
    U extends Condition ? IrCondition[] :
        U extends (infer V)[] ? WrapArray<V>[] :
            U[];

export type Element = { type: any };

export type IrElement<T extends Element> = {
    type: T["type"],
    kwSpan: Span,
    span: Span,
} & {
    [K in keyof Omit<T, "type">]?: Wrap<T[K]>;
};

export type IrAction = {
    [K in Action["type"]]: IrElement<Extract<Action, { type: K }>>;
}[Action["type"]];

export type IrCondition = {
    [K in Condition["type"]]: IrElement<Extract<Condition, { type: K }>>;
}[Condition["type"]];

export type IrActionHolder = {
    [K in ActionHolder["type"]]: IrElement<Extract<ActionHolder, { type: K }>>;
}[ActionHolder["type"]];

export type ParseResult = {
    holders: IrActionHolder[],
    diagnostics: Diagnostic[],
};

function unwrapValue(value: any): any {
    // Handle null/undefined and arrays.
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) {
        return value.map(unwrapValue);
    }
    // If the value is a wrapped field, it should have { value, span }
    if (typeof value === "object") {
        if ("value" in value && "span" in value) {
            return unwrapValue(value.value);
        }
        // If it's an IR object, it has "type" and "kwSpan"
        if ("type" in value && "kwSpan" in value && "span" in value) {
            return unwrapTransform(value);
        }
    }
    // Otherwise, return as is.
    return value;
}

function unwrapTransform(ir: any): any {
    // Create the new object with the required "type" field.
    const result: any = { type: ir.type };
    // Process every other key except "type" and "kwSpan".
    for (const key in ir) {
        if (key === "type" || key === "kwSpan" || key === "span") continue;
        // Each additional field is wrapped; unwrap its content.
        result[key] = unwrapValue(ir[key]);
    }
    return result;
}

export function unwrapIr<T extends Element>(element: IrElement<T>): T {
    return unwrapTransform(element);
}
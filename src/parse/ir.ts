import type { Action, ActionHolder, Condition } from "housing-common/src/types";
import type { Span } from "./span.js";
import type { Diagnostic } from "./diagnostic.js";

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

type Transform<T extends Action | Condition | ActionHolder> = {
    type: T["type"],
    kwSpan: Span;
} & {
    [K in keyof Omit<T, "type">]?: Wrap<T[K]>;
};

export type IrAction = {
    [K in Action["type"]]: Transform<Extract<Action, { type: K }>>;
}[Action["type"]];

export type IrCondition = {
    [K in Condition["type"]]: Transform<Extract<Condition, { type: K }>>;
}[Condition["type"]];

export type IrActionHolder = {
    [K in ActionHolder["type"]]: Transform<Extract<ActionHolder, { type: K }>>;
}[ActionHolder["type"]];

export type ParseResult = {
    holders: IrActionHolder[],
    diagnostics: Diagnostic[],
};
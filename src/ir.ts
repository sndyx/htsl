import type {
    Action,
    ActionHolder,
    Condition,
} from 'housing-common/src/types';
import type { Span } from './span';
import type { Diagnostic } from './diagnostic';

type Wrap<T> = {
    value: T extends Action
        ? IrAction
        : T extends Condition
          ? IrCondition
          : T extends (infer U)[]
            ? WrapArray<U>
            : T;
    span: Span;
};

type WrapArray<U> = U extends Action
    ? IrAction[]
    : U extends Condition
      ? IrCondition[]
      : U extends (infer V)[]
        ? WrapArray<V>[]
        : U[];

export type Element = { type: string };

export type IrElement<T extends Element> = {
    type: T['type'];
    kwSpan: Span;
    span: Span;
} & {
    [K in keyof T]: K extends 'type' ? T[K] : Wrap<T[K]> | undefined;
};

export type IrAction = IrElement<Action>;
export type IrCondition = IrElement<Condition>;
export type IrActionHolder = IrElement<ActionHolder>;

export type ParseResult = {
    holders: IrActionHolder[];
    diagnostics: Diagnostic[];
};

function unwrapValue(value: any): any {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) {
        return value.map(unwrapValue);
    }
    if (typeof value === 'object') {
        if ('value' in value && 'span' in value) {
            return unwrapValue(value.value);
        }
        if ('type' in value && 'kwSpan' in value && 'span' in value) {
            return unwrapTransform(value);
        }
    }
    return value;
}

function unwrapTransform(ir: any): any {
    const result: any = { type: ir.type };

    for (const key in ir) {
        if (key === 'type' || key === 'kwSpan' || key === 'span') continue;
        result[key] = unwrapValue(ir[key]);
    }
    return result;
}

export function unwrapIr<T extends Element>(element: IrElement<T>): T {
    return unwrapTransform(element);
}

export function irKeys(value: any) {
    return Object.keys(value).filter((it) => !['type', 'kwSpan', 'span'].includes(it));
}

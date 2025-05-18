import type { Operation, Comparison, Value } from 'housing-common';
import type { CodeStyle } from './style';
import {
    OPERATION_SYMBOLS as HELPERS_OPERATION_SYMBOLS,
    COMPARISON_SYMBOLS as HELPERS_COMPARISON_SYMBOLS,
} from '../helpers';
import { withWrittenStyle } from './helpers';

const OPERATION_SYMBOLS = HELPERS_OPERATION_SYMBOLS;
const COMPARISON_SYMBOLS = HELPERS_COMPARISON_SYMBOLS;

export const OPERATION_NAMES: {
    [key in Operation]: string;
} = {
    increment: 'inc',
    decrement: 'dec',
    set: 'set',
    multiply: 'mul',
    divide: 'div',
};

export const COMPARISON_NAMES: {
    [key in Comparison]: string;
} = {
    less_than: 'less than',
    less_than_or_equals: 'less than or equals',
    equals: 'equals',
    greater_than: 'greater than',
    greater_than_or_equals: 'greater than or equals',
};

export function generateOperation(
    op: Operation,
    style: CodeStyle,
): string {
    if (style.binOpStyle === 'symbolic') {
        return OPERATION_SYMBOLS[op];
    }

    return withWrittenStyle(OPERATION_NAMES[op], style.binOpStyle);
}

export function generateComparison(
    op: Comparison,
    style: CodeStyle,
): string {
    if (style.cmpOpStyle === 'symbolic') {
        return COMPARISON_SYMBOLS[op];
    }

    return withWrittenStyle(COMPARISON_NAMES[op], style.cmpOpStyle);
}

export function generateValue(
    value: Value,
    style: CodeStyle
): string {
    return '';
}

export function generateBoolean(
    boolean: boolean,
    style: CodeStyle,
): string {
    return boolean ? 'true' : 'false';
}

export function generateString(
    string: string,
    style: CodeStyle,
): string {
    return `"${string}"`;
}
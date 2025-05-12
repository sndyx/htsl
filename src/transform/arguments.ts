import { span, type Span } from '../span';
import type { CodeStyle, WrittenStyle } from './style';
import { edit, type TextEdit } from './edit';
import type { SemanticKind } from '../semantics';
import type {
    Action,
    Comparison,
    Condition,
    Location,
    Operation,
} from 'housing-common/src/types';
import type { IrAction, IrCondition } from '../ir';
import { insertActions, modifyActions } from './actions';
import { insertConditions, modifyConditions } from './conditions';
import { COMPARISON_SYMBOLS, OPERATION_SYMBOLS } from '../helpers';

export function modifyArgument(
    from: { value: any; span: Span },
    to: any,
    kind: SemanticKind,
    style: CodeStyle
): TextEdit[] {
    if (from.value === to) return []; // do not edit

    switch (kind) {
        case 'actions':
            const fromActions = from.value as IrAction[];
            const toActions = to as Action[];

            return modifyActions(fromActions, toActions, from.span.start, true, style);

        case 'conditions':
            const fromConditions = from.value as IrCondition[];
            const toConditions = to as Condition[];

            return modifyConditions(fromConditions, toConditions, from.span.start, style);

        default:
            const edits: TextEdit[] = [];
            edits.push(edit(from.span, '')); // coerce to 1 position
            edits.push(...insertArgument(to, from.span.end, kind, style));
            return edits;
    }
}

export function insertArgument(
    argument: any,
    pos: number,
    kind: SemanticKind,
    style: CodeStyle
): TextEdit[] {
    const sp = span(pos, pos);

    if (argument === undefined || argument === null) return []; // omitted, or we have errors

    switch (kind) {
        case 'string':
            return [edit(sp, `"${argument}"`)];

        case 'actions': {
            const edits: TextEdit[] = [];

            const actions = argument as Action[];
            edits.push(edit(sp, '{\n'));
            edits.push(...insertActions(actions, pos, true, style)); // not sure if this is good
            edits.push(edit(sp, '}'));

            return edits;
        }
        case 'conditions': {
            const edits: TextEdit[] = [];

            const conditions = argument as Condition[];
            edits.push(edit(sp, '{\n'));
            edits.push(...insertConditions(conditions, pos, style)); // not sure if this is good
            edits.push(edit(sp, '}'));

            return edits;
        }
        case 'operation':
            let operation: Operation = argument;
            if (style.binOpStyle === 'symbolic') {
                return [edit(sp, OPERATION_SYMBOLS[operation])];
            } else {
                return [edit(sp, operation)];
            }
        case 'comparison':
            let comparison: Comparison = argument;
            if (style.cmpOpStyle === 'symbolic') {
                return [edit(sp, COMPARISON_SYMBOLS[comparison])];
            } else {
                return [edit(sp, comparison.replace('_', ' '))];
            }
        case 'conditional_mode':
            const matchAny = argument as boolean;

            let text = '';
            if (!(!style.explicitConditionalAnd && !matchAny)) {
                text = matchAny ? 'or' : 'and';
            }
            return [edit(sp, text)];

        case 'location':
            const location = argument as Location;

            if (location.type === 'location_custom') {
                return [edit(sp, `custom_coordinates "${location.value}"`)];
            } else if (location.type === 'location_spawn') {
                return [edit(sp, 'house_spawn')];
            } else {
                // if (location.type === "LOCATION_INVOKERS") {
                return [edit(sp, 'invokers_location')];
            }

        case 'inversion':
            const inverted = argument as boolean;

            return [edit(sp, inverted ? '!' : '')];

        default:
            return [edit(sp, argument.toString())];
    }
}

function createString(text: string, style: WrittenStyle) {
    let capitalized: string;
    if (style.capitalization === 'lowercase') {
        capitalized = text.toLowerCase(); // should be lowercase by default but who knows
    } else if (style.capitalization === 'uppercase') {
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

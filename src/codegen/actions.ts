import type { Action, actions } from 'housing-common';
import type { CodeStyle } from './style';
import { concat, error, hint, maybeQuote } from './helpers';
import { generateBoolean, generateOperation, generateString, generateValue } from './arguments';
import type { ActionKw } from '../helpers';
import { generateConditions } from './conditions';

export function generateActions(
    actions: Action[],
    style: CodeStyle,
    inBlock: boolean = false,
): string {
    let tab = inBlock ? style.tab : '';

    return tab + concat(
        actions.map(action => generateAction(action, style)),
        `\n${tab}`
    );
}

export function generateAction(
    action: Action,
    style: CodeStyle,
): string {
    if (action.type === "CONDITIONAL") {
        return generateActionConditional(action, style);
    } else if (action.type === "CHANGE_VAR") {
        return generateActionChangeVar(action, style);
    } else if (action.type === "ACTION_BAR") {
        return generateActionActionBar(action, style);
    } else if (action.type === "APPLY_INVENTORY_LAYOUT") {
        return generateActionApplyInventoryLayout(action, style);
    } else if (action.type === "GIVE_EXPERIENCE_LEVELS") {
        return '';
    } else {
        return error(`Action not implemented: ${action.type}`);
    }
}

function generateActionKw(
    keyword: ActionKw,
): string {
    return keyword;
}

function generateActionConditional(
    action: actions.ActionConditional,
    style: CodeStyle,
): string {
    let res: string[] = [];

    res.push(generateActionKw('if'));

    if (!(style.useCommonShorthands && action.matchAny === false)) {
        res.push(action.matchAny ? action.matchAny ? 'or' : 'and' : hint('?'));
    }

    res.push(action.conditions ? generateConditions(action.conditions, style) : hint('?'));
    return concat(res, ' ');
}

function generateActionActionBar(
    action: actions.ActionActionBar,
    style: CodeStyle,
): string {
    let res: string[] = [];

    res.push(generateActionKw('actionBar'));
    res.push(action.message ? generateString(action.message, style) : hint('?'));

    return concat(res, ' ');
}

function generateActionApplyInventoryLayout(
    action: actions.ActionApplyInventoryLayout,
    style: CodeStyle,
): string {
    let res: string[] = [];

    res.push(generateActionKw('applyLayout'));
    res.push(action.layout ? generateString(action.layout, style) : hint('?'));

    return concat(res, ' ');
}

const CHANGE_VAR_KWS: {
    [key: string]: ActionKw
} = {
    'player': 'var',
    'global': 'globalvar',
    'team': 'teamvar'
};

function generateActionChangeVar(
    action: actions.ActionChangeVar,
    style: CodeStyle,
): string {
    let res: string[] = [];
    const build = () => concat(res, ' ');

    res.push(action.holder ? generateActionKw(CHANGE_VAR_KWS[action.holder?.type]) : hint('?var'));
    res.push(action.var ?? hint("?"));

    if (action.holder?.type === "team") res.push(maybeQuote(action.holder.team));

    if (action.op === 'unset') {
        res.push('unset');
    } else {
        res.push(action.op ? generateOperation(action.op, style) : hint('?'));
        res.push(action.value ? generateValue(action.value, style) : hint('?'));

        if (style.useCommonShorthands && (!action.unset || !action.unset)) {
            return build(); // shorthand
        }

        res.push(action.unset ? generateBoolean(action.unset, style) : hint('?'));
    }

    return build();
}
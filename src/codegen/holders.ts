import type { ActionHolder, holders } from 'housing-common';
import type { CodeStyle } from './style';
import { concat, error, hint, maybeQuote } from './helpers';
import { generateActions } from './actions';

export function generateHolders(
    holders: ActionHolder[],
    style: CodeStyle,
): string {
    return concat(
        holders.map(holder => generateHolder(holder, style)),
        '\n'
    );
}

export function generateHolder(
    holder: ActionHolder,
    style: CodeStyle
): string {
    if (holder.type === "UNKNOWN") {
        return generateHolderUnknown(holder, style);
    } else if (holder.type === "FUNCTION") {
        return generateHolderFunction(holder, style);
    } else if (holder.type === "EVENT") {
        return generateHolderEvent(holder, style);
    } else {
        return error('Action holder not implemented');
    }
}

export function generateHolderUnknown(
    holder: holders.ActionHolderUnknown,
    style: CodeStyle,
): string {
    return generateActions(
        holder.actions ?? [],
        style
    );
}

export function generateHolderFunction(
    holder: holders.ActionHolderFunction,
    style: CodeStyle,
): string {
    const res = [];

    let holderName = holder.name ? maybeQuote(holder.name) : hint('?');

    res.push(`goto function ${holderName}`);
    res.push(''); // empty line

    res.push(generateActions(
        holder.actions ?? [],
        style
    ));

    return concat(res, '\n');
}

export function generateHolderEvent(
    holder: holders.ActionHolderEvent,
    style: CodeStyle
): string {
    const res = [];

    let eventName = holder.event ? maybeQuote(holder.event) : hint('?');

    res.push(`goto event ${eventName}`);
    res.push(''); // empty line

    res.push(generateActions(
        holder.actions ?? [],
        style
    ));

    return concat(res, '\n');
}
import type { ActionHolder } from 'housing-common';
import { type CodeStyle, DEFAULT_CODE_STYLE } from './style';
import { generateHolders } from './holders';

export function generate(
    holders: ActionHolder[],
    style: CodeStyle = DEFAULT_CODE_STYLE
): string {
    return generateHolders(holders, DEFAULT_CODE_STYLE);
}

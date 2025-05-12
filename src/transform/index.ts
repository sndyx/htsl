import type { PartialActionHolder } from 'housing-common/src/types/partial';
import { parseFromString } from '../parse';
import { modifyHolders } from './holders';
import { DEFAULT_CODE_STYLE } from './style';
import { applyEdits, type TextEdit } from './edit';

export { applyEdits, type TextEdit } from './edit';

export function transformEdits(
    holders: PartialActionHolder[],
    hintSrc: string
): TextEdit[] {
    const hint = parseFromString(hintSrc);

    return modifyHolders(hint.holders, holders, DEFAULT_CODE_STYLE);
}

export function transform(holders: PartialActionHolder[], hintSrc: string): string {
    const edits = transformEdits(holders, hintSrc);

    return applyEdits(hintSrc, edits);
}

export function generateEdits(holders: PartialActionHolder[]): TextEdit[] {
    return transformEdits(holders, '');
}

export function generate(holders: PartialActionHolder[]): string {
    return transform(holders, '');
}

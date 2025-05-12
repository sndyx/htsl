import type { PartialActionHolder } from 'housing-common/src/types/partial';
import { span } from '../span';
import { edit, type TextEdit } from './edit';
import type { IrActionHolder } from '../ir';
import type { CodeStyle } from './style';
import { insertActions, modifyActions } from './actions';
import { diff } from './diff';

export function modifyHolders(
    from: IrActionHolder[],
    to: PartialActionHolder[],
    style: CodeStyle
) {
    const edits: TextEdit[] = [];

    const diffs = diff(from, to);

    let pos = 0;
    for (const diff of diffs) {
        if (diff.type === 'insert') {
            edits.push(...insertHolder(diff.to, pos, style));
            edits.push(edit(span(pos, pos), '\n'));
        } else if (diff.type === 'delete') {
            pos = diff.from.span.end;
            edits.push(edit(diff.from.span, '')); // remove
        } else {
            // diff.type === "modify"
            pos = diff.from.span.end;
            edits.push(...modifyHolder(diff.from, diff.to, style));
        }
    }

    return edits;
}

export function insertHolder(
    holder: PartialActionHolder,
    pos: number,
    style: CodeStyle
): TextEdit[] {
    const edits: TextEdit[] = [];
    const sp = span(pos, pos);

    switch (holder.type) {
        case 'UNKNOWN':
            // add no goto
            break;
        case 'FUNCTION':
            edits.push(edit(sp, `goto function "${holder.name}"\n`));
            break;
        case 'EVENT':
            edits.push(edit(sp, `goto event "${holder.event}"\n`));
            break;
    }

    edits.push(...insertActions(holder.actions ?? [], pos, false, style));

    return edits;
}

export function modifyHolder(
    from: IrActionHolder,
    to: PartialActionHolder,
    style: CodeStyle
): TextEdit[] {
    return modifyActions(
        from.actions.value ?? [],
        to.actions ?? [],
        from.kwSpan.end,
        false,
        style
    );
}

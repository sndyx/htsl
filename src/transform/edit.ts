import type { Span } from '../span';

export type TextEdit = {
    span: Span;
    text: string;
};

export function edit(span: Span, text: string) {
    return { span, text };
}

export function applyEdits(src: string, edits: TextEdit[]): string {
    let offset = 0;

    for (const edit of edits) {
        const start = edit.span.start + offset;
        const end = edit.span.end + offset;

        src = src.slice(0, start) + edit.text + src.slice(end);

        offset += edit.text.length - (end - start);
    }

    return src;
}

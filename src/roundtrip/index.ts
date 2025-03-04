import type { ActionHolder } from "housing-common/src/types";
import { parse, unwrap } from "../parse";
import { diff } from "./diff";
import { span, type Span } from "../parse/span";
import { printAction } from "./printer";

export function roundtrip(
    actions: ActionHolder[],
    hintSrc?: string,
): string {
    const hint = parse(hintSrc ?? "");

    const a = hint.holders[0].actions!.value;
    const b = actions[0].actions;

    //console.log(a, b);

    const edits = diff(a, b);

    const seq: TextEdit[] = [];

    let lastSpanEnd = 0;

    edits.forEach(edit => {
        if (edit.type === "modify") {
            seq.push({
                span: edit.oldAction.span,
                text: printAction(edit.newAction)
            });
            lastSpanEnd = edit.oldAction.span.end;
        } else if (edit.type === "insert") {
            seq.push({
                span: span(lastSpanEnd, lastSpanEnd),
                text: "\n" + printAction(edit.newAction)
            });
        } else {
            seq.push({
                span: edit.oldAction.span,
                text: ""
            });
            lastSpanEnd = edit.oldAction.span.end;
        }
    });

    let offset = 0;
    let result = (hintSrc ?? "").split(""); // Convert to array for efficient in-place editing

    for (const edit of seq) {
        const start = edit.span.start + offset;
        const end = edit.span.end + offset;

        result.splice(start, end - start, ...edit.text);

        offset += edit.text.length - (end - start);
    }

    return result.join("");
}

type TextEdit = {
    span: Span,
    text: string
};

const actions = parse(`
stat x = 5
stat y = 10

chat "Hello!"

stat z = 5
`).holders.map(unwrap);

const hintText = `
stat x = 5
// my weird personal indentation:
  stat y = 10

// we are doing something here
stat z = 5
`;

const result = roundtrip(actions, hintText);

console.log(result);


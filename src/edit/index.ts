import type { ActionHolder } from "housing-common/src/types";
import { parse, unwrap } from "../parse";
import { modifyHolders } from "./holders";
import { DEFAULT_CODE_STYLE } from "./style";
import { applyEdits } from "./edit";

export function roundtrip(
    holders: ActionHolder[],
    hintSrc?: string,
): string {
    const hint = parse(hintSrc ?? "");

    const edits = modifyHolders(hint.holders, holders, DEFAULT_CODE_STYLE);

    return applyEdits(hintSrc ?? "", edits);
}

const actions = parse(`
stat z = "%stat.player/x%"

if and () {
    stat y = 10
    
    chat "Hello world!"
}
chat "Hello guys"

chat "Goodbye, now :("

if () { chat "cya" }
`).holders.map(unwrap);

const hintText = `
stat z = /* comment */ 10

chat      "Goodbye, now :("

if () { chat "bye bye" }
`;

const result = roundtrip(actions, hintText);

console.log(result);


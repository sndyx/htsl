import type { ActionHolder } from "housing-common/src/types";
import { parse } from "../parse";
import { modifyHolders } from "./holders";
import { DEFAULT_CODE_STYLE } from "./style";
import { applyEdits } from "./edit";
import { unwrapIr } from "../ir";

export function transform(
    holders: ActionHolder[],
    hintSrc?: string,
): string {
    const hint = parse(hintSrc ?? "");

    const edits = modifyHolders(hint.holders, holders, DEFAULT_CODE_STYLE);

    return applyEdits(hintSrc ?? "", edits);
}

export function generate(
    holders: ActionHolder[],
): string {
    return transform(holders, undefined);
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
`).holders.map(unwrapIr) as ActionHolder[];

const hintText = `
stat z = /* comment */ 10

chat      "Goodbye, now :("

if () { chat "bye bye" }
`;

const result = transform(actions, hintText);

console.log(result);


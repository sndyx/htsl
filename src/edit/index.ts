import type { ActionHolder } from "housing-common/src/types";
import { parse, unwrapIr } from "../parse";
import { modifyHolders } from "./holders";
import { DEFAULT_CODE_STYLE } from "./style";
import { applyEdits } from "./edit";

export function roundtrip(
    holders: ActionHolder[],
    hintSrc?: string,
): string {
    const hint = parse(hintSrc ?? "");

    const edits = modifyHolders(hint.holders, holders, DEFAULT_CODE_STYLE);

    console.log(edits);

    return applyEdits(hintSrc ?? "", edits);
}

const actions = parse(`
stat z = "%stat.player/x%"
`).holders.map(it => unwrapIr<ActionHolder>(it));

const hintText = `
st
`.replace("\r", "");

const result = roundtrip(actions, hintText);

console.log("===");
console.log(hintText);
console.log("===")

console.log("")

console.log("===");
console.log(result);
console.log("===")


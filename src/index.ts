import { type Diagnostic, parse } from "./parse";
import type { IrAction } from "./ir";

const result = parse(`
stat x = 5
stat y = stat y

doTwice "Hi!"
`).holders[0].actions?.value!;

console.log(result);

export function getActions(src: string): IrAction[] {
    return parse(src).holders.flatMap(it => it.actions!.value);
}

export function getDiagnostics(src: string): Diagnostic[] {
    return parse(src).diagnostics;
}
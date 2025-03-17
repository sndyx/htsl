import { parseFromString } from "./parse";
import { unwrapIr } from "./ir";
import type { Diagnostic } from "./diagnostic";
import type { ActionHolder } from "housing-common/src/types";

export * from "./span";
export * from "./ir";
export type { Diagnostic, DiagnosticLevel } from "./diagnostic";

export * as parse from "./parse";
export * as transform from "./transform";

export function actions(src: string): ActionHolder[] {
    return parseFromString(src).holders.map(unwrapIr) as ActionHolder[];
}

export function diagnostics(src: string): Diagnostic[] {
    return parseFromString(src).diagnostics;
}
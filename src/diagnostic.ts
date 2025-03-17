import type { Span } from "./span.js";

type Level = "bug" | "error" | "warning" | "info";

export type Diagnostic = {
    message: string,
    level: Level,
    span: Span,
};

export function error(
    message: string, range: Span
): Diagnostic {
    return { message, level: "error", span: range };
}

export function warn(
    message: string, range: Span
): Diagnostic {
    return { message, level: "warning", span: range };
}
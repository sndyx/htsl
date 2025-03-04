import type { Span } from "./span.js";

type Level = "bug" | "error" | "warning" | "info";

export type Diagnostic = {
    message: string,
    level: Level,
    span: Span,
};

export function error(
    message: string, span: Span
): Diagnostic {
    return { message, level: "error", span };
}

export function warn(
    message: string, span: Span
): Diagnostic {
    return { message, level: "warning", span };
}
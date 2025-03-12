import type { Span } from "../span.js";

type Level = "bug" | "error" | "warning" | "info";

export type Diagnostic = {
    message: string,
    level: Level,
    range: Span,
};

export function error(
    message: string, range: Span
): Diagnostic {
    return { message, level: "error", range };
}

export function warn(
    message: string, range: Span
): Diagnostic {
    return { message, level: "warning", range };
}
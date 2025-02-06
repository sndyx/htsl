import type { Span } from "./span.js";

export class Diagnostic extends Error {

    level: Level;
    span?: Span;

    constructor(
        message: string,
        level: Level,
        span?: Span
    ) {
        super(message);
        this.level = level;
        this.span = span;
    }

}

export type Level = "bug" | "error" | "warning" | "info";

export function error(message: string, span: Span): Diagnostic {
    return new Diagnostic(message, "error", span);
}
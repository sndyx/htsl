import type { Span } from "./meta.js";

export class Diagnostic extends Error {
    level: Level;
    span?: Span;

    constructor(message: string, level: Level, span?: Span) {
        super(message);
        this.level = level;
        this.span = span;
    }

    static bug(message: string, span?: Span) {
        return new Diagnostic(message, "bug", span);
    }

    static error(message: string, span?: Span) {
        return new Diagnostic(message, "error", span);
    }

    withSpan(span: Span): Diagnostic {
        this.span = span;
        return this;
    }
}

export type Level = "bug" | "error" | "warning" | "info";
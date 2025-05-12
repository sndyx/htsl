import type { Span } from './span.js';

export type DiagnosticLevel = 'bug' | 'error' | 'warning' | 'info';

export type Diagnostic = {
    message: string;
    level: DiagnosticLevel;
    span: Span;
};

export function error(message: string, span: Span): Diagnostic {
    return { message, level: 'error', span };
}

export function warn(message: string, span: Span): Diagnostic {
    return { message, level: 'warning', span };
}

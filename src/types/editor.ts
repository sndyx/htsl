import type { Span } from "./span.js";

export type InlayHint = {
    label: string,
    span: Span
}

export type SignatureHint = {
    action: string,
    parameters: Array<string>,
    activeParameter: number
}
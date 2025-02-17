import type { Span } from "../parse/index.js";

export type InlayHint = {
    label: string,
    span: Span
};

export type SignatureHint = {
    action: string,
    parameters: Array<string>,
    activeParameter: number
};
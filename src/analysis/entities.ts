import type { Span } from "../parse/span.js";
import type { SemanticKind } from "./semantics.js";
import type { IrAction } from "../parse";

export type SemanticToken = {
    action: IrAction["type"],
    kwSpan: Span,
    name: string,
    kind: SemanticKind,
    span: Span,
    value: any,
}

export type InlayHint = {
    label: string,
    span: Span
};

export type SignatureHint = {
    action: string,
    parameters: string[],
    activeParameter: number
};

export type Completion = {
    label: string,
    span: Span,
};

export type RenameLocation = {
    span: Span,
    text: string,
};

export type TextEdit = {
    span: Span,
    text: string,
};
import type { Span } from "../parse/span.js";
import type { SemanticKind } from "./semantics.js";
import type { Action } from "housing-common/src/actions/actions.js";

export type SemanticToken = {
    action: Action["type"],
    name: string,
    kind: SemanticKind,
    span: Span,
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
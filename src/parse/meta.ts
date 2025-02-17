export type Span = {
    lo: number,
    hi: number
};

export function span(lo: number, hi: number) {
    return { lo, hi };
}

export type SemanticType =
    | "stat_name"
    | "global_stat_name"
    | "team_stat_name"
    | "team_name"
    | "amount"
    | "mode"
    | "string"
    | "keyword"
    | "conditions"
    | "block";

export type WithMeta<T> = {
    [K in keyof T]: K extends "type" ? T[K] : { value: T[K], span: Span, type: SemanticType };
};
export type Span = {
    lo: number,
    hi: number
};

export type Spanned<T> = {
    value: T,
    span: Span
};

export function span(lo: number, hi: number) {
    return { lo, hi };
}

export function spanned<T>(value: T, span: Span) {
    return { value, span };
}
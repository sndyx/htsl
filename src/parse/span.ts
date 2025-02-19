export type Span = {
    lo: number,
    hi: number
};

export function span(lo: number, hi: number) {
    return { lo, hi };
}
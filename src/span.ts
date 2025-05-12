export type Span = {
    start: number;
    end: number;
};

export function span(start: number, end: number) {
    return { start, end };
}

export type Span = {
    lo: number,
    hi: number
};

export function span(lo: number, hi: number) {
    return { lo, hi };
}

export type Spanned<T> = {
    [K in keyof T]: K extends "type" ? T[K] : { value: T[K], span: Span };
};

export function unspanned<T>(spanned: Spanned<T>): T {
    const result: any = {};

    for (const key in spanned) {
        if (key === "type") {
            result[key] = spanned[key];
        } else {
            result[key] = (spanned[key] as { value: any }).value;
        }
    }

    return result as T;
}
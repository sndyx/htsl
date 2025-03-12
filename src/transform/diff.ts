import type { Element, IrElement } from "../ir";

export type Diff<T extends Element> = DiffInsert<T> | DiffDelete<T> | DiffModify<T>;

type DiffInsert<T extends Element> = {
    type: "insert",
    to: T
}

type DiffDelete<T extends Element> = {
    type: "delete",
    from: IrElement<T>
}

type DiffModify<T extends Element> = {
    type: "modify",
    from: IrElement<T>,
    to: T
};

export function diff<T extends Element>(a: IrElement<T>[], b: T[]): Diff<T>[] {
    const seq: Diff<T>[] = [];
    const { trace, offset } = shortestEdit(a, b);
    let x = a.length;
    let y = b.length;

    for (let d = trace.length - 1; d >= 0; d--) {
        const v = trace[d];
        const k = x - y;
        let prevK: number;

        if (k === -d || (k !== d && v[k - 1 + offset] < v[k + 1 + offset])) {
            prevK = k + 1;
        } else {
            prevK = k - 1;
        }
        const prevX = v[prevK + offset];
        const prevY = prevX - prevK;

        while (x > prevX && y > prevY) {
            seq.unshift({
                type: "modify",
                from: a[x - 1],
                to: b[y - 1],
            });
            x--;
            y--;
        }

        if (d > 0) {
            if (x === prevX) {
                seq.unshift({ type: "insert", to: b[prevY] });
            } else {
                seq.unshift({ type: "delete", from: a[prevX] });
            }
        }

        x = prevX;
        y = prevY;
    }

    return seq;
}

function shortestEdit<T extends Element>(a: IrElement<T>[], b: T[]): { trace: number[][]; offset: number } {
    const n = a.length;
    const m = b.length;
    const max = n + m;
    const offset = max;

    const v = new Array<number>(max * 2 + 1).fill(0);
    const trace: number[][] = [];

    v[1 + offset] = 0;

    for (let d = 0; d <= max; d++) {
        trace.push([...v]);

        for (let k = -d; k <= d; k += 2) {
            const kOffset = k + offset;
            let x: number;
            if (k === -d || (k !== d && v[kOffset - 1] < v[kOffset + 1])) {
                x = v[kOffset + 1];
            } else {
                x = v[kOffset - 1] + 1;
            }
            let y = x - k;

            while (x < n && y < m && a[x].type === b[y].type) {
                x++;
                y++;
            }
            v[kOffset] = x;

            if (x >= n && y >= m) {
                return { trace, offset };
            }
        }
    }

    throw new Error("No diff path found");
}
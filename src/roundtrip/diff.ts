import type { IrAction } from "../parse";
import type { Action } from "housing-common/src/types";

export type Edit = EditInsert | EditDelete | EditModify;

type EditInsert = {
    type: "insert",
    newAction: Action
}

type EditDelete = {
    type: "delete",
    oldAction: IrAction
}

type EditModify = {
    type: "modify",
    oldAction: IrAction,
    newAction: Action
};

export function diff(a: IrAction[], b: Action[]): Edit[] {
    const seq: Edit[] = [];
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
                oldAction: a[x - 1],
                newAction: b[y - 1],
            });
            x--;
            y--;
        }

        if (d > 0) {
            if (x === prevX) {
                seq.unshift({ type: "insert", newAction: b[prevY] });
            } else {
                seq.unshift({ type: "delete", oldAction: a[prevX] });
            }
        }

        x = prevX;
        y = prevY;
    }

    return seq;
}

function shortestEdit(a: IrAction[], b: Action[]): { trace: number[][]; offset: number } {
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
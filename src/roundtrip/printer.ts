import type { Action } from "housing-common/src/types/";
import { ACTION_KWS } from "../helpers.js";

export function printAction(action: Action): string {
    let res = ACTION_KWS[action.type];

    const fields = Object.keys(action).filter(it => it !== "type");

    for (let i = 0; i < fields.length; i++) {
        res += " ";
        // @ts-ignore
        res += action[fields[i]];
    }

    return res;
}
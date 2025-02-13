import type { Spanned } from "../types/span.js";

export type Action = ActionChangeHealth | ActionChangeStat | ActionTitle | ActionMessage;

export type Mode = "increment" | "decrement" | "set" | "multiply" | "divide";
export type Amount = bigint | string;

export type ActionChangeHealth = {
    type: "CHANGE_HEALTH",
    mode?: Spanned<Mode>,
    health?: Spanned<Amount>
};

export type ActionChangeStat = {
    type: "CHANGE_STAT",
    stat?: Spanned<string>
    mode?: Spanned<Mode>,
    amount?: Spanned<Amount>
}

export type ActionTitle = {
    type: "TITLE",
    title?: Spanned<string>,
    subtitle?: Spanned<string>,
    fadein?: Spanned<bigint>,
    stay?: Spanned<bigint>,
    fadeout?: Spanned<bigint>
}

export type ActionMessage = {
    type: "MESSAGE",
    message?: Spanned<string>,
}
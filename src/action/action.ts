import type { Spanned } from "../types/span.js";

export type Action =
    | ActionChangeHealth
    | ActionChangeStat
    | ActionTitle
    | ActionMessage;

export type Mode = "increment" | "decrement" | "set" | "multiply" | "divide";
export type Amount = bigint | string;

type Param<T> = Spanned<T> | undefined;

export type ActionChangeHealth = {
    type: "CHANGE_HEALTH",
    mode: Param<Mode>,
    health: Param<Amount>,
};

export type ActionChangeStat = {
    type: "CHANGE_STAT",
    stat: Param<string>
    mode: Param<Mode>,
    amount: Param<Amount>
}

export type ActionTitle = {
    type: "TITLE",
    title: Param<string>,
    subtitle: Param<string>,
    fadein: Param<bigint>,
    stay: Param<bigint>,
    fadeout: Param<bigint>
}

export type ActionMessage = {
    type: "MESSAGE",
    message: Param<string>,
}
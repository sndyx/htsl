export type Action =
    | ActionChangeHealth
    | ActionChangeStat
    | ActionChangeTeamStat
    | ActionChangeGlobalStat
    | ActionTitle
    | ActionMessage
    | ActionConditional;

export type Mode = "increment" | "decrement" | "set" | "multiply" | "divide";
export type Amount = bigint | string;

export type ActionChangeHealth = {
    type: "CHANGE_HEALTH",
    mode?: Mode,
    health?: Amount,
};

export type ActionChangeStat = {
    type: "CHANGE_STAT",
    stat?: string
    mode?: Mode,
    amount?: Amount
};

export type ActionChangeGlobalStat = {
    type: "CHANGE_GLOBAL_STAT",
    stat?: string
    mode?: Mode,
    amount?: Amount
};

export type ActionChangeTeamStat = {
    type: "CHANGE_TEAM_STAT",
    stat?: string
    team?: string
    mode?: Mode,
    amount?: Amount
};

export type ActionTitle = {
    type: "TITLE",
    title?: string,
    subtitle?: string,
    fadein?: bigint,
    stay?: bigint,
    fadeout?: bigint
};

export type ActionMessage = {
    type: "MESSAGE",
    message?: string,
};

export type ActionConditional = {
    type: "CONDITIONAL",
    mode?: boolean,
    conditions?: Array<string>,
    ifActions?: Array<Action>,
    elseActions?: Array<Action>,
}
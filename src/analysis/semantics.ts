import type { Action } from "housing-common/src/actions/actions.js";
import type { Condition } from "housing-common/src/actions/conditions.js";
import { ACTIONS } from "../helpers.js";

export type SemanticKind =
    | "stat_name"
    | "global_stat_name"
    | "team_stat_name"
    | "team_name"
    | "amount"
    | "operator"
    | "comparison"
    | "string"
    | "boolean"
    | "number"
    | "conditional_mode"
    | "conditions"
    | "block"
    | "location"
    | "gamemode";

const CONDITION_SEMANTIC_DESCRIPTORS: {
    [K in Condition["type"]]: {
        [key in keyof Omit<Extract<Condition, { type: K }>, "type">]-?: SemanticKind
    }
} = {
    COMPARE_STAT: {
        stat: "stat_name",
        op: "comparison",
        amount: "amount"
    },
    REQUIRED_GAMEMODE: {
        gamemode: "gamemode"
    }
}

const ACTION_SEMANTIC_DESCRIPTORS: {
    [K in Action["type"]]: {
        [key in keyof Omit<Extract<Action, { type: K }>, "type">]-?: SemanticKind
    }
} = {
    CONDITIONAL: {
        matchAny: "conditional_mode",
        conditions: "conditions",
        ifActions: "block",
        elseActions: "block"
    },
    SET_GROUP: {
        group: "string",
        demotionProtection: "boolean"
    },
    KILL: {},
    HEAL: {},
    TITLE: {
        title: "string",
        subtitle: "string",
        fadein: "number",
        stay: "number",
        fadeout: "number"
    },
    ACTION_BAR: {
        message: "string"
    },
    RESET_INVENTORY: {},
    CHANGE_MAX_HEALTH: {
        op: "operator",
        amount: "amount",
        heal: "boolean"
    },
    CHANGE_STAT: {
        stat: "stat_name",
        op: "operator",
        amount: "amount"
    },
    CHANGE_GLOBAL_STAT: {
        stat: "global_stat_name",
        op: "operator",
        amount: "amount"
    },
    CHANGE_TEAM_STAT: {
        stat: "team_stat_name",
        team: "team_name",
        op: "operator",
        amount: "amount"
    },
    CHANGE_HEALTH: {
        op: "operator",
        amount: "amount"
    },
    MESSAGE: {
        message: "string"
    },
    RANDOM: {
        actions: "block"
    },
    SET_VELOCITY: {
        x: "number",
        y: "number",
        z: "number"
    },
    TELEPORT: {
        location: "location"
    },
    EXIT: {}
}

export const SEMANTIC_DESCRIPTORS = {
    ...ACTION_SEMANTIC_DESCRIPTORS,
    ...CONDITION_SEMANTIC_DESCRIPTORS
};

export const SEMANTIC_KIND_OPTIONS: {
    [key: string]: string[]
} = {
    "action": ACTIONS,
    "mode": [
        "set", "increment", "decrement", "multiply", "divide",
        "inc", "dec", "mul", "div",
    ],
    "conditional_mode": ["and", "or"],
    "amount": []
};
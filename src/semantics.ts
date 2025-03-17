import type { Action, Condition } from "housing-common/src/types";

export type SemanticKind =
    | "stat_name"
    | "global_stat_name"
    | "team_stat_name"
    | "team_name"
    | "amount"
    | "operation"
    | "comparison"
    | "string"
    | "boolean"
    | "number"
    | "conditional_mode"
    | "conditions"
    | "actions"
    | "location"
    | "gamemode"
    | "item"
    | "potion"
    | "lobby";

export const CONDITION_SEMANTIC_DESCRIPTORS: {
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
    },
    COMPARE_DAMAGE: {
        op: "comparison",
        amount: "amount"
    }
}

export const ACTION_SEMANTIC_DESCRIPTORS: {
    [K in Action["type"]]: {
        [key in keyof Omit<Extract<Action, { type: K }>, "type">]-?: SemanticKind
    }
} = {
    CONDITIONAL: {
        matchAny: "conditional_mode",
        conditions: "conditions",
        ifActions: "actions",
        elseActions: "actions"
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
        op: "operation",
        amount: "amount",
        heal: "boolean"
    },
    CHANGE_STAT: {
        stat: "stat_name",
        op: "operation",
        amount: "amount"
    },
    CHANGE_GLOBAL_STAT: {
        stat: "global_stat_name",
        op: "operation",
        amount: "amount"
    },
    CHANGE_TEAM_STAT: {
        stat: "team_stat_name",
        team: "team_name",
        op: "operation",
        amount: "amount"
    },
    CHANGE_HEALTH: {
        op: "operation",
        amount: "amount"
    },
    MESSAGE: {
        message: "string"
    },
    RANDOM: {
        actions: "actions"
    },
    SET_VELOCITY: {
        x: "number",
        y: "number",
        z: "number"
    },
    TELEPORT: {
        location: "location"
    },
    EXIT: {},
    CANCEL_EVENT: {},
    GIVE_ITEM: {
        replace: "boolean",
        item: "item",
        allowMultiple: "boolean",
        slot: "number"
    },
    REMOVE_ITEM: {
        item: "item"
    },
    APPLY_POTION_EFFECT: {
        effect: "potion",
        duration: "number",
        level: "number",
        override: "boolean",
        showIcon: "boolean"
    },
    CLEAR_POTION_EFFECTS: {},
    GIVE_EXPERIENCE_LEVELS: {
        amount: "amount"
    },
    SEND_TO_LOBBY: {
        lobby: "lobby"
    },
    FAIL_PARKOUR: {
        message: "string"
    }
}
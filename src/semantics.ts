import type { Action, ActionHolder, Condition } from "housing-common/src/types";

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
    | "lobby"
    | "enchantment"
    | "sound"
    | "inversion"
    | "placeholder"
    | "region_name"
    | "permission"
    | "item_amount"
    | "item_property"
    | "item_location"
    | "group_name"
    | "function_name"
    | "event";

export const ACTION_HOLDER_SEMANTIC_DESCRIPTORS: {
    [K in ActionHolder["type"]]: {
        [key in keyof Omit<Extract<ActionHolder, { type: K }>, "type">]-?: SemanticKind
    }
} = {
    UNKNOWN: {
        actions: "actions"
    },
    FUNCTION: {
        name: "function_name",
        actions: "actions"
    },
    EVENT: {
        event: "event",
        actions: "actions"
    }
}

export const CONDITION_SEMANTIC_DESCRIPTORS: {
    [K in Condition["type"]]: {
        [key in keyof Omit<Extract<Condition, { type: K }>, "type">]-?: SemanticKind
    }
} = {
    COMPARE_HEALTH: {
        op: "comparison",
        amount: "amount",
        inverted: "inversion",
    },
    COMPARE_HUNGER: {
        op: "comparison",
        amount: "amount",
        inverted: "inversion",
    },
    COMPARE_MAX_HEALTH: {
        op: "comparison",
        amount: "amount",
        inverted: "inversion",
    },
    COMPARE_PLACEHOLDER: {
        placeholder: "placeholder",
        op: "comparison",
        amount: "amount",
        inverted: "inversion",
    },
    IS_DOING_PARKOUR: {
        inverted: "boolean"
    },
    IS_FLYING: {
        inverted: "boolean"
    },
    IS_IN_REGION: {
        inverted: "boolean",
        region: "region_name"
    },
    IS_SNEAKING: {
        inverted: "boolean"
    },
    REQUIRE_GROUP: {
        inverted: "boolean",
        group: "group_name",
        includeHigherGroups: "boolean",
    },
    REQUIRE_ITEM: {
        inverted: "boolean",
        item: "item",
        amount: "item_amount",
        whatToCheck: "item_property",
        whereToCheck: "item_location",
    },
    REQUIRE_PERMISSION: {
        inverted: "boolean",
        permission: "permission"
    },
    REQUIRE_POTION_EFFECT: {
        inverted: "boolean",
        effect: "potion"
    },
    REQUIRE_TEAM: {
        inverted: "boolean",
        team: "team_name"
    },
    COMPARE_GLOBAL_STAT: {
        amount: "amount",
        stat: "global_stat_name",
        op: "comparison",
        inverted: "inversion"
    },
    COMPARE_TEAM_STAT: {
        amount: "amount",
        stat: "team_stat_name",
        op: "comparison",
        team: "team_name",
        inverted: "inversion"
    },
    COMPARE_STAT: {
        stat: "stat_name",
        op: "comparison",
        amount: "amount",
        inverted: "inversion"
    },
    REQUIRE_GAMEMODE: {
        gamemode: "gamemode",
        inverted: "inversion"
    },
    COMPARE_DAMAGE: {
        op: "comparison",
        amount: "amount",
        inverted: "inversion"
    }
}

export const ACTION_SEMANTIC_DESCRIPTORS: {
    [K in Action["type"]]: {
        [key in keyof Omit<Extract<Action, { type: K }>, "type">]-?: SemanticKind
    }
} = {
    APPLY_INVENTORY_LAYOUT: {
        layout: "string"
    },
    CHANGE_HUNGER: {
        amount: "operation",
        op: "amount"
    },
    DROP_ITEM: {
        location: "location",
        item: "item",
        dropNaturally: "boolean",
        disableMerging: "boolean",
        prioritizePlayer: "boolean",
        inventoryFallback: "boolean"
    },
    ENCHANT_HELD_ITEM: {
        enchant: "enchantment",
        level: "number"
    },
    FUNCTION: {
        function: "function_name",
        global: "boolean"
    },
    LAUNCH: {
        location: "location",
        strength: "amount"
    },
    PAUSE: {
        ticks: "amount"
    },
    PLAY_SOUND: {
        location: "location",
        sound: "sound",
        volume: "number",
        pitch: "number"
    },
    SET_COMPASS_TARGET: {
        location: "location"
    },
    SET_GAMEMODE: {
        gamemode: "gamemode"
    },
    SET_MENU: {
        menu: "string"
    },
    SET_TEAM: {
        team: "team_name"
    },
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
        replaceExisting: "boolean",
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

export const SEMANTIC_KIND_OPTIONS: {
    [K in SemanticKind]: string[] | undefined
} = {
    string: undefined,
    number: undefined,
    boolean: ["true", "false"],
    stat_name: undefined,
    global_stat_name: undefined,
    team_stat_name: undefined,
    team_name: undefined,
    amount: undefined,
    operation: ["+=", "-=", "=", "*=", "/="],
    comparison: [">", ">=", "=", "<", "<="],
    conditional_mode: ["and", "or"],
    conditions: undefined,
    actions: undefined,
    location: undefined,
    gamemode: ["creative", "survival", "adventure"],
    item: undefined,
    potion: undefined,
    lobby: undefined,
    enchantment: undefined,
    sound: undefined,
    inversion: undefined,
    placeholder: undefined,
    region_name: undefined,
    permission: undefined,
    item_amount: undefined,
    item_property: undefined,
    item_location: undefined,
    group_name: undefined,
    function_name: undefined,
    event: undefined
}
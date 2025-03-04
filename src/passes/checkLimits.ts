import { error, type IrAction, type ParseResult } from "../parse";
import { ACTION_KWS } from "../helpers";

export function checkLimits(
    result: ParseResult
) {
    for (const holder of result.holders) {
        if (!holder.actions) continue;
        checkActionLimits(result, holder.actions.value);
    }
}

const ACTION_LIMITS: {
    [key in IrAction["type"]]: number
} = {
    APPLY_POTION_EFFECT: 0,
    CLEAR_POTION_EFFECTS: 0,
    FAIL_PARKOUR: 0,
    GIVE_EXPERIENCE_LEVELS: 0,
    GIVE_ITEM: 0,
    REMOVE_ITEM: 0,
    SEND_TO_LOBBY: 0,

    CONDITIONAL: 15,
    SET_GROUP: 1,
    KILL: 1,
    HEAL: 5,
    TITLE: 5,
    ACTION_BAR: 5,
    RESET_INVENTORY: 1,
    CHANGE_MAX_HEALTH: 5,
    CHANGE_STAT: 10,
    CHANGE_GLOBAL_STAT: 10,
    CHANGE_TEAM_STAT: 10,
    CHANGE_HEALTH: 5,
    MESSAGE: 20,
    RANDOM: 5,
    SET_VELOCITY: 5,
    TELEPORT: 5,
    EXIT: 1,
    CANCEL_EVENT: 1
}

function checkActionLimits(
    result: ParseResult,
    actions: IrAction[]
) {
    const limits = structuredClone(ACTION_LIMITS);

    for (const action of actions) {
        if (limits[action.type] <= 0) {
            const message = `Limit of ${ACTION_LIMITS[action.type]} ${ACTION_KWS[action.type]} actions exceeded`
            result.diagnostics.push(error(message, action.kwSpan));
        }

        limits[action.type] -= 1;
    }

    for (const action of actions) {
        if (action.type === "CONDITIONAL") {
            checkActionLimits(result, action.ifActions?.value ?? []);
            checkActionLimits(result, action.elseActions?.value ?? []);
        } else if (action.type === "RANDOM") {
            checkActionLimits(result, action.actions?.value ?? []);
        }
    }
}
import type { Parser } from "./parser.js";
import type { IrAction } from "../ir.js";
import { error } from "../diagnostic.js";
import { parseCondition } from "./conditions.js";
import { span } from "../span";
import {
    parseAmount, parseEnchantment, parseGamemode,
    parseInventorySlot, parseLobby,
    parseLocation,
    parseOperation,
    parsePotionEffect,
    parseSound,
    parseStatName
} from "./arguments";
import { ACTION_SEMANTIC_DESCRIPTORS } from "../semantics";
import type { ActionKw } from "../helpers";

export function parseAction(p: Parser): IrAction {
    function eatKw(kw: ActionKw): boolean {
        return p.eatIdent(kw);
    }

    if (eatKw("if")) {
        return parseActionConditional(p);
    } else if (eatKw("changePlayerGroup")) {
        return parseActionSetGroup(p);
    } else if (eatKw("kill")) {
        return { type: "KILL", kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("fullHeal")) {
        return { type: "HEAL", kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("title")) {
        return parseActionTitle(p);
    } else if (eatKw("actionBar")) {
        return parseActionActionBar(p);
    } else if (eatKw("resetInventory")) {
        return { type: "RESET_INVENTORY", kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("maxHealth")) {
        return parseActionChangeMaxHealth(p);
    } else if (eatKw("giveItem")) {
        return parseActionGiveItem(p)
    } else if (eatKw("removeItem")) {
        return parseActionRemoveItem(p);
    } else if (eatKw("chat")) {
        return parseActionMessage(p);
    } else if (eatKw("applyPotion")) {
        return parseActionApplyPotionEffect(p);
    } else if (eatKw("clearEffects")) {
        return { type: "CLEAR_POTION_EFFECTS", kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("xpLevel")) {
        return parseActionGiveExperienceLevels(p);
    } else if (eatKw("lobby")) {
        return parseActionSendToLobby(p);
    } else if (eatKw("stat")) {
        return parseActionChangeStat(p);
    } else if (eatKw("globalstat")) {
        return parseActionChangeGlobalStat(p);
    } else if (eatKw("tp")) {
        return parseActionTeleport(p);
    } else if (eatKw("failParkour")) {
        return parseActionFailParkour(p);
    } else if (eatKw("sound")) {
        return parseActionPlaySound(p);
    } else if (eatKw("compassTarget")) {
        return parseActionSetCompassTarget(p);
    } else if (eatKw("gamemode")) {
        return parseActionSetGamemode(p);
    } else if (eatKw("changeHealth")) {
        return parseActionChangeHealth(p);
    } else if (eatKw("hungerLevel")) {
        return parseActionChangeHunger(p);
    } else if (eatKw("random")) {
        return parseActionRandom(p);
    } else if (eatKw("function")) {
        return parseActionFunction(p);
    } else if (eatKw("applyLayout")) {
        return parseActionApplyInventoryLayout(p);
    } else if (eatKw("enchant")) {
        return parseActionEnchantHeldItem(p);
    } else if (eatKw("pause")) {
        return parseActionPause(p);
    } else if (eatKw("setTeam")) {
        return parseActionSetTeam(p);
    } else if (eatKw("teamstat")) {
        return parseActionChangeTeamStat(p);
    } else if (eatKw("displayMenu")) {
        return parseActionDisplayMenu(p);
    } else if (eatKw("dropItem")) {
        return parseActionDropItem(p);
    } else if (eatKw("changeVelocity")) {
        return parseActionSetVelocity(p);
    } else if (eatKw("launch")) {
        return parseActionLaunch(p);
    }

    else if (eatKw("exit")) {
        return { type: "EXIT", kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("cancelEvent")) {
        return { type: "CANCEL_EVENT", kwSpan: p.prev.span, span: p.prev.span };
    }

    if (p.check("ident")) {
        throw error("Unknown action", p.token.span);
    }

    p.next();
    throw error("Expected action", p.prev.span);
}

function parseActionRecovering<T extends IrAction["type"]>(
    p: Parser,
    type: T,
    parser: (action: IrAction & { type: T }) => void
): IrAction & { type: T } {
    const start = p.prev.span.start;
    const action = { type, kwSpan: p.prev.span } as IrAction & { type: T };
    p.parseRecovering(["eol"], () => {
        parser(action);
    });
    for (const key in ACTION_SEMANTIC_DESCRIPTORS[action.type]) {
        // @ts-ignore
        if (action[key] === undefined) {
            // @ts-ignore
            action[key] = { value: undefined, span: p.token.span }
        }
    }
    action.span = span(start, p.prev.span.end);
    return action;
}

function parseActionConditional(p: Parser): IrAction {
    return parseActionRecovering(p, "CONDITIONAL", (action) => {
        action.matchAny = p.spanned(() => {
            if (p.eatIdent("and") || p.eatIdent("false")) return false;
            else if (p.eatIdent("or") || p.eatIdent("true")) return true;
            else if (p.check("ident")) throw error("Expected conditional mode", p.token.span);
            else return false; // not null because :(
        });

        action.conditions = p.spanned(() => {
            return p.parseDelimitedCommaSeq("parenthesis", () => {
                return p.parseRecovering(
                    ["comma", { kind: "close_delim", delim: "parenthesis" }],
                    () => { return parseCondition(p); }
                );
            }).filter(it => it !== undefined);
        });

        action.ifActions = p.spanned(p.parseBlock);

        // the following is kind of hacky, but it's alright:
        let token = p.token;
        let hadNewline = p.eat("eol");

        action.elseActions = p.spanned(() => {
            if (p.eatIdent("else")) return p.parseBlock();
            else if (hadNewline) {
                p.tokens.push(p.token);
                p.token = token;
            }
            return null;
        });
    });
}

function parseActionSetGroup(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_GROUP", (action) => {
        action.group = p.spanned(p.parseString);
        action.demotionProtection = p.spanned(p.parseBoolean);
    });
}

function parseActionTitle(p: Parser): IrAction {
    return parseActionRecovering(p, "TITLE", (action) => {
        action.title = p.spanned(p.parseString);
        if (p.check("eol")) return; // shorthand
        action.subtitle = p.spanned(p.parseString);
        if (p.check("eol")) return; // shorthand

        action.fadein = p.spanned(() => p.parseBoundedNumber(0, 5));
        action.stay = p.spanned(() => p.parseBoundedNumber(0, 10));
        action.fadeout = p.spanned(() => p.parseBoundedNumber(0, 5));
    });
}

function parseActionActionBar(p: Parser): IrAction {
    return parseActionRecovering(p, "ACTION_BAR", (action) => {
        action.message = p.spanned(p.parseString);
    });
}

function parseActionChangeMaxHealth(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_HEALTH", (action) => {
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionGiveItem(p: Parser): IrAction {
    return parseActionRecovering(p, "GIVE_ITEM", (action) => {
        action.item = p.spanned(p.parseName);
        action.allowMultiple = p.spanned(p.parseBoolean);
        action.slot = p.spanned(parseInventorySlot);
        action.replaceExisting = p.spanned(p.parseBoolean);
    });
}

function parseActionRemoveItem(p: Parser): IrAction {
    return parseActionRecovering(p, "REMOVE_ITEM", (action) => {
        action.item = p.spanned(p.parseName);
    });
}

function parseActionMessage(p: Parser): IrAction {
    return parseActionRecovering(p, "MESSAGE", (action) => {
        action.message = p.spanned(p.parseString);
    });
}

function parseActionApplyPotionEffect(p: Parser): IrAction {
    return parseActionRecovering(p, "APPLY_POTION_EFFECT", (action) => {
        action.effect = p.spanned(parsePotionEffect);
        action.duration = p.spanned(() => p.parseBoundedNumber(1, 2592000));
        action.level = p.spanned(() => p.parseBoundedNumber(1, 10));
        action.override = p.spanned(p.parseBoolean);
        action.showIcon = p.spanned(() => {
            if (p.check("ident")) {
                return p.parseBoolean();
            }
            else return null;
        });
    });
}

function parseActionGiveExperienceLevels(p: Parser): IrAction {
    return parseActionRecovering(p, "GIVE_EXPERIENCE_LEVELS", (action) => {
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionSendToLobby(p: Parser): IrAction {
    return parseActionRecovering(p, "SEND_TO_LOBBY", (action) => {
        action.lobby = p.spanned(parseLobby);
    })
}

function parseActionChangeStat(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_STAT", (action) => {
        action.stat = p.spanned(parseStatName);
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionChangeGlobalStat(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_GLOBAL_STAT", (action) => {
        action.stat = p.spanned(parseStatName);
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionTeleport(p: Parser): IrAction {
    return parseActionRecovering(p, "TELEPORT", (action) => {
        action.location = p.spanned(parseLocation);
    });
}

function parseActionFailParkour(p: Parser): IrAction {
    return parseActionRecovering(p, "FAIL_PARKOUR", (action) => {
        action.message = p.spanned(p.parseString);
    });
}

function parseActionPlaySound(p: Parser): IrAction {
    return parseActionRecovering(p, "PLAY_SOUND", (action) => {
        action.sound = p.spanned(parseSound);
        action.volume = p.spanned(p.parseFloat);
        action.pitch = p.spanned(p.parseFloat);
        action.location = p.spanned(parseLocation);
    });
}

function parseActionSetCompassTarget(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_COMPASS_TARGET", (action) => {
        action.location = p.spanned(parseLocation);
    });
}

function parseActionSetGamemode(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_GAMEMODE", (action) => {
        action.gamemode = p.spanned(parseGamemode);
    })
}

function parseActionChangeHealth(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_HEALTH", (action) => {
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionChangeHunger(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_HUNGER", (action) => {
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionRandom(p: Parser): IrAction {
    return parseActionRecovering(p, "RANDOM", (action) => {
        action.actions = p.spanned(p.parseBlock);
    });
}

function parseActionFunction(p: Parser): IrAction {
    return parseActionRecovering(p, "FUNCTION", (action) => {
        action.function = p.spanned(p.parseName);

        action.global = p.spanned(() => {
            if (p.check("ident")) return p.parseBoolean();
            else return null;
        });
    });
}

function parseActionApplyInventoryLayout(p: Parser): IrAction {
    return parseActionRecovering(p, "APPLY_INVENTORY_LAYOUT", (action) => {
        action.layout = p.spanned(p.parseString);
    });
}

function parseActionEnchantHeldItem(p: Parser): IrAction {
    return parseActionRecovering(p, "ENCHANT_HELD_ITEM", (action) => {
        action.enchant = p.spanned(parseEnchantment);
        action.level = p.spanned(() => p.parseBoundedNumber(1, 10));
    });
}

function parseActionPause(p: Parser): IrAction {
    return parseActionRecovering(p, "PAUSE", (action) => {
        action.ticks = p.spanned(() => p.parseBoundedNumber(1, 1000));
    });
}

function parseActionSetTeam(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_TEAM", (action) => {
        action.team = p.spanned(p.parseName);
    });
}

function parseActionChangeTeamStat(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_TEAM_STAT", (action) => {
        action.stat = p.spanned(parseStatName);
        action.team = p.spanned(parseStatName);
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionDisplayMenu(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_MENU", (action) => {
        action.menu = p.spanned(p.parseName);
    });
}

function parseActionDropItem(p: Parser): IrAction {
    return parseActionRecovering(p, "DROP_ITEM", (action) => {
        action.item = p.spanned(p.parseName);
        action.location = p.spanned(parseLocation);
        action.dropNaturally = p.spanned(p.parseBoolean);
        action.disableMerging = p.spanned(p.parseBoolean);
        action.prioritizePlayer = p.spanned(p.parseBoolean);
        action.inventoryFallback = p.spanned(p.parseBoolean);
    });
}

function parseActionSetVelocity(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_VELOCITY", (action) => {
        action.x = p.spanned(parseAmount);
        action.y = p.spanned(parseAmount);
        action.z = p.spanned(parseAmount);
    });
}

function parseActionLaunch(p: Parser): IrAction {
    return parseActionRecovering(p, "LAUNCH", (action) => {
        action.location = p.spanned(parseLocation);
        action.strength = p.spanned(() => p.parseBoundedNumber(1, 10));
    });
}
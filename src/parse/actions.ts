import type { Parser } from "./parser.js";
import type { IrAction } from "../ir.js";
import { error } from "../diagnostic.js";
import { parseCondition } from "./conditions.js";
import { span } from "../span";
import { parseAmount, parseLocation, parseOperation, parseStatName } from "./arguments";

export function parseAction(p: Parser): IrAction {
    if (p.eatIdent("if")) {
        return parseActionConditional(p);
    } else if (p.eatIdent("changeGroup")) {
        return parseActionChangeGroup(p);
    } else if (p.eatIdent("kill")) {
        return { type: "KILL", kwSpan: p.prev.span, span: p.prev.span };
    } else if (p.eatIdent("heal")) {
        return { type: "HEAL", kwSpan: p.prev.span, span: p.prev.span };
    } else if (p.eatIdent("title")) {
        return parseActionTitle(p);
    } else if (p.eatIdent("actionBar")) {
        return parseActionActionBar(p);
    } else if (p.eatIdent("resetInventory")) {
        return { type: "RESET_INVENTORY", kwSpan: p.prev.span, span: p.prev.span };
    } else if (p.eatIdent("changeMaxHealth")) {
        return parseActionChangeMaxHealth(p);
    } else if (p.eatIdent("stat")) {
        return parseActionChangeStat(p);
    } else if (p.eatIdent("globalstat")) {
        return parseActionChangeGlobalStat(p);
    } else if (p.eatIdent("teamstat")) {
        return parseActionChangeTeamStat(p);
    } else if (p.eatIdent("chat")) {
        return parseActionMessage(p);
    } else if (p.eatIdent("random")) {
        return parseActionRandom(p);
    } else if (p.eatIdent("setVelocity")) {
        return parseActionSetVelocity(p);
    } else if (p.eatIdent("tp")) {
        return parseActionTeleport(p);
    } else if (p.eatIdent("exit")) {
        return { type: "EXIT", kwSpan: p.prev.span, span: p.prev.span };
    } else if (p.eatIdent("cancelEvent")) {
        return { type: "CANCEL_EVENT", kwSpan: p.prev.span, span: p.prev.span };
    } else if (p.eatIdent("function")) {
        return parseActionFunction(p);
    } else if (p.eatIdent("pause")) {
        return parseActionPause(p);
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
    action.span = span(start, p.prev.span.end);
    return action;
}

function parseActionConditional(p: Parser): IrAction {
    return parseActionRecovering(p, "CONDITIONAL", (action) => {
        if (p.check("ident")) {
            action.matchAny = p.spanned(() => {
                if (p.eatIdent("and")) return false;
                else if (p.eatIdent("or")) return true;
                else throw error("expected conditional mode", p.token.span);
            });
        }

        action.conditions = p.spanned(() => {
            return p.parseDelimitedCommaSeq("parenthesis", () => {
                return p.parseRecovering(
                    ["comma", { kind: "close_delim", delim: "parenthesis" }],
                    () => { return parseCondition(p); }
                );
            }).filter(it => it !== undefined);
        });

        action.ifActions = p.spanned(p.parseBlock);

        p.eat("eol"); // so else can optionally be on the next line

        if (p.eatIdent("else")) {
            action.elseActions = p.spanned(p.parseBlock);
        }
    });
}

function parseActionChangeGroup(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_GROUP", (action) => {
        action.group = p.spanned(p.parseString);
        action.demotionProtection = p.spanned(p.parseBoolean);
    });
}

function parseActionTitle(p: Parser): IrAction {
    return parseActionRecovering(p, "TITLE", (action) => {
        action.title = p.spanned(p.parseString);
        action.subtitle = p.spanned(p.parseString);

        action.fadein = p.spanned(() => p.parseBoundedNumber(1, 5));
        action.stay = p.spanned(() => p.parseBoundedNumber(1, 10));
        action.fadeout = p.spanned(() => p.parseBoundedNumber(1, 5));
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

function parseActionChangeTeamStat(p: Parser): IrAction {
    return parseActionRecovering(p, "CHANGE_TEAM_STAT", (action) => {
        action.stat = p.spanned(parseStatName);
        action.team = p.spanned(parseStatName);
        action.op = p.spanned(parseOperation);
        action.amount = p.spanned(parseAmount);
    });
}

function parseActionMessage(p: Parser): IrAction {
    return parseActionRecovering(p, "MESSAGE", (action) => {
        action.message = p.spanned(p.parseString);
    });
}

function parseActionRandom(p: Parser): IrAction {
    return parseActionRecovering(p, "RANDOM", (action) => {
        action.actions = p.spanned(p.parseBlock);
    });
}

function parseActionSetVelocity(p: Parser): IrAction {
    return parseActionRecovering(p, "SET_VELOCITY", (action) => {
        action.x = p.spanned(parseAmount);
        action.y = p.spanned(parseAmount);
        action.z = p.spanned(parseAmount);
    });
}

function parseActionTeleport(p: Parser): IrAction {
    return parseActionRecovering(p, "TELEPORT", (action) => {
        action.location = p.spanned(parseLocation);
    });
}

function parseActionFunction(p: Parser): IrAction {
    return parseActionRecovering(p, "FUNCTION", (action) => {
        action.name = p.spanned(p.parseString);
        action.global = p.spanned(p.parseBoolean);
    });
}

function parseActionPause(p: Parser): IrAction {
    return parseActionRecovering(p, "PAUSE", (action) => {
        action.ticks = p.spanned(() => p.parseBoundedNumber(1, 1000));
    });
}
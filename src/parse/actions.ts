import type { Parser } from "./parser.js";
import type { IrAction } from "./ir.js";
import { error } from "./diagnostic.js";
import { parseCondition } from "./conditions.js";
import { span } from "./span";

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
    }

    if (p.check("ident")) {
        throw error("Unknown action", p.token.span);
    }

    p.next();
    throw error("Expected action", p.token.span);
}

function parseStructuredAction<T extends IrAction["type"]>(
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
    return parseStructuredAction(p, "CONDITIONAL", (action) => {
        if (p.check("ident")) {
            action.matchAny = p.parseSpanned(() => {
                if (p.eatIdent("and")) return true;
                else if (p.eatIdent("or")) return false;
                else throw error("expected conditional mode", p.token.span);
            });
        }

        action.conditions = p.parseSpanned(() => {
            return p.parseDelimitedCommaSeq("parenthesis", () => {
                return p.parseRecovering(
                    ["comma", { kind: "close_delim", delim: "parenthesis" }],
                    () => { return parseCondition(p); }
                );
            }).filter(it => it !== undefined);
        });

        action.ifActions = p.parseSpanned(p.parseBlock);
        if (p.eatIdent("else")) {
            action.elseActions = p.parseSpanned(p.parseBlock);
        }
    });
}

function parseActionChangeGroup(p: Parser): IrAction {
    return parseStructuredAction(p, "SET_GROUP", (action) => {
        action.group = p.parseSpanned(p.parseString);
        action.demotionProtection = p.parseSpanned(p.parseBoolean);
    });
}

function parseActionTitle(p: Parser): IrAction {
    return parseStructuredAction(p, "TITLE", (action) => {
        action.title = p.parseSpanned(p.parseString);
        action.subtitle = p.parseSpanned(p.parseString);

        action.fadein = p.parseSpanned(() => p.parseBoundedNumber(1, 5));
        action.stay = p.parseSpanned(() => p.parseBoundedNumber(1, 10));
        action.fadeout = p.parseSpanned(() => p.parseBoundedNumber(1, 5));
    });
}

function parseActionActionBar(p: Parser): IrAction {
    return parseStructuredAction(p, "ACTION_BAR", (action) => {
        action.message = p.parseSpanned(p.parseString);
    });
}

function parseActionChangeMaxHealth(p: Parser): IrAction {
    return parseStructuredAction(p, "CHANGE_HEALTH", (action) => {
        action.op = p.parseSpanned(p.parseOperation);
        action.amount = p.parseSpanned(p.parseAmount);
    });
}

function parseActionChangeStat(p: Parser): IrAction {
    return parseStructuredAction(p, "CHANGE_STAT", (action) => {
        action.stat = p.parseSpanned(p.parseStatName);
        action.op = p.parseSpanned(p.parseOperation);
        action.amount = p.parseSpanned(p.parseAmount);
    });
}

function parseActionChangeGlobalStat(p: Parser): IrAction {
    return parseStructuredAction(p, "CHANGE_GLOBAL_STAT", (action) => {
        action.stat = p.parseSpanned(p.parseStatName);
        action.op = p.parseSpanned(p.parseOperation);
        action.amount = p.parseSpanned(p.parseAmount);
    });
}

function parseActionChangeTeamStat(p: Parser): IrAction {
    return parseStructuredAction(p, "CHANGE_TEAM_STAT", (action) => {
        action.stat = p.parseSpanned(p.parseStatName);
        action.team = p.parseSpanned(p.parseStatName);
        action.op = p.parseSpanned(p.parseOperation);
        action.amount = p.parseSpanned(p.parseAmount);
    });
}

function parseActionMessage(p: Parser): IrAction {
    return parseStructuredAction(p, "MESSAGE", (action) => {
        action.message = p.parseSpanned(p.parseString);
    });
}

function parseActionRandom(p: Parser): IrAction {
    return parseStructuredAction(p, "RANDOM", (action) => {
        action.actions = p.parseSpanned(p.parseBlock);
    });
}

function parseActionSetVelocity(p: Parser): IrAction {
    return parseStructuredAction(p, "SET_VELOCITY", (action) => {
        action.x = p.parseSpanned(p.parseAmount);
        action.y = p.parseSpanned(p.parseAmount);
        action.z = p.parseSpanned(p.parseAmount);
    });
}

function parseActionTeleport(p: Parser): IrAction {
    return parseStructuredAction(p, "TELEPORT", (action) => {
        action.location = p.parseSpanned(p.parseLocation);
    });
}
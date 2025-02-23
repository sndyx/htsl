import type { Parser } from "./parser.js";
import type { IrAction } from "./ir.js";
import { Diagnostic } from "./diagnostic.js";

export function parseAction(p: Parser): IrAction | undefined {
    if (p.eatIdent("if")) {
        return parseActionConditional(p);
    } else if (p.eatIdent("changeGroup")) {
        return parseActionChangeGroup(p);
    } else if (p.eatIdent("kill")) {
        return { type: "KILL" };
    } else if (p.eatIdent("heal")) {
        return { type: "HEAL" };
    } else if (p.eatIdent("title")) {
        return parseActionTitle(p);
    } else if (p.eatIdent("actionBar")) {
        return parseActionActionBar(p);
    } else if (p.eatIdent("resetInventory")) {
        return { type: "RESET_INVENTORY" };
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
    }

    if (p.check("ident")) {
        throw Diagnostic.error("Unknown action", p.token.span);
    } else if (!p.check("eof")) {
        throw Diagnostic.error("Expected action", p.token.span);
    }

    return undefined;
}

export function parseActionConditional(p: Parser): IrAction {
    let matchAny, conditions, ifActions, elseActions;
    p.parseRecovering(() => {
        if (p.check("ident")) {
            matchAny = p.parseSpanned(() => {
                if (p.eatIdent("and")) matchAny = true;
                else if (p.eatIdent("or")) matchAny = false;
                else throw Diagnostic.error("expected conditional mode", p.token.span);
            });

            conditions = p.parseSpanned(() => p.parseDelimitedCommaSeq("parenthesis", () => {
                return "";
            }));

            ifActions = p.parseSpanned(() => p.parseBlock());

            if (p.eatIdent("else")) {
                elseActions = p.parseSpanned(() => p.parseBlock());
            }
        }
    });
    return { type: "CONDITIONAL", matchAny, ifActions, elseActions };
}

function parseActionChangeGroup(p: Parser): IrAction {
    let group, demotionProtection;
    p.parseRecovering(() => {
        group = p.parseStr();
        demotionProtection = p.parseBoolean();
    });
    return { type: "SET_GROUP", group, demotionProtection };
}

function parseActionTitle(p: Parser): IrAction {
    let title, subtitle, fadein, stay, fadeout;
    p.parseRecovering(() => {
        title = p.parseSpanned(() => p.parseStr());
        subtitle = p.parseSpanned(() => p.parseStr());

        fadein = p.parseSpanned(() => p.parseI64());
        stay = p.parseSpanned(() => p.parseI64());
        fadeout = p.parseSpanned(() => p.parseI64());
    });
    return { type: "TITLE", title, subtitle, fadein, stay, fadeout };
}

function parseActionActionBar(p: Parser): IrAction {
    let message;
    p.parseRecovering(() => {
        message = p.parseSpanned(() => p.parseStr());
    })
    return { type: "ACTION_BAR", message };
}

function parseActionChangeMaxHealth(p: Parser): IrAction {
    let mode, amount;
    p.parseRecovering(() => {
        mode = p.parseSpanned(() => p.parseStatMode());
        amount = p.parseSpanned(() => p.parseStatAmount());
    });
    return { type: "CHANGE_MAX_HEALTH", mode, amount };
}

function parseActionChangeStat(p: Parser): IrAction {
    let stat, mode, amount;
    p.parseRecovering(() => {
        stat = p.parseSpanned(() => p.parseStatName());
        mode = p.parseSpanned(() => p.parseStatMode());
        amount = p.parseSpanned(() => p.parseStatAmount());
    });
    return { type: "CHANGE_STAT", stat, mode, amount };
}

function parseActionChangeGlobalStat(p: Parser): IrAction {
    let stat, mode, amount;
    p.parseRecovering(() => {
        stat = p.parseSpanned(() => p.parseStatName());
        mode = p.parseSpanned(() => p.parseStatMode());
        amount = p.parseSpanned(() => p.parseStatAmount());
    });
    return { type: "CHANGE_GLOBAL_STAT", stat, mode, amount };
}

function parseActionChangeTeamStat(p: Parser): IrAction {
    let stat, team, mode, amount;
    p.parseRecovering(() => {
        stat = p.parseSpanned(() => p.parseStatName());
        team = p.parseSpanned(() => p.parseStatName());
        mode = p.parseSpanned(() => p.parseStatMode());
        amount = p.parseSpanned(() => p.parseStatAmount());
    });
    return { type: "CHANGE_TEAM_STAT", stat, team, mode, amount };
}

function parseActionMessage(p: Parser): IrAction {
    let message;
    p.parseRecovering(() => {
        message = p.parseSpanned(() => p.parseStr());
    })
    return { type: "MESSAGE", message };
}

function parseActionRandom(p: Parser): IrAction {
    let actions;
    p.parseRecovering(() => {
        actions = p.parseSpanned(() => p.parseBlock());
    });
    return { type: "RANDOM", actions };
}

function parseActionSetVelocity(p: Parser): IrAction {
    let x, y, z;
    p.parseRecovering(() => {
        x = p.parseSpanned(() => p.parseStatAmount());
        y = p.parseSpanned(() => p.parseStatAmount());
        z = p.parseSpanned(() => p.parseStatAmount());
    });
    return { type: "SET_VELOCITY", x, y, z };
}

function parseActionTeleport(p: Parser): IrAction {
    let location;
    p.parseRecovering(() => {
        location = p.parseSpanned(() => p.parseLocation());
    });
    return { type: "TELEPORT", location };
}
import type { Parser } from "./parser.js";
import type { IrCondition } from "./ir.js";
import { Diagnostic } from "./diagnostic.js";

export function parseCondition(p: Parser): IrCondition {
    if (p.eatIdent("stat")) {
        return parseConditionCompareStat(p);
    } else if (p.eatIdent("gamemode")) {
        return parseConditionRequiredGamemode(p);
    }

    if (p.check("ident")) {
        throw Diagnostic.error("Unknown condition", p.token.span);
    } else {
        throw Diagnostic.error("Expected condition", p.token.span);
    }
}

function parseConditionCompareStat(p: Parser): IrCondition {
    let stat, op, amount;
    p.parseRecovering(["comma", { kind: "close_delim", delim: "parenthesis" }], () => {
        stat = p.parseSpanned(() => p.parseStatName());
        op = p.parseSpanned(() => p.parseComparison());
        amount = p.parseSpanned(() => p.parseAmount());
    });
    return { type: "COMPARE_STAT", stat, op, amount };
}

function parseConditionRequiredGamemode(p: Parser): IrCondition {
    let gamemode;
    p.parseRecovering(["comma", { kind: "close_delim", delim: "parenthesis" }], () => {
        gamemode = p.parseSpanned(() => p.parseGamemode());
    });
    return { type: "REQUIRED_GAMEMODE", gamemode };
}
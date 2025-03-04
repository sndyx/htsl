import type { Parser } from "./parser.js";
import type { IrCondition } from "./ir.js";
import { error } from "./diagnostic.js";

export function parseCondition(p: Parser): IrCondition {
    if (p.eatIdent("stat")) {
        return parseConditionCompareStat(p);
    } else if (p.eatIdent("gamemode")) {
        return parseConditionRequiredGamemode(p);
    }

    if (p.check("ident")) {
        throw error("Unknown condition", p.token.span);
    } else {
        throw error("Expected condition", p.token.span);
    }
}

function parseStructuredCondition<T extends IrCondition["type"]>(
    p: Parser,
    type: T,
    parser: (condition: IrCondition & { type: T }) => void
): IrCondition & { type: T } {
    const condition = { type, kwSpan: p.prev.span } as IrCondition & { type: T };
    p.parseRecovering(["comma", { kind: "close_delim", delim: "parenthesis" }], () => {
        parser(condition);
    });
    return condition;
}

function parseConditionCompareStat(p: Parser): IrCondition {
    return parseStructuredCondition(p, "COMPARE_STAT", (condition) => {
        condition.stat = p.parseSpanned(p.parseStatName);
        condition.op = p.parseSpanned(p.parseComparison);
        condition.amount = p.parseSpanned(p.parseAmount);
    });
}

function parseConditionRequiredGamemode(p: Parser): IrCondition {
    return parseStructuredCondition(p, "REQUIRED_GAMEMODE", (condition) => {
        condition.gamemode = p.parseSpanned(p.parseGamemode);
    });
}
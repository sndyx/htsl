import type { Parser } from "./parser.js";
import type { IrCondition } from "../ir.js";
import { error } from "./diagnostic.js";
import { span } from "../span";
import { parseAmount, parseComparison, parseGamemode, parseStatName } from "./arguments";

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

function parseConditionRecovering<T extends IrCondition["type"]>(
    p: Parser,
    type: T,
    parser: (condition: IrCondition & { type: T }) => void
): IrCondition & { type: T } {
    const start = p.prev.span.start;
    const condition = { type, kwSpan: p.prev.span } as IrCondition & { type: T };
    p.parseRecovering(["comma", { kind: "close_delim", delim: "parenthesis" }], () => {
        parser(condition);
    });
    condition.span = span(start, p.prev.span.end);
    return condition;
}

function parseConditionCompareStat(p: Parser): IrCondition {
    return parseConditionRecovering(p, "COMPARE_STAT", (condition) => {
        condition.stat = p.spanned(parseStatName);
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionRequiredGamemode(p: Parser): IrCondition {
    return parseConditionRecovering(p, "REQUIRED_GAMEMODE", (condition) => {
        condition.gamemode = p.spanned(parseGamemode);
    });
}
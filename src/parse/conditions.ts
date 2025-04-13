import type { Parser } from "./parser.js";
import type { IrCondition } from "../ir.js";
import { error } from "../diagnostic.js";
import { type Span, span } from "../span";
import {
    parseAmount,
    parseComparison,
    parseGamemode, parseItemLocation,
    parseItemProperty,
    parsePermission, parsePotionEffect,
    parseStatName
} from "./arguments";
import { CONDITION_SEMANTIC_DESCRIPTORS } from "../semantics";
import { parseNumericalPlaceholder } from "./placeholders";
import type { ConditionKw } from "../helpers";

type Inverted = { value: boolean, span: Span };

export function parseCondition(p: Parser): IrCondition {
    function eatKw(kw: ConditionKw): boolean {
        return p.eatIdent(kw);
    }
    const inverted  = p.spanned(() => p.eat("exclamation"));

    if (eatKw("hasGroup")) {
        return parseConditionRequireGroup(p, inverted);
    } else if (eatKw("stat")) {
        return parseConditionCompareStat(p, inverted);
    } else if (eatKw("globalstat")) {
        return parseConditionCompareGlobalStat(p, inverted);
    } else if (eatKw("hasPermission")) {
        return parseConditionRequirePermission(p, inverted);
    } else if (eatKw("inRegion")) {
        return parseConditionIsInRegion(p, inverted);
    } else if (eatKw("hasItem")) {
        return parseConditionRequireItem(p, inverted);
    } else if (eatKw("doingParkour")) {
        return { type: "IS_DOING_PARKOUR", inverted, kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("hasPotion")) {
        return parseConditionRequirePotionEffect(p, inverted);
    } else if (eatKw("isSneaking")) {
        return { type: "IS_SNEAKING", inverted, kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("isFlying")) {
        return { type: "IS_FLYING", inverted, kwSpan: p.prev.span, span: p.prev.span };
    } else if (eatKw("health")) {
        return parseConditionCompareHealth(p, inverted);
    } else if (eatKw("maxHealth")) {
        return parseConditionCompareMaxHealth(p, inverted);
    } else if (eatKw("hunger")) {
        return parseConditionCompareHunger(p, inverted);
    } else if (eatKw("gamemode")) {
        return parseConditionRequireGamemode(p, inverted);
    } else if (eatKw("placeholder")) {
        return parseConditionComparePlaceholder(p, inverted);
    } else if (eatKw("hasTeam")) {
        return parseConditionRequireTeam(p, inverted);
    } else if (eatKw("teamstat")) {
        return parseConditionCompareTeamStat(p, inverted);
    }

    else if (eatKw("damageAmount")) {
        return parseConditionCompareDamage(p, inverted);
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
    inverted: Inverted,
    parser: (condition: IrCondition & { type: T }) => void
): IrCondition & { type: T } {
    const start = p.prev.span.start;
    const condition = { type, inverted, kwSpan: p.prev.span } as IrCondition & { type: T };
    p.parseRecovering(["comma", { kind: "close_delim", delim: "parenthesis" }], () => {
        parser(condition);
    });
    for (const key in CONDITION_SEMANTIC_DESCRIPTORS[condition.type]) {
        // @ts-ignore
        if (condition[key] === undefined) {
            // @ts-ignore
            condition[key] = { value: undefined, span: p.token.span }
        }
    }
    condition.span = span(start, p.prev.span.end);
    return condition;
}

function parseConditionRequireGroup(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "REQUIRE_GROUP", inverted, (condition) => {
        condition.group = p.spanned(p.parseName);
        if (p.check("eol")) return;
        condition.includeHigherGroups = p.spanned(p.parseBoolean);
    });
}

function parseConditionCompareStat(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_STAT", inverted, (condition) => {
        condition.stat = p.spanned(parseStatName);
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionCompareGlobalStat(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_GLOBAL_STAT", inverted, (condition) => {
        condition.stat = p.spanned(parseStatName);
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionRequirePermission(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "REQUIRE_PERMISSION", inverted, (condition) => {
        condition.permission = p.spanned(parsePermission);
    });
}

function parseConditionIsInRegion(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "IS_IN_REGION", inverted, (condition) => {
        condition.region = p.spanned(p.parseName);
    });
}

function parseConditionRequireItem(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "REQUIRE_ITEM", inverted, (condition) => {
        condition.item = p.spanned(p.parseName);
        condition.whatToCheck = p.spanned(parseItemProperty);
        condition.whereToCheck = p.spanned(parseItemLocation);
        condition.amount = p.spanned(() => {
            if (p.eatOption("Any Amount") || p.eatOption("anyAmount")) return "Any Amount";
            else if (p.eatOption("Equal or Greater Amount") || p.eatOption("equalOrGreaterAmount")) {
                return "Equal or Greater Amount";
            }
            else throw error("Expected item amount", p.token.span);
        });
    });
}

function parseConditionRequirePotionEffect(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "REQUIRE_POTION_EFFECT", inverted, (condition) => {
        condition.effect = p.spanned(parsePotionEffect);
    });
}

function parseConditionCompareHealth(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_HEALTH", inverted, (condition) => {
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionCompareMaxHealth(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_MAX_HEALTH", inverted, (condition) => {
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionCompareHunger(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_HUNGER", inverted, (condition) => {
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionRequireGamemode(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "REQUIRE_GAMEMODE", inverted, (condition) => {
        condition.gamemode = p.spanned(parseGamemode);
    });
}

function parseConditionComparePlaceholder(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_PLACEHOLDER", inverted, (condition) => {
        condition.placeholder = p.spanned(parseNumericalPlaceholder);
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionRequireTeam(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "REQUIRE_TEAM", inverted, (condition) => {
        condition.team = p.spanned(p.parseName);
    });
}

function parseConditionCompareTeamStat(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_TEAM_STAT", inverted, (condition) => {
        condition.stat = p.spanned(parseStatName);
        condition.team = p.spanned(parseStatName)
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}

function parseConditionCompareDamage(p: Parser, inverted: Inverted): IrCondition {
    return parseConditionRecovering(p, "COMPARE_DAMAGE", inverted, (condition) => {
        condition.op = p.spanned(parseComparison);
        condition.amount = p.spanned(parseAmount);
    });
}
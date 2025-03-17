import type { Operation, Amount, Location, Comparison, Gamemode } from "housing-common/src/types";
import type { Parser } from "./parser";
import { error } from "../diagnostic";
import type { PlaceholderKind } from "./token";
import { parseNumericalPlaceholder } from "./placeholders";

export function parseLocation(p: Parser): Location {
    if (
        p.eatIdent("custom_location") ||
        p.eat({ kind: "str", value: "custom_location" })
    ) {
        return { type: "LOCATION_CUSTOM" };
    }
    if (
        p.eatIdent("house_spawn") ||
        p.eat({ kind: "str", value: "house_spawn" })
    ) {
        return { type: "LOCATION_SPAWN" };
    }
    throw error("Invalid location", p.token.span);
}

export function parseGamemode(p: Parser): Gamemode {
    if (p.eatOption("survival")) {
        return "survival";
    }
    if (p.eatOption("adventure")) {
        return "adventure";
    }
    if (p.eatOption("creative")) {
        return "creative";
    }
    if (p.check("str") || p.check("ident")) {
        p.addDiagnostic(error("Expected gamemode (survival, adventure, creative)", p.token.span));
    } else {
        p.addDiagnostic(error("Expected gamemode", p.token.span));
    }
    p.next();
    return "survival";
}

export function parseComparison(p: Parser): Comparison {
    if (
        p.eatOption("equals") ||
        p.eatOption("equal") ||
        p.eat({ kind: "cmp_op", op: "equals" }) ||
        p.eat({ kind: "cmp_op_eq", op: "equals" })
    ) {
        return "equals";
    }
    if (p.eatOption("less than") || p.eat({ kind: "cmp_op", op: "less_than" })) {
        return "less_than";
    }
    if (
        p.eatOption("less than or equals") ||
        p.eatOption("less than or equal") ||
        p.eat({ kind: "cmp_op_eq", op: "less_than" })
    ) {
        return "less_than_or_equals";
    }
    if (p.eatOption("greater than") || p.eat({ kind: "cmp_op", op: "greater_than" })) {
        return "greater_than";
    }
    if (
        p.eatOption("greater than or equals") ||
        p.eatOption("greater than or equal") ||
        p.eat({ kind: "cmp_op_eq", op: "greater_than" })
    ) {
        return "greater_than_or_equals";
    }
    if (p.check("str") || p.check("ident")) {
        p.addDiagnostic(
            error(
                "Expected comparison (less than, less than or equals, equals, greater than, greater than or equals)",
                p.token.span
            )
        );
    } else {
        p.addDiagnostic(error("Expected comparison", p.token.span));
    }
    p.next();
    return "equals";
}

export function parseStatName(p: Parser): string {
    if (p.token.kind !== "ident" && p.token.kind !== "str") {
        throw error("Expected stat name", p.token.span);
    }
    const value = p.token.value;
    if (value.length > 16) {
        throw error("Stat name exceeds 16-character limit", p.token.span);
    }
    if (value.length < 1) {
        throw error("Stat name cannot be empty", p.token.span);
    }
    if (value.includes(" ")) {
        throw error("Stat name cannot contain spaces", p.token.span);
    }
    p.next();
    return value;
}

export function parseOperation(p: Parser): Operation {
    if (
        p.eatOption("increment") ||
        p.eatOption("inc") ||
        p.eat({ kind: "bin_op_eq", op: "plus" })
    ) {
        return "increment";
    }
    if (
        p.eatOption("decrement") ||
        p.eatOption("dec") ||
        p.eat({ kind: "bin_op_eq", op: "minus" })
    ) {
        return "decrement";
    }
    if (
        p.eatOption("multiply") ||
        p.eatOption("mul") ||
        p.eat({ kind: "bin_op_eq", op: "star" })
    ) {
        return "multiply";
    }
    if (
        p.eatOption("divide") ||
        p.eatOption("div") ||
        p.eat({ kind: "bin_op_eq", op: "slash" })
    ) {
        return "divide";
    }
    if (
        p.eatOption("set") ||
        p.eat({ kind: "cmp_op", op: "equals" })
    ) {
        return "set";
    }

    if ((p.check("str") || p.check("ident"))) {
        throw error(
            "Expected operation (increment, decrement, set, multiply, divide)", p.token.span
        );
    } else {
        throw error("Expected operation", p.token.span);
    }
}

export function parseAmount(p: Parser): Amount {
    if (p.check("i64") || p.check({ kind: "bin_op", op: "minus" })) {
        return p.parseNumber();
    }
    if (p.check("placeholder") || p.check("str")) {
        return parseNumericalPlaceholder(p);
    }
    if (p.eatIdent("stat")) {
        const name = parseStatName(p);
        return `%stat.player/${name}%`;
    }
    if (p.eatIdent("globalstat")) {
        const name = parseStatName(p);
        return `%stat.global/${name}%`;
    }
    if (p.eatIdent("teamstat")) {
        const name = parseStatName(p);
        if (!p.check("ident") && !p.check("str")) {
            throw error("Expected team name", p.token.span);
        }
        const team = parseStatName(p);
        return `%stat.team/${name} ${team}%`;
    }
    throw error("Expected amount", p.token.span);
}
import type { Parser } from "./parser";
import { error } from "../diagnostic";
import { parseStatName } from "./arguments";

export function parseNumericalPlaceholder(
    p: Parser
): string {
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
    if (p.eatIdent("randomint")) {
        const from = p.parseNumber();
        const to = p.parseNumber();
        return `%random.int/${from} ${to}%`;
    }

    if (p.eatIdent("health")) return "%player.health%";
    if (p.eatIdent("maxHealth")) return "%player.maxHealth%";
    if (p.eatIdent("hunger")) return "%player.hunger%";
    if (p.eatIdent("locX")) return "%player.location.x%";
    if (p.eatIdent("locY")) return "%player.location.y%";
    if (p.eatIdent("locZ")) return "%player.location.z%";
    if (p.eatIdent("unix")) return "%date.unix%";

    if (p.token.kind !== "str" && p.token.kind !== "placeholder") {
        throw error("Expected placeholder", p.token.span);
    }

    let value = p.token.value;
    const span = p.token.span;
    p.next();

    if (p.prev.kind === "str") {
        if (!(value.startsWith("%") && value.endsWith("%"))) {
            p.addDiagnostic(error("Expected placeholder", p.prev.span));
            return "";
        }

        value = value.substring(1, value.length - 1);
    }

    const index = value.indexOf("/");
    const name = value.substring(0, index == -1 ? value.length : index);
    const args = index == -1 ? [] : value.substring(index + 1).split(" ");

    function addIssueInvalidPlaceholder() {
        p.addDiagnostic(error("Invalid placeholder", span));
    }

    function addIssueInvalidArgument(message: string) {
        const lo = index == -1 ? value.length - 1 : index + 1;
        p.addDiagnostic(error(message, { start: span.start + lo, end: span.end }));
    }

    switch (name) {
        case "server.name":
        case "server.shortname":
        case "player.name":
        case "player.version":
        case "player.gamemode":
        case "player.region.name":
        case "player.group.name":
        case "player.group.tag":
        case "player.group.color":
        case "player.team.name":
        case "player.team.tag":
        case "player.team.color":
        case "player.parkour.formatted":
        case "house.name":
        case "house.visitingrules":
            if (args.length > 0) addIssueInvalidArgument("No arguments expected");
            addIssueInvalidPlaceholder();
            break;
        case "player.ping":
        case "player.health":
        case "player.maxhealth":
        case "player.hunger":
        case "player.experience":
        case "player.level":
        case "player.protocol":
        case "player.location.x":
        case "player.location.y":
        case "player.location.z":
        case "player.location.pitch":
        case "player.location.yaw":
        case "player.group.priority":
        case "player.parkour.ticks":
        case "house.guests":
        case "house.cookies":
        case "house.players":
        case "date.unix":
            if (args.length > 0) addIssueInvalidArgument("No arguments expected");
            break;
        case "stat.player":
        case "stat.global":
            if (args.length == 0) addIssueInvalidArgument("Expected stat key");
            break;
        case "stat.team":
            if (args.length == 0) addIssueInvalidArgument("Expected stat key");
            if (args.length == 1) addIssueInvalidArgument("Expected team name");
            if (args.length > 2) addIssueInvalidArgument("Team stat key cannot contain spaces");
            break;
        default:
            addIssueInvalidPlaceholder();
    }

    return `%${value}%`;
}
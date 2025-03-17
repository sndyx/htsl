import type { Action, Condition, Operation } from "housing-common/src/types";

export const ACTIONS = [
	"applyLayout", "applyPotion", "balanceTeam", "cancelEvent", "changeHealth", "hungerLevel",
	"maxHealth", "changePlayerGroup", "clearEffects", "closeMenu", "actionBar", "displayMenu",
	"title", "enchant", "exit", "failParkour", "fullHeal", "xpLevel", "giveItem", "houseSpawn",
	"kill", "parkCheck", "pause", "sound", "removeItem", "resetInventory", "chat", "lobby",
	"compassTarget", "gamemode", "setTeam", "tp", "consumeItem", "stat", "globalstat", "teamstat"
];

export const CONDITIONS = [
	"stat", "globalstat", "teamstat", "gamemode", "damageAmount"
];

export const ACTION_KWS: {
	[key in Action["type"]]: string
} = {
	APPLY_POTION_EFFECT: "applyPotion",
	CLEAR_POTION_EFFECTS: "clearEffects",
	FAIL_PARKOUR: "failParkour",
	GIVE_EXPERIENCE_LEVELS: "xpLevel",
	GIVE_ITEM: "giveItem",
	REMOVE_ITEM: "removeItem",
	SEND_TO_LOBBY: "lobby",
	CONDITIONAL: "if",
	SET_GROUP: "changePlayerGroup",
	KILL: "kill",
	HEAL: "fullHeal",
	TITLE: "title",
	ACTION_BAR: "actionBar",
	RESET_INVENTORY: "resetInventory",
	CHANGE_MAX_HEALTH: "maxHealth",
	CHANGE_STAT: "stat",
	CHANGE_GLOBAL_STAT: "globalstat",
	CHANGE_TEAM_STAT: "teamstat",
	CHANGE_HEALTH: "changeHealth",
	MESSAGE: "chat",
	RANDOM: "random",
	SET_VELOCITY: "setVelocity",
	TELEPORT: "tp",
	EXIT: "exit",
	CANCEL_EVENT: "cancelEvent"
};

export const CONDITION_KWS: {
	[key in Condition["type"]]: string
} = {
	COMPARE_STAT: "stat",
	REQUIRED_GAMEMODE: "gamemode",
	COMPARE_DAMAGE: "damageAmount"
}

export const OPERATION_SYMBOLS: {
	[key in Operation]: string
} = {
	increment: "+=",
	decrement: "-=",
	set: "=",
	multiply: "*=",
	divide: "/="
}

export function partialEq(src: any, target: any): boolean {
	return Object.keys(target).every((key) => {
		return target[key] === src[key];
	});
}
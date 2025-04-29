import type { Action, Comparison, Condition, Operation } from "housing-common/src/types";

export const ACTION_KWS = [
	"applyLayout", "applyPotion", "balanceTeam", "cancelEvent", "changeHealth", "hungerLevel",
	"maxHealth", "changePlayerGroup", "clearEffects", "closeMenu", "actionBar", "displayMenu",
	"title", "enchant", "exit", "failParkour", "fullHeal", "xpLevel", "giveItem", "houseSpawn",
	"kill", "parkCheck", "pause", "sound", "removeItem", "resetInventory", "chat", "lobby",
	"compassTarget", "gamemode", "setTeam", "tp", "consumeItem", "stat", "globalstat", "teamstat",
	"launch", "changeVelocity", "dropItem", "function", "random", "if"
] as const;

export type ActionKw = (typeof ACTION_KWS)[number];

export const CONDITION_KWS = [
	"blockType", "damageAmount", "damageCause", "doingParkour", "fishingEnv", "hasItem",
	"hasPotion", "isItem", "isSneaking", "maxHealth", "isFlying", "health", "hunger",
	"portal", "canPvp", "gamemode", "hasGroup", "hasPermission", "hasTeam", "inRegion",
	"teamstat", "stat", "globalstat", "placeholder"
] as const;

export type ConditionKw = (typeof CONDITION_KWS)[number];

export const ACTIONS: {
	[key in Action["type"]]: ActionKw
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
	SET_VELOCITY: "changeVelocity",
	TELEPORT: "tp",
	EXIT: "exit",
	CANCEL_EVENT: "cancelEvent",
	PLAY_SOUND: "sound",
	SET_COMPASS_TARGET: "compassTarget",
	SET_GAMEMODE: "gamemode",
	CHANGE_HUNGER: "hungerLevel",
	FUNCTION: "function",
	APPLY_INVENTORY_LAYOUT: "applyLayout",
	ENCHANT_HELD_ITEM: "enchant",
	PAUSE: "pause",
	SET_TEAM: "setTeam",
	SET_MENU: "displayMenu",
	DROP_ITEM: "dropItem",
	LAUNCH: "launch"
};

export const CONDITIONS: {
	[key in Condition["type"]]: ConditionKw
} = {
	COMPARE_HEALTH: "health",
	COMPARE_HUNGER: "hunger",
	COMPARE_MAX_HEALTH: "maxHealth",
	COMPARE_PLACEHOLDER: "placeholder",
	IS_DOING_PARKOUR: "doingParkour",
	IS_FLYING: "isFlying",
	IS_IN_REGION: "inRegion",
	IS_SNEAKING: "isSneaking",
	REQUIRE_GROUP: "hasGroup",
	REQUIRE_ITEM: "hasItem",
	REQUIRE_PERMISSION: "hasPermission",
	REQUIRE_POTION_EFFECT: "hasPotion",
	REQUIRE_TEAM: "hasTeam",
	COMPARE_TEAM_STAT: "teamstat",
	COMPARE_STAT: "stat",
	REQUIRE_GAMEMODE: "gamemode",
	COMPARE_DAMAGE: "damageAmount",
	COMPARE_GLOBAL_STAT: "globalstat"
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

export const COMPARISON_SYMBOLS: {
	[key in Comparison]: string
} = {
	less_than: "<",
	less_than_or_equals: "<=",
	equals: "==",
	greater_than: ">",
	greater_than_or_equals: ">="
}

export const SHORTHANDS = [
	"globalstat", "stat", "teamstat", "randomint", "health", "maxHealth", "hunger", "locX", "locY", "locZ", "unix"
] as const;

export function partialEq(src: any, target: any): boolean {
	return Object.keys(target).every((key) => {
		return target[key] === src[key];
	});
}

export function deepEq(obj1: any, obj2: any): boolean {
	if (obj1 === obj2) {
		return true; // Check for strict equality
	}

	if (
		typeof obj1 !== 'object' ||
		typeof obj2 !== 'object' ||
		obj1 === null ||
		obj2 === null
	) {
		return false; // Primitive values or one of them is null
	}

	if (Array.isArray(obj1) !== Array.isArray(obj2)) {
		return false; // One is an array and the other is not
	}

	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false; // Different number of keys
	}

	// Compare all keys and values recursively
	for (const key of keys1) {
		if (!keys2.includes(key) || !deepEq(obj1[key], obj2[key])) {
			return false;
		}
	}

	return true;
}
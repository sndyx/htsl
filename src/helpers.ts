// biome-ignore lint/suspicious/noExplicitAny: function should run on anything
export function partialEq(src: any, target: any): boolean {
	return Object.keys(target).every((key) => {
		return target[key] === src[key];
	});
}

export function isAction(name: string) {
	return [
		"applyLayout", "applyPotion", "balanceTeam", "cancelEvent", "changeHealth", "hungerLevel",
		"maxHealth", "changePlayerGroup", "clearEffects", "closeMenu", "actionBar", "displayMenu",
		"title", "enchant", "exit", "failParkour", "fullHeal", "xpLevel", "giveItem", "houseSpawn",
		"kill", "parkCheck", "pause", "sound", "removeItem", "resetInventory", "chat", "lobby",
		"compassTarget", "gamemode", "setTeam", "tp", "consumeItem", "stat",
	].includes(name);
}

export const ACTION_NAMES: {
	[key: string]: string
} = {
	"CHANGE_STAT": "stat",
	"TITLE": "title",
	"MESSAGE": "chat",
	"CHANGE_HEALTH": "changeHealth",
};
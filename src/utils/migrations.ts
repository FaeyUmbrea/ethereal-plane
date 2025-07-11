import { SETTINGS_VERSION } from './const.ts';
import { getGame } from './helpers.ts';
import { getSetting, setSetting } from './settings.ts';

export async function migrate(version: number) {
	console.warn('Running Ethereal Plane Migrations');
	if (version < 1) {
		console.warn('Migrations for Data-Model Version 1');
		// @ts-expect-error legacy migration
		const chatCommands = getSetting('chat-commands') as ChatCommand[];
		chatCommands.forEach((command) => {
			if (!command.commandAliases) {
				command.commandAliases = [];
			}
		});
		// @ts-expect-error legacy migration
		await setSetting('chat-commands', chatCommands);
	}
	console.warn('OBS Utils Migrations Finished');
	await setSetting('version', SETTINGS_VERSION);
}

export function getMacro(macroID: string) {
	return getGame().macros?.get(macroID)?.toCompendium();
}

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
	if (version < 2) {
		exportChatCommands();
	}
	console.warn('OBS Utils Migrations Finished');
	await setSetting('version', SETTINGS_VERSION);
}

export function exportChatCommands() {
	// @ts-expect-error legacy migration
	(game as ReadyGame).settings.register('ethereal-plane', 'chat-commands', {
		type: Object,
		scope: 'world',
		config: false,
		default: [],
	});
	const commands = foundry.utils.deepClone(
		// @ts-expect-error legacy type
		getSetting('chat-commands'),
	) as unknown as ExportChatCommand[] | undefined;

	if (!commands) return;

	commands.forEach((command) => {
		const macro = command.macro as string;
		const macroExport = (getGame().macros?.get(macro) as any)?.toCompendium();
		if (macroExport !== undefined) {
			command.macro = macroExport;
		} else {
			command.macro = '';
		}
	});

	const data = {
		type: 'EthPlaExport',
		version: 2,
		commands,
	};

	const filename = [
		'ethpla',
		getGame()?.world?.id,
		'migration_export',
		new Date().toString(),
	].filterJoin('-');
	saveDataToFile(
		JSON.stringify(data, null, 2),
		'text/json',
		`${filename}.json`,
	);
}

export interface ExportChatCommand {
	commandPrefix: string;
	commandAliases: string[];
	commandTemplate: string;
	perUserCooldown: number;
	perTargetCooldown: number;
	perTargetSubCooldown: number;
	perUserSubCooldown: number;
	targetIdentifier: string;
	macro: string | ReturnType<typeof getMacro>;
	active: false;
}

export function getMacro(macroID: string) {
	return getGame().macros?.get(macroID)?.toCompendium();
}

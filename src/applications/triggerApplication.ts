import type { ExportTriggerMacro, TriggerMacro } from '../utils/types.ts';

import { getTriggers } from '../server/trigger_api.ts';
import TriggerConfigUi from '../svelte/TriggerConfigUI.svelte';
import { getGame } from '../utils/helpers.js';
import { getSetting, setSetting } from '../utils/settings.js';
import { readTextFromFile } from '../utils/utils';
import { SvelteApplicationMixin } from './mixin.svelte.ts';

export class TriggerApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
	protected override root = TriggerConfigUi;

	static override DEFAULT_OPTIONS = {
		classes: ['ep-chat-commands'],
		id: 'chat-command-config-application',
		title: 'ethereal-plane.ui.chat-command-application-title',
		position: {
			width: 800,
			height: 520,
		},
		window: {
			minimizable: true,
			resizable: true,
			controls: [
				{
					icon: 'fas fa-file-import',
					label: 'ethereal-plane.ui.commands.import.button',
					action: 'import-data',
				},
				{
					icon: 'fas fa-file-export',
					label: 'ethereal-plane.ui.commands.export.button',
					action: 'export-data',
				},
			],
		},
		actions: {
			'import-data': TriggerApplication.import_data,
			'export-data': TriggerApplication.export_data,
		},
	};

	static async import_data() {
		new Dialog(
			{
				title: (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.title'),
				content: await renderTemplate(`templates/apps/import-data.${getGame().version.startsWith('12.') ? 'html' : 'hbs'}`, {
					hint1: (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.hint1'),
					hint2: (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.hint2'),
				}),
				buttons: {
					import: {
						icon: '<i class="fas fa-file-import"></i>',
						label: (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.button'),
						callback: (html) => {
							const form = (html as JQuery<HTMLElement>).find(
								'form',
							)[0] as HTMLFormElement;
							if (!form.data.files.length) {
								ui?.notifications?.error(
									(game as ReadyGame).i18n.localize(
										'ethereal-plane.ui.commands.import.data-file-error',
									),
								);
							}
							const file = form.data.files[0];
							readTextFromFile(file).then(json =>
								importChatCommands(json, false),
							);
						},
					},
					withMacros: {
						icon: '<i class="fas fa-file-import"></i>',
						label:
              (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.with-macros'),
						callback: (html) => {
							const form = (html as JQuery<HTMLElement>).find(
								'form',
							)[0] as HTMLFormElement;
							if (!form.data.files.length) {
								ui?.notifications?.error(
									(game as ReadyGame).i18n.localize(
										'ethereal-plane.ui.commands.import.data-file-error',
									),
								);
							}
							readTextFromFile(form.data.files[0]).then(json =>
								importChatCommands(json, true),
							);
						},
					},
					no: {
						icon: '<i class="fas fa-times"></i>',
						label: (game as ReadyGame).i18n.localize('ethereal-plane.ui.cancel'),
					},
				},
				default: 'import',
			},
			{
				width: 400,
			},
		).render(true);
	}

	static export_data() {
		new Dialog({
			title: (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.export.title'),
			content: (game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.export.content'),
			buttons: {
				yes: {
					label: (game as ReadyGame).i18n.localize('ethereal-plane.ui.yes'),
					callback: () => exportChatCommands(true),
				},
				no: {
					label: (game as ReadyGame).i18n.localize('ethereal-plane.ui.no'),
					callback: () => exportChatCommands(false),
				},
			},
		}).render(true);
	}
}

function exportChatCommands(withMacro: boolean) {
	const commands = foundry.utils.deepClone(
		getSetting('chat-trigger-macros'),
	) as unknown as ExportTriggerMacro[];

	if (withMacro) {
		commands.forEach((command) => {
			const macro = command.macro as string;
			const macroExport: Macro = (getGame().macros?.get(macro) as any)?.toCompendium();
			if (macroExport !== undefined) {
				command.macro = macroExport;
			} else {
				command.macro = '';
			}
		});
	} else {
		commands.forEach((command) => {
			command.macro = '';
		});
	}

	const data = {
		type: 'EthPlaExport',
		version: 3,
		commands,
	};

	const filename = [
		'ethpla',
		getGame()?.world?.id,
		'triggers',
		withMacro ? 'with_macros' : '',
		new Date().toString(),
	].filterJoin('-');
	saveDataToFile(
		JSON.stringify(data, null, 2),
		'text/json',
		`${filename}.json`,
	);
}

/**
 * @param {string} data
 * @param {boolean} withMacros
 */
async function importChatCommands(data: string, withMacros: boolean) {
	const imported = JSON.parse(data) as {
		version: number;
		type: string;
		commands: ExportTriggerMacro[];
	};
	const triggers = await getTriggers();
	if (triggers === undefined) {
		return;
	}
	if (imported.type !== 'EthPlaExport') {
		throw new Error(
			(game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.wrong-file-error'),
		);
	}
	if (imported.version > 3 || imported.version < 3) {
		throw new Error(
			(game as ReadyGame).i18n.localize('ethereal-plane.ui.commands.import.wrong-version-error'),
		);
	}
	let folder: Folder | undefined = getGame().macros?.folders.find(
		folder => folder.name === 'Ethereal Plane',
	);
	if (folder === undefined && withMacros) {
		folder = await Folder.create(
			{ type: 'Macro', name: 'Ethereal Plane' },
		);
	}
	const triggerMacros: TriggerMacro[] = [];
	for (const command of imported.commands) {
		if (!triggers.find(trigger => trigger.id === command.id)) {
			// Do not import macros for triggers we don't have
			continue;
		}
		if (typeof command.macro === 'string') {
			const macro = getGame()?.macros.get(command.macro);
			if (macro !== undefined) {
				triggerMacros.push({
					id: command.id,
					macro: macro.id,
				});
			}
		} else {
			if (folder !== undefined) {
				// @ts-expect-error wrong type
				command.macro.folder = folder;
			}
			const macro = (await Macro.create(command.macro))?.id;
			if (macro !== undefined) {
				triggerMacros.push({
					id: command.id,
					macro,
				});
			}
		}
	}
	const commandData = getSetting('chat-trigger-macros') as TriggerMacro[];
	commandData.push(...(triggerMacros));
	await setSetting('chat-trigger-macros', commandData);
}

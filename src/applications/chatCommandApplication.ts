import type {
	ChatCommand,
	ExportChatCommand,
	ImportChatCommand,
} from '../utils/chatCommands.js';
import {
	SvelteApplication,
} from '#runtime/svelte/application';
import { localize } from '#runtime/util/i18n';
import ChatCommandConfigUI from '../svelte/ChatCommandConfigUI.svelte';
import { getGame } from '../utils/helpers.js';
import { getSetting, setSetting } from '../utils/settings.js';
import { readTextFromFile } from '../utils/utils';

// @ts-expect-error get off my case
export class ChatCommandApplication extends SvelteApplication {
	/** @static */
	static override get defaultOptions() {
		return foundry.utils.mergeObject(
			super.defaultOptions,
			{
				classes: ['ep-chat-commands'],
				minimizable: true,
				width: 800,
				height: 520,
				id: 'chat-command-config-application',
				title: 'ethereal-plane.ui.chat-command-application-title',
				resizable: true,
				positionOrtho: false,
				transformOrigin: null,
				svelte: {
					class: ChatCommandConfigUI,
					target: document.body,
					intro: true,
				},
			},
		);
	}

	override _getHeaderButtons() {
		const buttons = super._getHeaderButtons();

		buttons.unshift(
			{
				icon: 'fas fa-file-import',
				class: 'import-data',
				label: localize('ethereal-plane.ui.commands.import.button'),

				async onclick() {
					new Dialog(
						{
							title: `${localize('ethereal-plane.ui.commands.import.title')}`,
							content: await renderTemplate(`templates/apps/import-data.${getGame().version.startsWith('12.') ? 'html' : 'hbs'}`, {
								hint1: localize('ethereal-plane.ui.commands.import.hint1'),
								hint2: localize('ethereal-plane.ui.commands.import.hint2'),
							}),
							buttons: {
								import: {
									icon: '<i class="fas fa-file-import"></i>',
									label: localize('ethereal-plane.ui.commands.import.button'),
									callback: (html) => {
										const form = (html as JQuery<HTMLElement>).find(
											'form',
										)[0] as HTMLFormElement;
										if (!form.data.files.length) {
											ui?.notifications?.error(
												localize(
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
									label: localize(
										'ethereal-plane.ui.commands.import.with-macros',
									),
									callback: (html) => {
										const form = (html as JQuery<HTMLElement>).find(
											'form',
										)[0] as HTMLFormElement;
										if (!form.data.files.length) {
											ui?.notifications?.error(
												localize(
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
									label: localize('ethereal-plane.ui.cancel'),
								},
							},
							default: 'import',
						},
						{
							width: 400,
						},
					).render(true);
				},
			},
			{
				icon: 'fas fa-file-export',
				label: localize('ethereal-plane.ui.commands.export.button'),
				class: 'export-data',

				onclick() {
					new Dialog({
						title: localize('ethereal-plane.ui.commands.export.title'),
						content: localize('ethereal-plane.ui.commands.export.content'),
						buttons: {
							yes: {
								label: localize('ethereal-plane.ui.yes'),
								callback: () => exportChatCommands(true),
							},
							no: {
								label: localize('ethereal-plane.ui.no'),
								callback: () => exportChatCommands(false),
							},
						},
					}).render(true);
				},
			},
		);

		return buttons;
	}
}

function exportChatCommands(withMacro: boolean) {
	const commands = foundry.utils.deepClone(
		getSetting('chat-commands'),
	) as ExportChatCommand[];

	if (withMacro) {
		commands.forEach((command) => {
			const macro = command.macro as string;
			const macroExport = (getGame().macros?.get(macro) as any)?.toCompendium();
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
		version: 2,
		commands,
	};

	const filename = [
		'ethpla',
		getGame()?.world?.id,
		'chat_commands',
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
		commands: ImportChatCommand[];
	};
	if (imported.type !== 'EthPlaExport') {
		throw new Error(
			localize('ethereal-plane.ui.commands.import.wrong-file-error'),
		);
	}
	if (imported.version > 2 || imported.version < 1) {
		throw new Error(
			localize('ethereal-plane.ui.commands.import.wrong-version-error'),
		);
	}
	let folder: Folder | undefined = getGame().macros?.folders.find(
		folder => folder.name === 'Ethereal Plane',
	);
	if (folder === undefined && withMacros) {
		// @ts-expect-error get off my case
		folder = await Folder.create(
			new Folder({ type: 'Macro', name: 'Ethereal Plane' }),
		);
	}
	for (const command of imported.commands) {
		if (typeof command.macro !== 'string' && withMacros) {
			// @ts-expect-error get off my case
			command.macro.folder = folder?.id;
			// @ts-expect-error get off my case
			command.macro = (await Macro.create(command.macro)).id;
		} else {
			command.macro = '';
		}
		if (imported.version === 1) {
			// @ts-expect-error get off my case
			command.commandAliases = [];
		}
	}
	const commandData = getSetting('chat-commands') as ChatCommand[];
	commandData.push(...(imported.commands as unknown as ChatCommand[]));
	await setSetting('chat-commands', commandData);
}

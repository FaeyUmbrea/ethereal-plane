import type { ExportTriggerMacro, TriggerMacro } from '../utils/types.ts';
import {
	SvelteApplication,
} from '#runtime/svelte/application';
import { localize } from '#runtime/util/i18n';
import { getTriggers } from '../server/trigger_api.ts';
import TriggerConfigUi from '../svelte/TriggerConfigUI.svelte';
import { getGame } from '../utils/helpers.js';
import { getSetting, setSetting } from '../utils/settings.js';
import { readTextFromFile } from '../utils/utils';

// @ts-expect-error get off my case
export class TriggerApplication extends SvelteApplication {
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
					class: TriggerConfigUi,
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
				icon: 'fas fa-file-export',
				label: localize('ethereal-plane.ui.commands.export-legacy.button'),
				class: 'export-data',

				onclick() {
					import('../utils/migrations.ts').then(migrations => migrations.exportChatCommands());
				},
			},
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
			localize('ethereal-plane.ui.commands.import.wrong-file-error'),
		);
	}
	if (imported.version > 3 || imported.version < 3) {
		throw new Error(
			localize('ethereal-plane.ui.commands.import.wrong-version-error'),
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

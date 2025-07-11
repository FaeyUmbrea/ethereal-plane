import type { SvelteApplication } from '#runtime/svelte/application';
import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID, SETTINGS_VERSION } from './const.js';
import { getGame } from './helpers.js';
import { Poll } from './polls.js';

const debouncedReload = foundry.utils.debounce(
	() => window.location.reload(),
	100,
);

class EtherealPlaneSettings extends TJSGameSettings {
	constructor() {
		super(MODULE_ID);
	}

	init() {
		const settings: unknown[] = [];
		settings.push(
			createSetting('server-url', {
				default: 'http://localhost:3000',
				type: String,
				scope: 'client',
				config: false,
			}),
		);
		settings.push(
			createSetting('enabled', {
				default: false,
				type: Boolean,
				scope: 'world',
				config: true,
				onChange: () => {
					debouncedReload();
				},
			}),
		);
		settings.push(
			createSetting('polls-enabled', {
				default: false,
				type: Boolean,
				scope: 'world',
				config: false,
				onChange: () => {
					if (canvas?.activeLayer?.name === 'TokenLayer') {
						// @ts-expect-error old code
						ui?.controls?.initialize({ layer: 'tokens', tool: 'select' });
					}
				},
			}),
		);
		settings.push(
			createSetting('send-rolls-to-chat', {
				default: true,
				type: Boolean,
				scope: 'world',
				config: false,
			}),
		);
		settings.push(
			createSetting('currentPoll', {
				type: Object,
				scope: 'world',
				config: false,
				default: new Poll(),
			}),
		);
		settings.push(
			createSetting('authentication-token', {
				type: String,
				scope: 'client',
				config: false,
				default: '',
			}),
		);
		settings.push(
			createSetting('refresh-token', {
				type: String,
				scope: 'client',
				config: false,
				default: '',
			}),
		);
		settings.push(
			createSetting('version', {
				type: Number,
				scope: 'world',
				config: false,
				default: -1,
			}),
		);
		settings.push(
			createSetting('chat-message-template', {
				type: String,
				scope: 'world',
				config: false,
				default: '%USER% rolled %FORMULA% and got a %RESULT%!',
			}),
		);
		settings.push(
			createSetting('campaign-id', {
				type: String,
				scope: 'world',
				config: false,
				default: '',
			}),
		);

		settings.push(
			createSetting('last-read-notification', {
				type: String,
				scope: 'client',
				config: false,
				default: '',
			}),
		);
		settings.push(
			createSetting('allow-socket', {
				type: Boolean,
				scope: 'world',
				config: false,
				default: false,
			}),
		);
		settings.push(
			createSetting('allow-api', {
				type: Boolean,
				scope: 'world',
				config: false,
				default: false,
			}),
		);
		settings.push(
			createSetting('chat-trigger-macros', {
				type: Object,
				scope: 'world',
				config: false,
				default: [],
			}),
		);
		settings.push(
			createSetting('chat-commands-active', {
				type: Boolean,
				scope: 'world',
				config: true,
				default: false,
				onChange: () => {
					debouncedReload();
				},
			}),
		);

		this.registerAll(settings as never, true);
	}
}

function createSetting(
	settingName: string,
	config: Record<string, unknown>,
) {
	return {
		namespace: MODULE_ID,
		key: settingName,
		options: {
			name: `${MODULE_ID}.settings.${settingName}.Name`,
			hint: `${MODULE_ID}.settings.${settingName}.Hint`,
			...config,
		},
	};
}

export async function registerMenus() {
	if ((getGame().user)?.isGM) {
		const { ConfigApplication } = await import(
			'../applications/configApplication.js'
		);

		getGame().settings.registerMenu(MODULE_ID, 'setup', {
			name: `${MODULE_ID}.settings.setup.Name`,
			label: `${MODULE_ID}.settings.setup.Label`,
			hint: '',
			icon: 'fas fa-bars',
			restricted: true,
			type: SettingsShell(ConfigApplication),
		});

		const { TriggerApplication } = await import(
			'../applications/triggerApplication.ts'
		);

		getGame().settings.registerMenu(MODULE_ID, 'chat-commands', {
			name: `${MODULE_ID}.settings.chat-commands.Name`,
			label: `${MODULE_ID}.settings.chat-commands.Label`,
			hint: '',
			icon: 'fas fa-bars',
			restricted: true,
			type: SettingsShell(TriggerApplication),
		});
	}
}

export function getSetting(
	settingName: ClientSettings.KeyFor<'ethereal-plane'>,
) {
	return getGame().settings.get(MODULE_ID, settingName);
}

export async function setSetting<T extends ClientSettings.KeyFor<'ethereal-plane'>>(
	settingName: T,
	value: ClientSettings.SettingCreateData<'ethereal-plane', T>,
) {
	await getGame().settings.set(MODULE_ID, settingName, value);
}

function SettingsShell(Application: new () => SvelteApplication) {
	return class Shell extends FormApplication {
		static #mceSettingsApp: SvelteApplication;

		constructor(object: object = {}, options: Partial<FormApplication.Options> = {}) {
			super(object, options);
			Shell.showSettings();
		}

		static showSettings() {
			this.#mceSettingsApp = this.#mceSettingsApp
				? this.#mceSettingsApp
				: new Application();
			this.#mceSettingsApp.render(true, { focus: true });

			return this.#mceSettingsApp;
		}

		override render() {
			this.close();
			return this;
		}

		async _updateObject() {}

		static registerSettings(): void {
			// ignored
		};
	};
}

export const settings = new EtherealPlaneSettings();

export function runMigrations() {
	const version = getSetting('version') as number ?? 0;
	if (version === SETTINGS_VERSION) return;
	if (version === -1) {
		setSetting('version', SETTINGS_VERSION);
		return;
	}
	if (version < SETTINGS_VERSION) {
		import('./migrations.ts').then(migrate => migrate.migrate(version));
	}
}

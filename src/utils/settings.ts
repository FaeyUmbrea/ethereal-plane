import type { Readable, Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { MODULE_ID, SETTINGS_VERSION } from './const.js';
import { getGame } from './helpers.js';
import { Poll } from './polls.js';

const debouncedReload = foundry.utils.debounce(
	() => window.location.reload(),
	100,
);

export function initSettings() {
	createSetting('server-url', {
		default: 'http://localhost:3000',
		type: String,
		scope: 'client',
		config: false,
	});
	createSetting('enabled', {
		default: false,
		type: Boolean,
		scope: 'world',
		config: true,
		onChange: () => {
			debouncedReload();
		},
	});
	createSetting('polls-enabled', {
		default: false,
		type: Boolean,
		scope: 'world',
		config: false,
		onChange: () => {
			if (canvas?.activeLayer?.name === 'TokenLayer') {
				ui?.controls?.initialize({ layer: 'tokens', tool: 'select' });
			}
		},
	});
	createSetting('send-rolls-to-chat', {
		default: true,
		type: Boolean,
		scope: 'world',
		config: false,
	});
	createSetting('currentPoll', {
		type: Object,
		scope: 'world',
		config: false,
		default: new Poll(),
	});
	createSetting('authentication-token', {
		type: String,
		scope: 'client',
		config: false,
		default: '',
	});
	createSetting('refresh-token', {
		type: String,
		scope: 'client',
		config: false,
		default: '',
	});
	createSetting('version', {
		type: Number,
		scope: 'world',
		config: false,
		default: -1,
	});
	createSetting('chat-message-template', {
		type: String,
		scope: 'world',
		config: false,
		default: '%USER% rolled %FORMULA% and got a %RESULT%!',
	});
	createSetting('campaign-id', {
		type: String,
		scope: 'world',
		config: false,
		default: '',
	});

	createSetting('last-read-notification', {
		type: String,
		scope: 'client',
		config: false,
		default: '',
	});
	createSetting('allow-socket', {
		type: Boolean,
		scope: 'world',
		config: false,
		default: false,
	});
	createSetting('allow-api', {
		type: Boolean,
		scope: 'world',
		config: false,
		default: false,
	});
	createSetting('chat-trigger-macros', {
		type: Object,
		scope: 'world',
		config: false,
		default: [],
	});
	createSetting('chat-commands-active', {
		type: Boolean,
		scope: 'world',
		config: true,
		default: false,
		onChange: () => {
			debouncedReload();
		},
	});
}

type StoreMap = Map<string, Writable<any>>;
const stores: StoreMap = new Map();

/**
 * Get a readable store for a setting key, if it exists.
 */
export function getReadableStore<T = any>(key: ClientSettings.KeyFor<'ethereal-plane'>): Readable<T> | undefined {
	const s = stores.get(key as string);
	return s ? { subscribe: s.subscribe } : undefined;
}

/**
 * Get a writable store for a setting key, if it exists.
 */
export function getStore<K extends ClientSettings.KeyFor<'ethereal-plane'>, T = ClientSettings.SettingInitializedType<'ethereal-plane', K>>(key: K): Writable<T> {
	return stores.get(key as string) as Writable<T>;
}

/**
 * Internal: ensure a store exists for key, initialized from game settings.
 * Also wires two-way sync between the store and Foundry settings.
 */
function ensureStore<T = any>(key: ClientSettings.KeyFor<'ethereal-plane'>): Writable<T> {
	let store = stores.get(key as string) as Writable<T> | undefined;
	if (store) return store;

	// Initialize with current value (or undefined until Foundry returns)
	const initial = getSetting(key);
	store = writable<T>(initial as T);
	stores.set(key as string, store);

	// Gate to avoid loops when syncing both ways
	let gate = false;

	// When Foundry setting changes -> update store
	Hooks.on('updateSetting', (data: any) => {
		const fullKey: string | undefined
			= typeof data?.key === 'string' ? data.key : (typeof data?.key === 'object' ? data?.key?.key : undefined);
		const namespace: string | undefined
			= typeof data?.namespace === 'string' ? data.namespace : data?.key?.namespace;

		const matches
			= (namespace === MODULE_ID && data?.key === key)
				|| fullKey === `${MODULE_ID}.${key}`;

		if (!matches) return;

		if (!gate) {
			gate = true;
			store!.set((game as ReadyGame).settings.get(MODULE_ID, key) as T);
			gate = false;
		}
	});

	// When store changes -> set Foundry setting (skip the very first emission which is initial)
	let first = true;
	store.subscribe(async (value) => {
		if (first) {
			first = false;
			return;
		}
		if (!gate && game.ready) {
			gate = true;
			await (game as ReadyGame).settings.set(MODULE_ID, key, value as any);
			gate = false;
		}
	});

	return store;
}

// Change: createSetting now also creates/wires the Svelte store for the setting key.
function createSetting(settingName: ClientSettings.KeyFor<'ethereal-plane'>, config: any) {
	(game as ReadyGame).settings.register(MODULE_ID, settingName, {
		name: `${MODULE_ID}.settings.${settingName}.Name`,
		hint: `${MODULE_ID}.settings.${settingName}.Hint`,
		...config,
		onChange: (value: unknown) => {
			if (typeof config?.onChange === 'function') {
				try {
					config.onChange(value);
				} catch (e) {
					console.error(e);
				}
			}
			const store = ensureStore(settingName);
			store.set(value);
		},
	});

	const store = ensureStore(settingName);
	store.set((game as ReadyGame).settings.get(MODULE_ID, settingName));
}

export const settings = {
	getSetting,
	setSetting,
	getStore,
	getReadableStore,
};

export async function registerMenus() {
	if ((getGame().user)?.isGM) {
		const { ConfigApplication } = await import(
			'../applications/configApplication.js',
		);

		getGame().settings.registerMenu(MODULE_ID, 'setup', {
			name: `${MODULE_ID}.settings.setup.Name`,
			label: `${MODULE_ID}.settings.setup.Label`,
			hint: '',
			icon: 'fas fa-bars',
			restricted: true,
			type: ConfigApplication,
		});

		const { TriggerApplication } = await import(
			'../applications/triggerApplication.ts',
		);

		getGame().settings.registerMenu(MODULE_ID, 'chat-commands', {
			name: `${MODULE_ID}.settings.chat-commands.Name`,
			label: `${MODULE_ID}.settings.chat-commands.Label`,
			hint: '',
			icon: 'fas fa-bars',
			restricted: true,
			type: TriggerApplication,
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

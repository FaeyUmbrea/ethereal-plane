import type { AllHooks } from 'fvtt-types/src/foundry/client/hooks';
import type { ComponentConstructorOptions, SvelteComponent } from 'svelte';
import type { EtherealPlaneAPI } from './utils/api.js';
import type { ChatCommand } from './utils/chatCommands.js';
import type { Modes } from './utils/const.ts';
import type { Poll } from './utils/polls.js';

declare global {
	interface obsAPI {
		registerUniqueOverlay: (
			component: new (
				options: ComponentConstructorOptions<Record<string, never>>,
			) => SvelteComponent,
		) => void;
	}
	interface Module {
		api: EtherealPlaneAPI | obsAPI;
	}
	interface ModuleConfig {
		'ethereal-plane': {
			api: EtherealPlaneAPI;
		};
		'obs-utils': {
			api: {
				registerUniqueOverlay: (
					component: new (
						options: ComponentConstructorOptions<Record<string, never>>,
					) => SvelteComponent,
				) => void;
			};
		};
	}
	interface SettingConfig {
		'ethereal-plane.server-url': string;
		'ethereal-plane.enabled': boolean;
		'ethereal-plane.polls-enabled': boolean;
		'ethereal-plane.send-rolls-to-chat': boolean;
		'ethereal-plane.currentPoll': typeof Poll;
		'ethereal-plane.enable-chat-tab': boolean;
		'ethereal-plane.authentication-token': string;
		'ethereal-plane.refresh-token': string;
		'ethereal-plane.version': number;
		'ethereal-plane.chat-message-template': string;
		'ethereal-plane.campaign-id': string;
		'ethereal-plane.last-read-notification': string;
		'ethereal-plane.allow-socket': boolean;
		'ethereal-plane.allow-api': boolean;
		'ethereal-plane.chat-commands': ChatCommand[];
		'ethereal-plane.chat-commands-active': boolean;
	}
	interface World {
		id: string;
	}

	namespace HookConfig {
		interface HookConfig extends AllHooks {
			'ethereal-plane.patreon-login': () => void;
			'ethereal-plane.init': () => void;
			'ethereal-plane.patreon-logout': () => void;
			'ethereal-plane.patreon-connect': () => void;
			'ethereal-plane.patreon-disconnect': () => void;
			'ethereal-plane.set-youtube-id': (id: string) => void;
			'ethereal-plane.set-patreon-id': (id: string) => void;
			'ethereal-plane.set-campaign-id': (id: string) => void;
			'ethereal-plane.set-mode': (mode: Modes) => void;
			'ethereal-plane.set-version': (version: number) => void;
			'ethereal-plane.set-chat-message-template': (template: string) => void;
			'ethereal-plane.set-chat-commands': (commands: ChatCommand[]) => void;
			'midi-qol.DamageRollComplete': (workflow: DamageWorkflow) => void;
			'midi-qol.AttackRollComplete': (workflow: Workflow) => void;
			'obs-utils.init': () => void;
			'getSceneControlButtons': (controls: SceneControls) => void;
		}
	}
}

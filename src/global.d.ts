import 'svelte';
import { SvelteComponent } from 'svelte';
import type { Poll } from './utils/polls.js';
import type { Modes } from './utils/const.js';

declare global {
  interface Window {
    socketlib: {
      registerModule(string): {
        executeAsGM(string, ...args): void;
        register(string): void;
      };
    };
  }
  interface ModuleConfig {
    'obs-utils': {
      api: {
        registerUniqueOverlay(overlay: typeof SvelteComponent): void;
      };
    };
  }

  interface RequiredModules {
    'obs-utils': true;
  }

  const module: Game.ModuleData<foundry.packages.ModuleData> = game.module.get('obs-utils');
  namespace ClientSettings {
    interface Values {
      'ethereal-plane.server-url': string;
      'ethereal-plane.currentPoll': Poll;
      'ethereal-plane.refresh-token': string;
      'ethereal-plane.mode': Modes;
      'ethereal-plane.patreon-status': PatreonStatus;
      'ethereal-plane.chat-message-template': string;
      'ethereal-plane.last-read-notification': number;
    }
  }
}

declare interface PatreonStatus {
  polls: boolean;
  twitch: boolean;
  customTwitchBot: boolean;
  youtube: boolean;
}

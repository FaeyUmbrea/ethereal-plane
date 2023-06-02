import 'svelte';
import { SvelteComponent } from 'svelte';
import type { Poll } from './utils/polls.js';

declare global {
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
    }
  }
}

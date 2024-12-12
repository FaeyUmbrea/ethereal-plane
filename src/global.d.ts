import type { EtherealPlaneAPI } from "./utils/api.js";
import { Modes } from "./utils/const.js";
import { ChatCommand } from "./utils/chatCommands.js";
import { Poll } from "./utils/polls.js";
import { SvelteApplicationOptions } from "#runtime/svelte/application";
import PollOverlay from "./svelte/overlays/PollOverlay.svelte";

declare global {
  interface ModuleConfig {
    "ethereal-plane": {
      api: EtherealPlaneAPI;
    };
    "obs-utils": {
      api: {
        registerUniqueOverlay: (component: typeof PollOverlay) => void;
      };
    };
  }
  interface SettingConfig {
    "ethereal-plane.server-url": string;
    "ethereal-plane.enabled": boolean;
    "ethereal-plane.polls-enabled": boolean;
    "ethereal-plane.send-rolls-to-chat": boolean;
    "ethereal-plane.currentPoll": typeof Poll;
    "ethereal-plane.enable-chat-tab": boolean;
    "ethereal-plane.authentication-token": string;
    "ethereal-plane.refresh-token": string;
    "ethereal-plane.mode": Modes;
    "ethereal-plane.version": number;
    "ethereal-plane.chat-message-template": string;
    "ethereal-plane.campaign-id": string;
    "ethereal-plane.last-read-notification": string;
    "ethereal-plane.allow-socket": boolean;
    "ethereal-plane.allow-api": boolean;
    "ethereal-plane.chat-commands": ChatCommand[];
    "ethereal-plane.chat-commands-active": boolean;
  }
  interface World {
    id: string;
  }
  namespace Hooks {
    interface StaticCallbacks {
      "ethereal-plane.patreon-login": () => void;
      "ethereal-plane.patreon-logout": () => void;
      "ethereal-plane.patreon-connect": () => void;
      "ethereal-plane.patreon-disconnect": () => void;
      "ethereal-plane.set-youtube-id": (id: string) => void;
      "ethereal-plane.set-patreon-id": (id: string) => void;
      "ethereal-plane.set-campaign-id": (id: string) => void;
      "ethereal-plane.set-mode": (mode: Modes) => void;
      "ethereal-plane.set-version": (version: number) => void;
      "ethereal-plane.set-chat-message-template": (template: string) => void;
      "ethereal-plane.set-chat-commands": (commands: ChatCommand[]) => void;
    }
  }
}

declare module "#runtime/svelte/application" {
  // @ts-expect-error AAAAAAAA
  export class SvelteApplication extends Application {
    constructor(
      options?: Partial<
        ApplicationOptions &
          (
            | SvelteApplicationOptions
            | {
                svelte: {
                  props: Record<string, unknown>;
                  class?: undefined | unknown;
                };
              }
          )
      >,
    );
    options: ApplicationOptions & SvelteApplicationOptions;
    static defaultOptions: ApplicationOptions;
  }
}

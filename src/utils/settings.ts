import { Poll } from './polls.js';
import { ConfigApplication } from '../applications/configApplication.js';
import { getGame } from './helpers.js';
import { Modes } from './const.js';
import NotificationCenter from '../applications/notificationCenter.js';
import notifications from './notifications.json';
import { type GameSetting, TJSGameSettings } from '@typhonjs-fvtt/runtime/svelte/store/fvtt/settings';

const moduleID = 'ethereal-plane';

class EtherealPlaneSettings extends TJSGameSettings {
  constructor() {
    super(moduleID);
  }

  init() {
    const settings: GameSetting[] = [];

    getGame().settings.registerMenu(moduleID, 'setup', {
      name: `${moduleID}.settings.setup.Name`,
      label: `${moduleID}.settings.setup.Label`,
      hint: '',
      icon: 'fas fa-bars',
      restricted: true,
      type: SettingsShell(ConfigApplication)
    });

    settings.push(
      registerSetting('server-url', {
        default: 'http://localhost:3000',
        type: String,
        scope: 'client',
        config: false,
      }),
    );
    settings.push(
      registerSetting('enabled', {
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
      registerSetting('polls-enabled', {
        default: false,
        type: Boolean,
        scope: 'world',
        config: false,
        onChange: () => {
          if (canvas?.activeLayer?.name === 'TokenLayer') {
            ui?.controls?.initialize({ layer: 'tokens', tool: 'select' });
          }
        },
      }),
    );
    settings.push(
      registerSetting('send-rolls-to-chat', {
        default: true,
        type: Boolean,
        scope: 'world',
        config: false
      }),
    );
    settings.push(
      registerSetting('currentPoll', {
        type: Object,
        scope: 'world',
        config: false,
        default: new Poll(),
      }),
    );
    settings.push(
      registerSetting('enable-chat-tab', {
        type: Boolean,
        scope: 'world',
        config: true,
        default: true,
        onChange: () => {
          debouncedReload();
        },
      }),
    );
    settings.push(
      registerSetting('authentication-token', {
        type: String,
        scope: 'client',
        config: false,
        default: '',
      }),
    );
    settings.push(
      registerSetting('refresh-token', {
        type: String,
        scope: 'client',
        config: false,
        default: '',
      }),
    );
    settings.push(
      registerSetting('mode', {
        type: String,
        choices: Object.values(Modes).reduce((a, v) => ({ ...a, [v]: `ethereal-plane.settings.mode.${v}` }), {}),
        scope: 'world',
        config: false,
        default: Modes.localonly
      }),
    );
    settings.push(
      registerSetting('version', {
        type: Number,
        scope: 'world',
        config: false,
        default: 0
      }),
    );
    settings.push(
      registerSetting('available-features', {
        type: Array<string>,
        scope: 'client',
        config: false,
        default: [],
        onChange: async (features: string[]) => {
          if (
            getSetting('enabled') &&
            getSetting('mode') === Modes.patreon &&
            getSetting('polls-enabled') &&
            !features.includes('twitch-polls') &&
            !features.includes('youtube-polls')
          ) {
            ui.notifications?.error(
              'Mode set to patreon but polls are not available for the current user. Disabling Polls.'
            );
            await setSetting('polls-enabled', false);
          }
        },
      }),
    );
    settings.push(
      registerSetting('patreon-status', {
        type: Object,
        scope: 'client',
        config: false,
        default: false
      }),
    );
    settings.push(
      registerSetting('chat-message-template', {
        type: String,
        scope: 'world',
        config: false,
        default: '%USER% rolled %FORMULA% and got a %RESULT%!'
      }),
    );
    settings.push(
      registerSetting('campaign-id', {
        type: String,
        scope: 'world',
        config: false,
        default: ''
      }),
    );
    settings.push(
      registerSetting('last-read-notification', {
        type: Number,
        scope: 'client',
        config: false,
        default: 0
      }),
    );
    settings.push(
      registerSetting('allow-socket', {
        type: Boolean,
        scope: 'world',
        config: false,
        default: false
      }),
    );
    settings.push(
      registerSetting('chat-commands', {
        type: Object,
        scope: 'world',
        config: false,
        default: []
      })
    );
    settings.push(
      registerSetting('chat-commands-active', {
        type: Boolean,
        scope: 'world',
        config: false,
        default: false
      })
    );
    this.registerAll(settings, true);
  }
}

function registerSetting(settingName, config, folder = '') {
  return {
    namespace: moduleID,
    key: settingName,
    folder,
    options: {
      name: `${moduleID}.settings.${settingName}.Name`,
      hint: `${moduleID}.settings.${settingName}.Hint`,
      ...config
    },
  };
}

export function getSetting<N extends string>(settingName: N): ClientSettings.Values[`${typeof moduleID}.${N}`] {
  return getGame().settings.get(moduleID, settingName);
}

export async function setSetting<N extends string>(
  settingName: N,
  value: ClientSettings.Values[`${typeof moduleID}.${N}`]
) {
  await getGame().settings.set(moduleID, settingName, value);
}

function SettingsShell(Application) {
  return class Shell extends FormApplication {
    static #mceSettingsApp;

    /**
     * @inheritDoc
     */
    constructor(options = {}) {
      super({}, options);
      Shell.showSettings();
    }

    static showSettings() {
      this.#mceSettingsApp = this.#mceSettingsApp ? this.#mceSettingsApp : new Application();
      this.#mceSettingsApp.render(true, { focus: true });

      return this.#mceSettingsApp;
    }

    render() {
      this.close();
    }

    protected async _updateObject() {
      return;
    }
  };
}

export const settings = new EtherealPlaneSettings();
const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);

export function showNotifications() {
  const lastRead = getSetting('last-read-notification');
  if (lastRead < notifications[0].id) {
    //@ts-ignore
    new NotificationCenter().render(true);
  }
}

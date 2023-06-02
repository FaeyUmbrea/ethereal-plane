import { Poll } from './polls.js';
import { type GameSetting, TJSGameSettings } from '@typhonjs-fvtt/svelte-standard/store';
import { ConfigApplication } from '../applications/configApplication.js';
import { getGame } from './helpers.js';

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
      hint: `${moduleID}.settings.setup.Hint`,
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
      })
    );
    settings.push(
      registerSetting('enabled', {
        default: false,
        type: Boolean,
        scope: 'client',
        config: true,
        onChange: () => {
          debouncedReload();
        },
      })
    );
    settings.push(
      registerSetting('sendRollsToChat', {
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
      })
    );
    settings.push(
      registerSetting('currentPoll', {
        type: Object,
        scope: 'world',
        config: false,
        default: new Poll(),
      })
    );
    settings.push(
      registerSetting('enableChatTab', {
        type: Boolean,
        scope: 'world',
        config: true,
        default: true,
      })
    );
    settings.push(
      registerSetting('authentication-token', {
        type: String,
        scope: 'client',
        config: false,
        default: '',
      })
    );
    settings.push(
      registerSetting('refresh-token', {
        type: String,
        scope: 'client',
        config: false,
        default: '',
      })
    );
    settings.push(
      registerSetting('local-server', {
        type: Boolean,
        scope: 'world',
        config: false,
        default: false
      })
    );
    settings.push(
      registerSetting('version', {
        type: Number,
        scope: 'world',
        config: false,
        default: 0
      })
    );
    settings.push(
      registerSetting('available-features', {
        type: Array<string>,
        scope: 'client',
        config: false,
        default: []
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
    }
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
import { Poll } from './polls.js';
import { TJSGameSettings } from '@typhonjs-fvtt/svelte-standard/store';
import { ConfigApplication } from '../applications/configApplication.js';

const moduleID = 'ethereal-plane';

class EtherealPlaneSettings extends TJSGameSettings {
  constructor() {
    super(moduleID);
  }

  init() {
    const settings = [];

    game.settings.registerMenu(moduleID, 'setup', {
      name: `${moduleID}.settings.setup.Name`,
      label: `${moduleID}.settings.setup.Label`,
      hint: `${moduleID}.settings.setup.Hint`,
      icon: 'fas fa-bars',
      restricted: true,
      type: SettingsShell(ConfigApplication),
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
        default: false,
      })
    );
    this.registerAll(settings, true);
  }
}

/**
 *
 * @param {string} settingName
 * @param { Record<string, unknown>} config
 */
function registerSetting(settingName, config) {
  return {
    namespace: moduleID,
    key: settingName,
    options: {
      name: `${moduleID}.settings.${settingName}.Name`,
      hint: `${moduleID}.settings.${settingName}.Hint`,
      ...config,
    },
  };
}

/**
 *
 * @param {string} settingName
 * @returns {unknown}
 */
export function getSetting(settingName) {
  return game.settings.get(moduleID, settingName);
}

/**
 *
 * @param {string} settingName
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function setSetting(settingName, value) {
  await game.settings.set(moduleID, settingName, value);
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
  };
}

export const settings = new EtherealPlaneSettings();
const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);

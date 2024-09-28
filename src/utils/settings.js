import { Poll } from './polls.js';
import { ConfigApplication } from '../applications/configApplication.js';
import { getGame } from './helpers.js';
import { Modes } from './const.js';
import NotificationCenter from '../applications/notificationCenter.js';
import { TJSGameSettings } from '@typhonjs-fvtt/runtime/svelte/store/fvtt/settings';
import { ChatCommandApplication } from '../applications/chatCommandApplication.js';
import { getLinks, getNotifications } from '../notifications/notifications.js';

const moduleID = "ethereal-plane";

/** @extends TJSGameSettings */
class EtherealPlaneSettings extends TJSGameSettings {
  constructor() {
    super(moduleID);
  }

  /** @returns {void} */
  init() {
    const settings = [];

    getGame().settings.registerMenu(moduleID, "setup", {
      name: `${moduleID}.settings.setup.Name`,
      label: `${moduleID}.settings.setup.Label`,
      hint: "",
      icon: "fas fa-bars",
      restricted: true,
      type: SettingsShell(ConfigApplication),
    });

    getGame().settings.registerMenu(moduleID, "chat-commands", {
      name: `${moduleID}.settings.chat-commands.Name`,
      label: `${moduleID}.settings.chat-commands.Label`,
      hint: "",
      icon: "fas fa-bars",
      restricted: true,
      type: SettingsShell(ChatCommandApplication),
    });

    settings.push(
      registerSetting("server-url", {
        default: "http://localhost:3000",
        type: String,
        scope: "client",
        config: false,
      }),
    );
    settings.push(
      registerSetting("enabled", {
        default: false,
        type: Boolean,
        scope: "world",
        config: true,
        onChange: () => {
          debouncedReload();
        },
      }),
    );
    settings.push(
      registerSetting("polls-enabled", {
        default: false,
        type: Boolean,
        scope: "world",
        config: false,
        onChange: () => {
          if (canvas?.activeLayer?.name === "TokenLayer") {
            ui?.controls?.initialize({ layer: "tokens", tool: "select" });
          }
        },
      }),
    );
    settings.push(
      registerSetting("send-rolls-to-chat", {
        default: true,
        type: Boolean,
        scope: "world",
        config: false,
      }),
    );
    settings.push(
      registerSetting("currentPoll", {
        type: Object,
        scope: "world",
        config: false,
        default: new Poll(),
      }),
    );
    settings.push(
      registerSetting("enable-chat-tab", {
        type: Boolean,
        scope: "world",
        config: true,
        default: true,
        onChange: () => {
          debouncedReload();
        },
      }),
    );
    settings.push(
      registerSetting("authentication-token", {
        type: String,
        scope: "client",
        config: false,
        default: "",
      }),
    );
    settings.push(
      registerSetting("refresh-token", {
        type: String,
        scope: "client",
        config: false,
        default: "",
      }),
    );
    settings.push(
      registerSetting("mode", {
        type: String,
        choices: Object.values(Modes).reduce(
          (a, v) => ({ ...a, [v]: `ethereal-plane.settings.mode.${v}` }),
          {},
        ),
        scope: "world",
        config: false,
        default: Modes.localonly,
      }),
    );
    settings.push(
      registerSetting("version", {
        type: Number,
        scope: "world",
        config: false,
        default: 0,
      }),
    );
    settings.push(
      registerSetting("chat-message-template", {
        type: String,
        scope: "world",
        config: false,
        default: "%USER% rolled %FORMULA% and got a %RESULT%!",
      }),
    );
    settings.push(
      registerSetting("campaign-id", {
        type: String,
        scope: "world",
        config: false,
        default: "",
      }),
    );
    settings.push(
      registerSetting("last-read-notification", {
        type: Number,
        scope: "client",
        config: false,
        default: 0,
      }),
    );
    settings.push(
      registerSetting("allow-socket", {
        type: Boolean,
        scope: "world",
        config: false,
        default: false,
      }),
    );
    settings.push(
      registerSetting("allow-api", {
        type: Boolean,
        scope: "world",
        config: false,
        default: false,
      }),
    );
    settings.push(
      registerSetting("chat-commands", {
        type: Object,
        scope: "world",
        config: false,
        default: [],
      }),
    );
    settings.push(
      registerSetting("chat-commands-active", {
        type: Boolean,
        scope: "world",
        config: true,
        default: false,
        onChange: () => {
          debouncedReload();
        },
      }),
    );
    this.registerAll(settings, true);
  }
}

/** @returns {{ namespace: string; key: any; folder: string; options: any; }} */
function registerSetting(settingName, config, folder = "") {
  return {
    namespace: moduleID,
    key: settingName,
    folder,
    options: {
      name: `${moduleID}.settings.${settingName}.Name`,
      hint: `${moduleID}.settings.${settingName}.Hint`,
      ...config,
    },
  };
}

/** @param {string} settingName
 */
export function getSetting(settingName) {
  return getGame().settings.get(moduleID, settingName);
}

/**
 * @param {string} settingName
 * @param {any} value
 */
export async function setSetting(settingName, value) {
  await getGame().settings.set(moduleID, settingName, value);
}

/** @returns {Class<Shell>} */
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
      this.#mceSettingsApp = this.#mceSettingsApp
        ? this.#mceSettingsApp
        : new Application();
      this.#mceSettingsApp.render(true, { focus: true });

      return this.#mceSettingsApp;
    }

    render() {
      this.close();
    }

    async _updateObject() {}
  };
}

export const settings = new EtherealPlaneSettings();
const debouncedReload = foundry.utils.debounce(
  () => window.location.reload(),
  100,
);

/** @returns {void} */
export async function showNotifications() {
  const notifications = await getNotifications();
  if (notifications.length > 0) {
    const links = await getLinks();
    new NotificationCenter({
      svelte: { props: { notifications: notifications, links: links } }
    }).render(true);
  }
}

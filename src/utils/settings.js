import { Poll } from "./polls.js";
import { getGame } from "./helpers.js";
import { Modes } from "./const.js";
import { writable } from "svelte/store";

const moduleID = "ethereal-plane";

export function registerSettings() {
  registerSetting("server-url", {
    default: "http://localhost:3000",
    type: String,
    scope: "client",
    config: false,
  });
  registerSetting("enabled", {
    default: false,
    type: Boolean,
    scope: "world",
    config: true,
    onChange: () => {
      debouncedReload();
    },
  });
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
  });
  registerSetting("send-rolls-to-chat", {
    default: true,
    type: Boolean,
    scope: "world",
    config: false,
  });
  registerSetting("currentPoll", {
    type: Object,
    scope: "world",
    config: false,
    default: new Poll(),
  });
  registerSetting("enable-chat-tab", {
    type: Boolean,
    scope: "world",
    config: true,
    default: false,
    onChange: () => {
      debouncedReload();
    },
  });
  registerSetting("authentication-token", {
    type: String,
    scope: "client",
    config: false,
    default: "",
  });
  registerSetting("refresh-token", {
    type: String,
    scope: "client",
    config: false,
    default: "",
  });
  registerSetting("mode", {
    type: String,
    choices: Object.values(Modes).reduce(
      (a, v) => ({ ...a, [v]: `ethereal-plane.settings.mode.${v}` }),
      {},
    ),
    scope: "world",
    config: false,
    default: Modes.localonly,
  });
  registerSetting("version", {
    type: Number,
    scope: "world",
    config: false,
    default: 0,
  });
  registerSetting("chat-message-template", {
    type: String,
    scope: "world",
    config: false,
    default: "%USER% rolled %FORMULA% and got a %RESULT%!",
  });
  registerSetting("campaign-id", {
    type: String,
    scope: "world",
    config: false,
    default: "",
  });

  registerSetting("last-read-notification", {
    type: String,
    scope: "client",
    config: false,
    default: "",
  });
  registerSetting("allow-socket", {
    type: Boolean,
    scope: "world",
    config: false,
    default: false,
  });
  registerSetting("allow-api", {
    type: Boolean,
    scope: "world",
    config: false,
    default: false,
  });
  registerSetting("chat-commands", {
    type: Object,
    scope: "world",
    config: false,
    default: [],
  });
  registerSetting("chat-commands-active", {
    type: Boolean,
    scope: "world",
    config: true,
    default: false,
    onChange: () => {
      debouncedReload();
    },
  });
}

function registerSetting(settingName, config) {
  let store;

  let debounce = false;

  function changeListener(change) {
    if (!debounce) {
      if (config.onChange) config.onChange(change);
      debounce = true;
      store?.set(change);
    }
    debounce = false;
  }

  game?.settings.register(moduleID, settingName, {
    name: `${moduleID}.settings.${settingName}.Name`,
    hint: `${moduleID}.settings.${settingName}.Hint`,
    ...config,
    onChange: changeListener,
  });

  const value =
    game?.settings.get(moduleID, settingName) ??
    config.default ??
    new config.type();

  store = writable(value);

  store.subscribe((value) => {
    if (!debounce) {
      debounce = true;
      if (game?.ready) game?.settings.set(moduleID, settingName, value);
    }
    debounce = false;
  });

  stores.set(settingName, store);
}

export function getStore(name) {
  return stores.get(name);
}

var stores = new Map();

export async function registerMenus() {
  if (getGame().user?.isGM) {
    const { ConfigApplication } = await import(
      "../applications/configApplication.js"
    );

    getGame().settings.registerMenu(moduleID, "setup", {
      name: `${moduleID}.settings.setup.Name`,
      label: `${moduleID}.settings.setup.Label`,
      hint: "",
      icon: "fas fa-bars",
      restricted: true,
      type: SettingsShell(ConfigApplication),
    });

    const { ChatCommandApplication } = await import(
      "../applications/chatCommandApplication.js"
    );

    getGame().settings.registerMenu(moduleID, "chat-commands", {
      name: `${moduleID}.settings.chat-commands.Name`,
      label: `${moduleID}.settings.chat-commands.Label`,
      hint: "",
      icon: "fas fa-bars",
      restricted: true,
      type: SettingsShell(ChatCommandApplication),
    });
  }
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

const debouncedReload = foundry.utils.debounce(
  () => window.location.reload(),
  100,
);

/** @returns {void} */
export async function showNotifications() {
  try {
    const { getLinks, getNotifications } = await import(
      "../notifications/notifications.js"
    );
    const notifications = await getNotifications();
    if (notifications.length > 0) {
      const links = await getLinks();
      const NotificationCenter = (
        await import("../applications/notificationCenter.js")
      ).default;
      new NotificationCenter({
        svelte: { props: { notifications: notifications, links: links } },
      }).render(true);
    }
  } catch (e) {
    console.error(e);
  }
}

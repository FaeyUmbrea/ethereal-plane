import { Poll } from "./polls.js";
import { getGame } from "./helpers.js";
import { Modes, MODULE_ID } from "./const.js";
import { TJSGameSettings } from "#runtime/svelte/store/fvtt/settings";
import { SvelteApplication } from "#runtime/svelte/application";

class EtherealPlaneSettings extends TJSGameSettings {
  constructor() {
    super(MODULE_ID);
  }

  init() {
    const settings = [];
    settings.push(
      createSetting("server-url", {
        default: "http://localhost:3000",
        type: String,
        scope: "client",
        config: false,
      }),
    );
    settings.push(
      createSetting("enabled", {
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
      createSetting("polls-enabled", {
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
      createSetting("send-rolls-to-chat", {
        default: true,
        type: Boolean,
        scope: "world",
        config: false,
      }),
    );
    settings.push(
      createSetting("currentPoll", {
        type: Object,
        scope: "world",
        config: false,
        default: new Poll(),
      }),
    );
    settings.push(
      createSetting("enable-chat-tab", {
        type: Boolean,
        scope: "world",
        config: true,
        default: false,
        onChange: () => {
          debouncedReload();
        },
      }),
    );
    settings.push(
      createSetting("authentication-token", {
        type: String,
        scope: "client",
        config: false,
        default: "",
      }),
    );
    settings.push(
      createSetting("refresh-token", {
        type: String,
        scope: "client",
        config: false,
        default: "",
      }),
    );
    settings.push(
      createSetting("mode", {
        type: String,
        choices: Object.values(Modes).reduce(
          (a, v) => ({ ...a, [v]: `ethereal-plane.settings.mode.${v}` }),
          {},
        ),
        scope: "world",
        config: false,
        default: Modes.patreon,
      }),
    );
    settings.push(
      createSetting("version", {
        type: Number,
        scope: "world",
        config: false,
        default: 0,
      }),
    );
    settings.push(
      createSetting("chat-message-template", {
        type: String,
        scope: "world",
        config: false,
        default: "%USER% rolled %FORMULA% and got a %RESULT%!",
      }),
    );
    settings.push(
      createSetting("campaign-id", {
        type: String,
        scope: "world",
        config: false,
        default: "",
      }),
    );

    settings.push(
      createSetting("last-read-notification", {
        type: String,
        scope: "client",
        config: false,
        default: "",
      }),
    );
    settings.push(
      createSetting("allow-socket", {
        type: Boolean,
        scope: "world",
        config: false,
        default: false,
      }),
    );
    settings.push(
      createSetting("allow-api", {
        type: Boolean,
        scope: "world",
        config: false,
        default: false,
      }),
    );
    settings.push(
      createSetting("chat-commands", {
        type: Object,
        scope: "world",
        config: false,
        default: [],
      }),
    );
    settings.push(
      createSetting("chat-commands-active", {
        type: Boolean,
        scope: "world",
        config: true,
        default: false,
        onChange: () => {
          debouncedReload();
        },
      }),
    );

    this.registerAll(settings as never, true);
  }
}

function createSetting<
  K extends ClientSettings.Key,
  T extends ClientSettings.Type,
>(
  settingName: K,
  config: ClientSettings.Type extends T
    ? ClientSettings.RegisterOptions<T>
    : ClientSettings.RegisterOptions<NoInfer<T>>,
) {
  return {
    namespace: MODULE_ID,
    key: settingName,
    options: {
      name: `${MODULE_ID}.settings.${settingName}.Name`,
      hint: `${MODULE_ID}.settings.${settingName}.Hint`,
      ...config,
    },
  };
}

export async function registerMenus() {
  if (getGame().user?.isGM) {
    const { ConfigApplication } = await import(
      "../applications/configApplication.js"
    );

    getGame().settings.registerMenu(MODULE_ID, "setup", {
      name: `${MODULE_ID}.settings.setup.Name`,
      label: `${MODULE_ID}.settings.setup.Label`,
      hint: "",
      icon: "fas fa-bars",
      restricted: true,
      type: SettingsShell(ConfigApplication),
    });

    const { ChatCommandApplication } = await import(
      "../applications/chatCommandApplication.js"
    );

    getGame().settings.registerMenu(MODULE_ID, "chat-commands", {
      name: `${MODULE_ID}.settings.chat-commands.Name`,
      label: `${MODULE_ID}.settings.chat-commands.Label`,
      hint: "",
      icon: "fas fa-bars",
      restricted: true,
      type: SettingsShell(ChatCommandApplication),
    });
  }
}

export function getSetting<K extends ClientSettings.Key>(
  settingName: K,
): ClientSettings.SettingInitializedType<"ethereal-plane", K> {
  return getGame().settings.get(MODULE_ID, settingName);
}

export async function setSetting<K extends ClientSettings.Key>(
  settingName: K,
  value: ClientSettings.SettingAssignmentType<"ethereal-plane", K>,
) {
  await getGame().settings.set(MODULE_ID, settingName, value);
}

function SettingsShell(Application: new () => SvelteApplication) {
  return class Shell extends FormApplication {
    static #mceSettingsApp: SvelteApplication;

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

    override render() {
      this.close();
    }

    async _updateObject() {}
  };
}

const debouncedReload = foundry.utils.debounce(
  () => window.location.reload(),
  100,
);

export async function showNotifications(): Promise<void> {
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

export const settings = new EtherealPlaneSettings();

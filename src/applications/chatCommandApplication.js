import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import ChatCommandConfigUI from "../svelte/ChatCommandConfigUI.svelte";
import { getSetting, setSetting } from "../utils/settings.js";
import { getGame } from "../utils/helpers.js";
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

/** @extends SvelteApplication */
export class ChatCommandApplication extends SvelteApplication {
  /** @static */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ep-chat-commands"],
      minimizable: true,
      width: 500,
      height: 320,
      id: "chat-command-config-application",
      title: "ethereal-plane.ui.chat-command-application-title",
      resizable: true,
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: ChatCommandConfigUI,
        target: document.body,
        intro: true,
      },
    });
  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();

    buttons.unshift(
      {
        icon: "fas fa-file-import",
        title: localize("ethereal-plane.ui.commands.import.button"),
        label: localize("ethereal-plane.ui.commands.import.button"),

        onPress: async function () {
          new Dialog(
            {
              title: `${localize("ethereal-plane.ui.commands.import.title")}: ${this.name}`,
              content: await renderTemplate("templates/apps/import-data.html", {
                hint1: localize("ethereal-plane.ui.commands.import.hint1"),
                hint2: localize("ethereal-plane.ui.commands.import.hint2"),
              }),
              buttons: {
                import: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: localize("ethereal-plane.ui.commands.import.button"),
                  callback: (html) => {
                    const form = html.find("form")[0];
                    if (!form.data.files.length)
                      return ui.notifications.error(
                        localize(
                          "ethereal-plane.ui.commands.import.data-file-error",
                        ),
                      );
                    readTextFromFile(form.data.files[0]).then((json) =>
                      importChatCommands(json, false),
                    );
                  },
                },
                withMacros: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: localize(
                    "ethereal-plane.ui.commands.import.with-macros",
                  ),
                  callback: (html) => {
                    const form = html.find("form")[0];
                    if (!form.data.files.length)
                      return ui.notifications.error(
                        localize(
                          "ethereal-plane.ui.commands.import.data-file-error",
                        ),
                      );
                    readTextFromFile(form.data.files[0]).then((json) =>
                      importChatCommands(json, true),
                    );
                  },
                },
                no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: localize("ethereal-plane.ui.cancel"),
                },
              },
              default: "import",
            },
            {
              width: 400,
            },
          ).render(true);
        },
      },
      {
        icon: "fas fa-file-export",
        title: localize("ethereal-plane.ui.commands.export.button"),
        label: localize("ethereal-plane.ui.commands.export.button"),

        onPress: function () {
          new Dialog({
            title: localize("ethereal-plane.ui.commands.export.title"),
            content: localize("ethereal-plane.ui.commands.export.content"),
            buttons: {
              yes: {
                label: localize("ethereal-plane.ui.yes"),
                callback: () => exportChatCommands(true),
              },
              no: {
                label: localize("ethereal-plane.ui.no"),
                callback: () => exportChatCommands(false),
              },
            },
          }).render(true);
        },
      },
    );

    return buttons;
  }
}

function exportChatCommands(withMacro) {
  /**
   * @type {ChatCommand[]}
   */
  const commands = foundry.utils.deepClone(getSetting("chat-commands"));

  if (withMacro) {
    commands.forEach((command) => {
      const macro = command.macro;
      const macroExport = getGame().macros?.get(macro)?.toCompendium();
      if (macroExport !== undefined) {
        command.macro = macroExport;
      } else {
        command.macro = "";
      }
    });
  } else {
    commands.forEach((command) => {
      command.macro = "";
    });
  }

  let data = {
    type: "EthPlaExport",
    version: 1,
    commands,
  };

  const filename = [
    "ethpla",
    getGame().world.id,
    "chat_commands",
    withMacro ? "with_macros" : "",
    new Date().toString(),
  ].filterJoin("-");
  saveDataToFile(
    JSON.stringify(data, null, 2),
    "text/json",
    `${filename}.json`,
  );
}

/**
 * @param {String} data
 * @param {boolean} withMacros
 */
async function importChatCommands(data, withMacros) {
  /**
   * @type {{version:number, type: String,commands:(ChatCommand&{macro:String|any})[]}}
   */
  const imported = JSON.parse(data);
  if (imported.type !== "EthPlaExport") {
    throw new Error(
      localize("ethereal-plane.ui.commands.import.wrong-file-error"),
    );
  }
  if (imported.version !== 1) {
    throw new Error(
      localize("ethereal-plane.ui.commands.import.wrong-version-error"),
    );
  }
  let folder = game.macros?.folders.find(
    (folder) => folder.name === "Ethereal Plane",
  );
  if (folder === undefined && withMacros) {
    folder = await Folder.create(
      new Folder({ type: "Macro", name: "Ethereal Plane" }),
    );
  }
  for (const command of imported.commands) {
    if (!(command.macro instanceof String) && withMacros) {
      command.macro.folder = folder.id;
      command.macro = (await Macro.create(new Macro(command.macro))).id;
    } else {
      command.macro = "";
    }
  }
  const commandData = getSetting("chat-commands");
  commandData.push(...imported.commands);
  await setSetting("chat-commands", commandData);
}

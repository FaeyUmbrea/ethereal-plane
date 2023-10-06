import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import ChatCommandConfigUI from "../svelte/ChatCommandConfigUI.svelte";
import { getSetting, setSetting } from "../utils/settings.js";
import { getGame } from "../utils/helpers.js";

/** @extends SvelteApplication */
export class ChatCommandApplication extends SvelteApplication {
  /** @static */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["eppolls"],
      minimizable: true,
      width: 500,
      height: 320,
      id: "chatcommand-config-application",
      title: "Chat Command Config",
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
        title: "Import",
        label: "Import",

        onPress: async function () {
          new Dialog(
            {
              title: `Import Data: ${this.name}`,
              content: await renderTemplate("templates/apps/import-data.html", {
                hint1:
                  "You are about to import and exported Chat Command configuration.",
                hint2:
                  "Data will be appended to the list. Please choose if you want to import Macros as well.",
              }),
              buttons: {
                import: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: "Import",
                  callback: (html) => {
                    const form = html.find("form")[0];
                    if (!form.data.files.length)
                      return ui.notifications.error(
                        "You did not upload a data file!",
                      );
                    readTextFromFile(form.data.files[0]).then((json) =>
                      importChatCommands(json, false),
                    );
                  },
                },
                withMacros: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: "Import w/ Macros",
                  callback: (html) => {
                    const form = html.find("form")[0];
                    if (!form.data.files.length)
                      return ui.notifications.error(
                        "You did not upload a data file!",
                      );
                    readTextFromFile(form.data.files[0]).then((json) =>
                      importChatCommands(json, true),
                    );
                  },
                },
                no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: "Cancel",
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
        title: "Export",
        label: "Export",

        onPress: function () {
          new Dialog({
            title: "Export with Macros?",
            content:
              "Do you want to export the Macros? (Otherwise Macro data will be deleted)",
            buttons: {
              yes: {
                label: "Yes",
                callback: () => exportChatCommands(true),
              },
              no: {
                label: "No",
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
    throw new Error("Imported file is not an Ethereal Plane Export");
  }
  if (imported.version !== 1) {
    throw new Error("Version unsupported");
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

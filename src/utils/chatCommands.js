import { getGame } from "./helpers.js";
import { getSetting } from "./settings.js";

const executionLocks = new Map();

/** @param {ChatCommand} command
 * @param {string} message
 * @param {string} user
 * @returns {void}
 */
function processCommand(command, message, user) {
  const templateParts = command.commandTemplate.split(" ");
  const messageParts = message.split(" ");
  const macroArguments = {};
  let target = "";

  templateParts.forEach((part, index) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const [name, defaultValue] = part
        .substring(2, part.length - 2)
        .split("??");
      const value =
        messageParts.length > index ? messageParts[index] : defaultValue ?? "";
      macroArguments[name] = value;
      if (name === command.targetIdentifier) {
        target = value;
      }
    }
  });

  if (command.perTargetCooldown > 0) {
    const lock = executionLocks.get(`${command.commandPrefix}:${target}`);
    if (lock && lock > Date.now()) {
      return;
    }
  }
  if (command.perUserCooldown > 0) {
    const lock = executionLocks.get(`${command.commandPrefix}:${user}`);
    if (lock && lock > Date.now()) {
      return;
    }
  }
  getGame().macros?.get(command.macro)?.execute(macroArguments);

  if (command.perTargetCooldown > 0) {
    executionLocks.set(
      `${command.commandPrefix}:${target}`,
      Date.now() + command.perTargetCooldown * 1000,
    );
  }
  if (command.perUserCooldown > 0) {
    executionLocks.set(
      `${command.commandPrefix}:${user}`,
      Date.now() + command.perUserCooldown * 1000,
    );
  }
}

/** @param {string} message
 * @param {string} user
 * @returns {void}
 */
export function processChat(message, user) {
  if (getSetting("chat-commands-active")) {
    const commandPrefix = message.split(" ")[0];
    const commandArguments = message.substring(commandPrefix.length + 1);
    const commands = getSetting("chat-commands");
    commands.forEach((command) => {
      if (command.commandPrefix === commandPrefix && command.active) {
        processCommand(command, commandArguments, user);
      }
    });
  }
}

export class ChatCommand {
  constructor() {
    this.commandPrefix = "";
    this.commandTemplate = "";
    this.perUserCooldown = 0;
    this.perTargetCooldown = 0;
    this.targetIdentifier = "";
    this.macro = "";
    this.active = false;
  }
}

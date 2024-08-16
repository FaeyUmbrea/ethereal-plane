import { getGame } from "./helpers.js";
import { getSetting } from "./settings.js";

const executionLocks = new Map();

/** @param {ChatCommand} command
 * @param {string} message
 * @param {string} user
 * @param {boolean} subscribed
 * @returns {void}
 */
async function processCommand(command, message, user, subscribed) {
  const regex = /(["'«»‘’‚‛“”„‟‹›](?<a>.*?)["'«»‘’‚‛“”„‟‹›])|(?<b>[^\s]+)/gm;
  const templateParts = command.commandTemplate.split(/\s/);
  const matches = message.matchAll(regex);
  const messageParts = [];
  for (const match of matches) {
    if (match.groups.a) {
      messageParts.push(match.groups.a);
    }
    if (match.groups.b) {
      messageParts.push(match.groups.b);
    }
  }
  const macroArguments = {};
  let target = "";

  templateParts.forEach((part, index) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const [name, defaultValue] = part
        .substring(2, part.length - 2)
        .split("??");
      const value =
        messageParts.length > index
          ? messageParts[index]
          : (defaultValue ?? "");
      macroArguments[name] = value;
      if (name === command.targetIdentifier) {
        target = value;
      }
    }
  });
  macroArguments["rawMessage"] = message;
  macroArguments["messageOverflow"] =
    messageParts.length > templateParts.length
      ? messageParts.slice(templateParts.length)
      : [];
  macroArguments["messageParts"] = messageParts;

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
  macroArguments["user"] = user;
  macroArguments["isSubscribed"] = subscribed;
  await getGame().macros?.get(command.macro)?.execute(macroArguments);

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
 * @param {boolean} subscribed
 * @returns {void}
 */
export async function processChat(message, user, subscribed) {
  if (getSetting("chat-commands-active")) {
    const commandPrefix = message.split(/\s/)[0];
    const commandArguments = message.substring(commandPrefix.length + 1);
    const commands = getSetting("chat-commands");
    for (const command of commands) {
      if (command.commandPrefix === commandPrefix && command.active) {
        await processCommand(command, commandArguments, user, subscribed);
      }
    }
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

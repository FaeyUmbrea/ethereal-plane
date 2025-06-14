import { getGame } from './helpers.js';
import { getSetting } from './settings.js';

const executionLocks = new Map<string, number>();
const subExecutionLocks = new Map<string, number>();

async function processCommand(
	command: ChatCommand,
	message: string,
	user: string,
	subscribed: boolean,
): Promise<void> {
	const regex = /(["'«»‘’‚‛“”„‟‹›](?<a>.*?)["'«»‘’‚‛“”„‟‹›])|(?<b>\S+)/g;
	const templateParts = command.commandTemplate.split(/\s/);
	const matches = message.matchAll(regex);
	const messageParts: string[] = [];
	for (const match of matches) {
		if (match.groups?.a) {
			messageParts.push(match.groups.a);
		}
		if (match.groups?.b) {
			messageParts.push(match.groups.b);
		}
	}
	const macroArguments: Record<string, string | string[] | boolean> = {};
	let target = '';

	templateParts.forEach((part, index) => {
		if (part.startsWith('{{') && part.endsWith('}}')) {
			const [name, defaultValue] = part
				.substring(2, part.length - 2)
				.split('??');
			const value
        = messageParts.length > index ? messageParts[index] : (defaultValue ?? '');
			macroArguments[name] = value;
			if (name === command.targetIdentifier) {
				target = value;
			}
		}
	});
	macroArguments.rawMessage = message;
	macroArguments.messageOverflow
    = messageParts.length > templateParts.length
			? messageParts.slice(templateParts.length)
			: [];
	macroArguments.messageParts = messageParts;

	let lock = 0;
	if (subscribed && command.perTargetSubCooldown > -1) {
		if (command.perTargetSubCooldown > 0) {
			lock = subExecutionLocks.get(`${command.commandPrefix}:${target}`) || 0;
		}
	} else {
		if (command.perTargetCooldown > 0) {
			lock = executionLocks.get(`${command.commandPrefix}:${target}`) || 0;
		}
	}
	if (subscribed && command.perUserSubCooldown > -1) {
		if (command.perUserSubCooldown > 0) {
			lock = Math.max(
				lock,
				subExecutionLocks.get(`${command.commandPrefix}:${user}`) || 0,
			);
		}
	} else {
		if (command.perUserCooldown > 0) {
			lock = Math.max(
				lock,
				executionLocks.get(`${command.commandPrefix}:${user}`) || 0,
			);
		}
	}
	if (lock && lock > Date.now()) {
		return;
	}

	macroArguments.user = user;
	macroArguments.isSubscribed = subscribed;
	const result = await getGame().macros?.get(command.macro)?.execute(macroArguments);
	if (result === undefined || !result) {
		if (subscribed && command.perTargetSubCooldown > -1) {
			if (command.perTargetSubCooldown > 0) {
				subExecutionLocks.set(
					`${command.commandPrefix}:${target}`,
					Date.now() + command.perTargetSubCooldown * 1000,
				);
			}
		} else {
			if (command.perTargetCooldown > 0) {
				executionLocks.set(
					`${command.commandPrefix}:${target}`,
					Date.now() + command.perTargetCooldown * 1000,
				);
			}
		}
		if (subscribed && command.perUserSubCooldown > -1) {
			if (command.perUserSubCooldown > 0) {
				subExecutionLocks.set(
					`${command.commandPrefix}:${user}`,
					Date.now() + command.perUserSubCooldown * 1000,
				);
			}
		} else {
			if (command.perUserCooldown > 0) {
				executionLocks.set(
					`${command.commandPrefix}:${user}`,
					Date.now() + command.perUserCooldown * 1000,
				);
			}
		}
	}
}

/**
 * @param {string} message
 * @param {string} user
 * @param {boolean} subscribed
 * @returns {void}
 */
export async function processChat(
	message: string,
	user: string,
	subscribed: boolean,
): Promise<void> {
	if (getSetting('chat-commands-active')) {
		const commandPrefix = message.split(/\s/)[0];
		const commandArguments = message.substring(commandPrefix.length + 1);
		const commands = getSetting('chat-commands') as ChatCommand[];
		for (const command of commands) {
			if ((command.commandPrefix === commandPrefix || command.commandAliases.includes(commandPrefix)) && command.active) {
				await processCommand(command, commandArguments, user, subscribed);
			}
		}
	}
}

export function getMacro(macroID: string) {
	return getGame().macros?.get(macroID)?.toCompendium();
}

export type ImportChatCommand = typeof ChatCommand & {
	macro: string | { folder: string | undefined | null };
};

export type ExportChatCommand = typeof ChatCommand & {
	macro: string | ReturnType<typeof getMacro>;
};

export class ChatCommand {
	commandPrefix = '';
	commandAliases: string[] = [];
	commandTemplate = '';
	perUserCooldown = 0;
	perTargetCooldown = 0;
	perTargetSubCooldown = -1;
	perUserSubCooldown = -1;
	targetIdentifier = '';
	macro: string = '';
	active = false;
}

import type { ChatTriggerEvent, TriggerMacro } from './types.ts';
import { getGame } from './helpers.js';
import { getSetting } from './settings.ts';

export async function processTrigger(
	command: ChatTriggerEvent,
): Promise<boolean> {
	const macro_map = getSetting('chat-trigger-macros') as TriggerMacro[];
	const macro = macro_map?.find(data => data.id === command.trigger_id)?.macro;

	if (!macro) return true;

	const result = await getGame().macros?.get(macro)?.execute(command.macro_arguments as Macro.UnknownScope);
	return result === undefined || !!result;
}

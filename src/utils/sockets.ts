import { sendRoll } from '../handlers/rollHandler.js';
import { getGame } from './helpers.js';
import { getSetting } from './settings.js';

Hooks.once('init', () => {
	getGame().socket.on('event.ethereal-plane', handleEvent);
});

async function handleEvent({
	eventType,
	targetUser,
	payload,
}: {
	eventType: string;
	targetUser: string;
	payload: { user: string; formula: string; result: string };
}) {
	if (!!targetUser && game.userId !== targetUser) return;

	if (eventType === 'roll' && game.user?.isGM) {
		sendRollIfAllowed(payload.user, payload.formula, payload.result);
	}
}

export function sendRollToGM(
	user: string,
	formula: string,
	result: string,
): void {
	if (getSetting('allow-socket')) {
		const eventData = {
			eventType: 'roll',
			payload: { user, formula, result },
		};
		getGame().socket.emit('event.ethereal-plane', eventData);
	}
}

export function sendRollIfAllowed(
	user: string,
	formula: string,
	result: string,
): void {
	if (getSetting('allow-socket')) {
		sendRoll(user, formula, result);
	}
}

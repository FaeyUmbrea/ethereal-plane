import { getConnectionManager } from '../server/patreon.ts';
import { getGame } from './helpers.ts';
import { getSetting } from './settings.ts';

export function getApi() {
	const moduleData = getGame()?.modules?.get('ethereal-plane');
	if (moduleData) return moduleData.api;
	else throw new Error('Something went very wrong!');
}

export class EtherealPlaneAPI {
	sendMessageToChat(message: string) {
		if (getSetting('allow-api')) {
			getConnectionManager().sendMessage(message);
		}
	}
}

Hooks.once('init', async () => {
	const moduleData = (game as InitGame)?.modules?.get('ethereal-plane');
	if (moduleData) {
		moduleData.api = new EtherealPlaneAPI();
		Hooks.call('ethereal-plane.init');
	}
});

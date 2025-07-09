import type PollApplication from './applications/pollApplication.js';
import { nanoid } from 'nanoid';
import { registerHandlers } from './handlers';
import { getConnectionManager } from './server/patreon.js';
import { getGame } from './utils/helpers.js';
import { registerOverlay } from './utils/overlay.js';
import {
	getSetting,
	registerMenus,
	runMigrations,
	setSetting,
	settings,
} from './utils/settings.js';
import './utils/api.ts';
import './server/patreon_auth';

let polls: unknown | undefined;

function buildButtons(buttons: any) {
	if (
		!getGame().user?.isGM
		|| !getSetting('polls-enabled')
		|| !getSetting('enabled')
	) {
		return;
	}
	let buttonGroup;
	if (getGame().version.startsWith('12.')) {
		// @ts-expect-error V12 compat
		buttonGroup = buttons.find(element => element.name === 'token');
	} else {
		buttonGroup = buttons.tokens;
	}

	const pollsButton: SceneControls.Tool = {
		icon: 'fa-solid fa-square-poll-vertical',
		name: 'openPolls',
		title: 'ethereal-plane.ui.open-polls-button',
		toggle: true,
		order: 100,
		onChange: async () => await openPolls(pollsButton),
	};
	if ((game as ReadyGame).version.startsWith('12.')) {
		buttonGroup?.tools.push(pollsButton);
	} else {
		buttonGroup.tools.openPolls = pollsButton;
	}
}

async function openPolls(button: SceneControls.Tool) {
	if (!polls) {
		const PollApplication = (await import('./applications/pollApplication.js'))
			.default;
		polls = new PollApplication(button);
	}
	if (!(polls as PollApplication)?.rendered)
		(polls as PollApplication)?.render(true);
	else (polls as PollApplication)?.close();
}

Hooks.once('ready', async () => {
	runMigrations();
	if (getSetting('enabled')) {
		registerHandlers();
	}
	if (getGame().user?.isGM) {
		await getConnectionManager().init();
		const campaignID = getSetting('campaign-id');
		if (!campaignID) await setSetting('campaign-id', nanoid(64));
	}
});

Hooks.on('getSceneControlButtons', buildButtons);

Hooks.on('init', () => {
	settings.init();
});
Hooks.once('ready', () => registerMenus());

Hooks.on('obs-utils.init', registerOverlay);

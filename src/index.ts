import type PollApplication from './applications/pollApplication.js';
import { localize } from '#runtime/util/i18n';
import { nanoid } from 'nanoid';
import { registerHandlers } from './handlers';
import { getConnectionManager } from './server/connectionManager.js';
import { getGame } from './utils/helpers.js';
import { registerOverlay } from './utils/overlay.js';
import {
	getSetting,
	registerMenus,
	runMigrations,
	setSetting,
	settings,
	showNotifications,
} from './utils/settings.js';
import './utils/api.ts';
import './server/patreon_auth';

let polls: unknown | undefined;

function buildButtons(buttons: SceneControl[]) {
	if (
		!getGame().user?.isGM
		|| !getSetting('polls-enabled')
		|| !getSetting('enabled')
	) {
		return;
	}
	const buttonGroup = buttons.find(element => element.name === 'token');
	const pollsButton = {
		icon: 'fa-solid fa-square-poll-vertical',
		name: 'openPolls',
		title: 'ethereal-plane.ui.open-polls-button',
		toggle: true,
		visible: true,
		onClick: async () => await openPolls(pollsButton),
	};
	buttonGroup?.tools.push(pollsButton);
}

async function openPolls(button: SceneControlTool) {
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
	if (getSetting('enabled')) {
		registerHandlers();
	}
	if (getGame().user?.isGM) {
		await showNotifications();
		getConnectionManager();
		const campaignID = getSetting('campaign-id');
		if (!campaignID) await setSetting('campaign-id', nanoid(64));
	}
});

Hooks.on('getSceneControlButtons', buildButtons);

Hooks.on('init', () => {
	settings.init();
	runMigrations();
});
Hooks.once('ready', () => registerMenus());

Hooks.on('obsUtilsInit', registerOverlay);

Hooks.once('renderSidebar', async () => {
	if (
		getGame().user?.isGM
		&& getSetting('enable-chat-tab')
		&& getSetting('enabled')
	) {
		const { addSidebar } = await import('./utils/sidebar.js');
		const StreamChat = (await import('./svelte/components/StreamChat.svelte'))
			.default;

		await addSidebar(
			'directory ep-chat',
			localize('ethereal-plane.ui.chat-tab-name'),
			'fas fa-message-bot',
			'combat',
			StreamChat,
		);
	}
});

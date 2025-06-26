import type {
	Poll,
	PollOption,
} from '../utils/polls.js';
import type { ChatDeletionCallback, ChatMessageCallback } from '../utils/types.ts';
import type {
	ChatMessage,
} from './chat_api.js';
import type { PollData } from './poll_api.js';
import { localize } from '#runtime/util/i18n';
import { chatMessages } from '../svelte/stores/chatMessages.ts';
import { API_URL } from '../utils/const.js';
import {
	executePollMacro,
	PollStatus,
} from '../utils/polls.js';
import { getSetting, setSetting } from '../utils/settings.js';
import { error, log, warn } from '../utils/utils';
import {
	disableChatListeners,
	enableChatListeners,
	sendChatMessage,
	setYoutubeId,
} from './chat_api.js';
import {
	connectClient,
	disconnectClient,
	get_token,
	patreonLogin,
	waitForPatreonVerification,
} from './patreon_auth.js';
import {
	abortPoll,
	createPoll,
	disablePollListeners,
	enablePollListeners,

} from './poll_api.js';

export class PatreonConnector {
	messageListeners: ChatMessageCallback[] = [];

	messageDeletionListeners: ChatDeletionCallback[] = [];

	constructor() {
		Hooks.on('ethereal-plane.patreon-login', () => this.login());
		Hooks.on('ethereal-plane.patreon-logout', () => this.logout());
		Hooks.on('ethereal-plane.patreon-connect', () => this.connect());
		Hooks.on('ethereal-plane.patreon-disconnect', () => this.deleteClient());
		Hooks.on('ethereal-plane.set-youtube-id', async (id: string) => {
			await this.setYoutubeID(id);
		});
		Hooks.on('ethereal-plane.reconnect', () => this.reconnect());

		this.messageListeners.push(
			(message: string, user: string, _subscribed: boolean, id: string) => {
				chatMessages.update(
					(messages: { user: string; message: string; id: string }[]) => {
						messages.push({ user, message, id });
						return messages;
					},
				);
			},
		);

		this.messageDeletionListeners.push((id) => {
			chatMessages.update((messages) => {
				return messages.filter(message => message.id !== id);
			});
		});
	}

	async reconnect() {
		ui.notifications?.warn(
			`${localize('ethereal-plane.strings.notification-prefix')}${localize('ethereal-plane.notifications.reconnecting')}`,
		);
		await this.disconnect();
		await this.init();
	}

	async connect() {
		await this.logout();
		await connectClient();
	}

	async init() {
		log('Ethereal Plane | Connecting to Patreon Server');
		const apiVersion = await (await fetch(`${API_URL}version`)).text();
		if (apiVersion !== '2') {
			ui.notifications?.error(
				`${localize('ethereal-plane.strings.notification-prefix')}${localize('ethereal-plane.notifications.api-version-mismatch')}`,
			);
			return;
		}
		log('Ethereal Plane | Api Version OK');

		const clientConnected = foundry.utils.fetchWithTimeout(
			`${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
		);

		if (!clientConnected) {
			log('Ethereal Plane | No client connected, please connect');
			ui.notifications?.warn(
				`${localize('ethereal-plane.strings.notification-prefix')}${localize('ethereal-plane.notifications.please-log-in')}`,
			);
			return;
		}
		log('Ethereal Plane | Client OK');
		await fetchFeatures();
		if ((getSetting('enable-chat-tab') || getSetting('chat-commands-active')) && getSetting('enabled')) {
			log('Enable Chat Listener');
			await this.enableChatListener();
		} else {
			await this.disableChatListener();
		}
		log('Ethereal Plane | Connected');
	}

	getHandleChatMessageReceived() {
		return (message: ChatMessage) => {
			this.messageListeners.forEach((listener) => {
				listener(
					message.message_content,
					message.display_name,
					message.is_member,
					message.message_id,
				);
			});
		};
	}

	getHandleChatMessageDeleted() {
		return (messageId: string) => {
			this.messageDeletionListeners.forEach((listener) => {
				listener(messageId);
			});
		};
	}

	getHandleErrorMessage() {
		return (error: string) => {
			ui.notifications?.error(`Ethereal Plane | ${error}`);
		};
	}

	getPollUpdateCallback() {
		return async (pollUpdate: PollData) => {
			const poll = getSetting('currentPoll') as Poll;
			if (poll.id !== pollUpdate.id) {
				return;
			}
			let wasRunning = false;
			if (poll.status === PollStatus.started) {
				wasRunning = true;
			}
			poll.status = pollUpdate.aborted
				? PollStatus.failed
				: pollUpdate.finalized
					? PollStatus.stopped
					: PollStatus.started;
			poll.tally = poll.options.map((entry: PollOption) => {
				return (
					pollUpdate.options.find(
						(option: { count: number; name: string }) =>
							option.name === entry.name,
					)?.count ?? 0
				);
			});
			if (wasRunning && poll.status === PollStatus.stopped) {
				executePollMacro();
			}
			if (wasRunning && poll.status) {
				disablePollListeners();
			}
			await setSetting('currentPoll', poll);
		};
	}

	async login() {
		warn('Login');
		const tokens = await patreonLogin();
		if (tokens === undefined) return;
		const { device_code, verification_uri_complete, user_code } = tokens;
		const LoginApplication = (
			await import('../applications/loginApplication.js')
		).default;
		const d = new LoginApplication(user_code, verification_uri_complete);
		d.render(true);
		const { access_token, refresh_token }
      = await waitForPatreonVerification(device_code);
		if (!refresh_token) throw new Error('Refresh token is undefined');
		await setSetting('authentication-token', access_token);
		await setSetting('refresh-token', refresh_token);
		Hooks.callAll('ethereal-plane.patreon-logged-in');
		await this.init();
	}

	async disableChatListener() {
		disableChatListeners();
	}

	async enableChatListener(): Promise<void> {
		await enableChatListeners(this.getHandleChatMessageReceived(), this.getHandleChatMessageDeleted(), this.getHandleErrorMessage());
	}

	async sendMessage(message: string) {
		await sendChatMessage(message);
	}

	async createPoll(poll: Poll) {
		try {
			await enablePollListeners(this.getPollUpdateCallback(), this.getHandleErrorMessage());
			const pollId = await createPoll(
				poll.duration * 1000,
				poll.options.map((option: PollOption) => {
					return { name: option.name, title: option.text };
				}),
				'!vote',
				poll.title,
			);
			if (!pollId) {
				error('Failed to create poll');
				return;
			}
			const currentPoll = getSetting('currentPoll') as Poll;
			currentPoll.id = pollId;
			currentPoll.status = PollStatus.started;
			await setSetting('currentPoll', currentPoll);
		} catch {
			const currentPoll = getSetting('currentPoll') as Poll;
			currentPoll.status = PollStatus.failed;
			await setSetting('currentPoll', currentPoll);
		}
	}

	async disconnect(): Promise<void> {
		disablePollListeners();
		disableChatListeners();
	}

	async abortPoll() {
		const poll = getSetting('currentPoll') as Poll;
		await abortPoll(poll.id);
	}

	async logout() {
		await this.disconnect();
		await setSetting('refresh-token', '');
		await setSetting('authentication-token', '');
	}

	async setYoutubeID(id: string) {
		await setYoutubeId(id);
	}

	async deleteClient() {
		await disconnectClient();
	}
}

export async function fetchFeatures() {
	const access_token = get_token()?.access_token;
	if (!access_token) {
		return;
	}
	return (await fetch(`${API_URL}api/v2/Features`, {
		headers: { Authorization: `Bearer ${access_token}` },
	})).json();
}

let connectionManager: PatreonConnector | undefined;

export function getConnectionManager(): PatreonConnector {
	if (connectionManager) return connectionManager;
	connectionManager = new PatreonConnector();
	return connectionManager;
}

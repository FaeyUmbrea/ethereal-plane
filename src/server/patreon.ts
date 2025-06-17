import type {
	Poll,
	PollOption,
} from '../utils/polls.js';
import type {
	ChatMessage,
} from './chat_api.js';
import type {
	ChatConnector,
	ChatDeletionCallback,
	ChatMessageCallback,
} from './chatConnector.js';
import type { PollConnector } from './pollConnector.js';
import { localize } from '#runtime/util/i18n';
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
	disablePollListeners,
	enablePollListeners,
	type PollData,
} from './poll_api.js';
import {
	abortPoll,
	createPoll,
} from './poll_api.js';

export class PatreonConnector implements ChatConnector, PollConnector {
	callback?: ChatMessageCallback;
	chatDeletionCallback?: ChatDeletionCallback;

	setDeletionCallback(callback: ChatDeletionCallback) {
		this.chatDeletionCallback = callback;
	}

	constructor() {
		Hooks.on('ethereal-plane.patreon-login', () => this.login());
		Hooks.on('ethereal-plane.patreon-logout', () => this.logout());
		Hooks.on('ethereal-plane.patreon-connect', () => this.connect());
		Hooks.on('ethereal-plane.patreon-disconnect', () => this.deleteClient());
		Hooks.on('ethereal-plane.set-youtube-id', async (id) => {
			await this.setYoutubeID(id);
		});
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
		log('Ethereal Plane | Connected');
	}

	getHandleChatMessageReceived() {
		return (message: ChatMessage) => {
			if (this.callback === undefined) return;
			this.callback(
				message.message_content,
				message.display_name,
				message.is_member,
				message.message_id,
			);
		};
	}

	getHandleChatMessageDeleted() {
		return (messageId: string) => {
			if (this.chatDeletionCallback === undefined) return;
			this.chatDeletionCallback(messageId);
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

	async startPoll(poll: Poll) {
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

	setCallback(callback: ChatMessageCallback): void | Promise<void> {
		this.callback = callback;
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

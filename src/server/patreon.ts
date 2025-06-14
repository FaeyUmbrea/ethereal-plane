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
import type {
	PollData,
} from './poll_api.js';
import type { PollConnector } from './pollConnector.js';
import { localize } from '#runtime/util/i18n';
import { PATREON_URL } from '../utils/const.js';
import {
	executePollMacro,
	PollStatus,
} from '../utils/polls.js';
import { getSetting, setSetting } from '../utils/settings.js';
import { log, warn } from '../utils/utils';
import {
	disableChatListeners,
	disconnectChatAPI,
	enableChatListeners,
	initChatAPI,
	sendChatMessage,
	setYoutubeId,
} from './chat_api.js';
import {
	connectClient,
	disconnectClient,
	patreonLogin,
	refresh,
	waitForPatreonVerification,
} from './patreon_auth.js';
import {
	abortPoll,
	createPoll,
	disconnectPollAPI,
	initPollAPI,
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
		const apiVersion = await (await fetch(`${PATREON_URL}version`)).text();
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

		const token = getSetting('authentication-token') as string;
		const refreshToken = getSetting('refresh-token') as string;

		if (token === '' || refreshToken === '') {
			log('Ethereal Plane | No credentials present, please log in');
			ui.notifications?.warn(
				`${localize('ethereal-plane.strings.notification-prefix')}${localize('ethereal-plane.notifications.please-log-in')}`,
			);
			return;
		}

		try {
			await initChatAPI(
				token,
				this.getHandleChatMessageReceived(),
				this.getHandleChatMessageDeleted(),
				PATREON_URL,
			);
			await initPollAPI(token, this.getPollUpdateCallback(), PATREON_URL);
		} catch {
			try {
				const tokens = await refresh(refreshToken);
				if (!tokens || !tokens.refresh_token) return;
				await setSetting('authentication-token', tokens.access_token);
				await setSetting('refresh-token', tokens.refresh_token);

				await initChatAPI(
					tokens.access_token,
					this.getHandleChatMessageReceived(),
					this.getHandleChatMessageDeleted(),
					PATREON_URL,
				);
				await initPollAPI(
					tokens.access_token,
					this.getPollUpdateCallback(),
					PATREON_URL,
				);
			} catch {
				await setSetting('authentication-token', '');
				await setSetting('refresh-token', '');
				ui.notifications?.error(
					`${localize('ethereal-plane.strings.notification-prefix')}${localize('ethereal-plane.notifications.invalid-credential')}`,
				);
				throw new Error(
					'Ethereal Plane | Credentials Invalid, please log in again',
				);
			}
		}
		log('Ethereal Plane | Connected');
	}

	getHandleChatMessageReceived() {
		return (message: ChatMessage) => {
			if (this.callback === undefined) return;
			this.callback(
				message.messageContent,
				message.displayName,
				message.isMember,
				message.messageId,
			);
		};
	}

	getHandleChatMessageDeleted() {
		return (messageId: string) => {
			if (this.chatDeletionCallback === undefined) return;
			this.chatDeletionCallback(messageId);
		};
	}

	getPollUpdateCallback() {
		return async (pollUpdate: PollData) => {
			const poll = getSetting('currentPoll') as Poll;
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
		await disableChatListeners();
	}

	async enableChatListener(): Promise<void> {
		await enableChatListeners();
	}

	async sendMessage(message: string) {
		await sendChatMessage(message);
	}

	async startPoll(poll: Poll) {
		try {
			const pollId = await createPoll(
				poll.duration * 1000,
				poll.options.map((option: PollOption) => {
					return { name: option.name, title: option.text };
				}),
				'!vote',
				poll.title,
			);
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
		await disconnectPollAPI();
		await disconnectChatAPI();
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

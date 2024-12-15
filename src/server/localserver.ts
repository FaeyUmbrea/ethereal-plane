import type { Poll } from '../utils/polls.js';
import type { ChatConnector, ChatMessageCallback } from './chatConnector.js';
import type { PollConnector } from './pollConnector.js';
import { executePollMacro, PollStatus } from '../utils/polls.js';
import { getSetting, setSetting } from '../utils/settings.js';
import { debug, log, warn } from '../utils/utils';

/** */
export class LocalServer implements ChatConnector, PollConnector {
	/** @default '' */
	url = '';

	private socket?: NonNullable<typeof socket>;

	private callback?: ChatMessageCallback;

	async sendMessage(message: string): Promise<void> {
		this.socket?.emit('message', message);
	}

	async abortPoll() {
		this.socket?.emit('endPoll', 0);
	}

	disableChatListener(): void | Promise<void> {
		this.socket?.emit('stopChat');
	}

	enableChatListener(): void | Promise<void> {
		this.socket?.emit('startChat');
	}

	init(): void {
		if (!getSetting('enabled')) return;
		this.url = getSetting('server-url') as string;
		this.socket = io.connect(this.url);
		this.socket.on('chatMessageRecieved', (user, message) =>
			log(user, message));
		this.socket.on('poll', async (tally) => {
			debug(tally);
			const poll = getSetting('currentPoll') as Poll;
			if (!poll.createdAt || !poll.duration) return;
			const until = new Date(poll.createdAt).getTime() + poll.duration * 1000;
			warn(until);
			if (until && poll.status === PollStatus.started) {
				poll.tally = tally.map((e: [number, number]) => e[1]);
				if (Date.now() > until) {
					poll.status = PollStatus.stopped;
					executePollMacro();
				}
				await setSetting('currentPoll', poll);
			}
		});
		this.socket.on('noPoll', async () => {
			const poll = getSetting('currentPoll') as Poll;
			if (!poll.createdAt || !poll.duration) return;
			const until = new Date(poll.createdAt).getTime() + poll.duration * 1000;
			if (until && poll.status === PollStatus.started) {
				poll.status = PollStatus.failed;
				await setSetting('currentPoll', poll);
			}
		});
		this.socket.emit('getPoll', 0);
		this.socket.on('chatMessageRecieved', (user, message) => {
			if (this.callback) this.callback(message, user, false, 'local');
		});
	}

	startPoll(poll: Poll) {
		this.socket?.emit(
			'createPoll',
			poll.options.map((_option, index) => (index + 1).toString()),
			poll.duration ? poll.duration * 1000 : 30 * 1000,
			0,
		);
	}

	disconnect(): void {
		this.socket?.disconnect();
	}

	setCallback(callback: ChatMessageCallback): void {
		this.callback = callback;
	}

	setDeletionCallback() {

	}
}

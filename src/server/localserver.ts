import { executePollMacro, Poll, PollStatus } from '../utils/polls.js';
import { getSetting, setSetting } from '../utils/settings.ts';
import type { ChatConnector, ChatMessageCallback } from './chatConnector.js';
import type { PollConnector } from './pollConnector.js';

export class LocalServer implements ChatConnector, PollConnector {
  url = '';
  socket: ReturnType<typeof window.io>;
  private callback?: ChatMessageCallback;

  /**
   *
   * @param {string} message
   * @returns {Promise<void>}
   */
  async sendMessage(message) {
    this.socket.emit('message', message);
  }

  async abortPoll() {
    this.socket.emit('endPoll', 0);
  }

  disableChatListener(): void | Promise<void> {
    this.socket.emit('stopChat');
  }

  enableChatListener(): void | Promise<void> {
    this.socket.emit('startChat');
  }

  init() {
    if (!getSetting('enabled')) return;
    this.url = getSetting('server-url');
    this.socket = io.connect(this.url);
    this.socket.on('chatMessageRecieved', (user, message) => console.log(user, message));
    this.socket.on('poll', async (tally) => {
      console.debug(tally);
      const poll = getSetting('currentPoll');
      if (!poll.createdAt || !poll.duration) return;
      const until = new Date(poll.createdAt).getTime() + poll.duration * 1000;
      console.warn(until);
      if (until && poll.status === PollStatus.started) {
        poll.tally = tally.map((e) => e[1]);
        if (Date.now() > until) {
          poll.status = PollStatus.stopped;
          executePollMacro();
        }
        await setSetting('currentPoll', poll);
      }
    });
    this.socket.on('noPoll', async () => {
      const poll = getSetting('currentPoll');
      if (!poll.createdAt || !poll.duration) return;
      const until = new Date(poll.createdAt).getTime() + poll.duration * 1000;
      if (until && poll.status === PollStatus.started) {
        poll.status = PollStatus.failed;
        await setSetting('currentPoll', poll);
      }
    });
    this.socket.emit('getPoll', 0);
    this.socket.on('chatMessageRecieved', (user: string, message: string) => {
      if (this.callback) this.callback(message, user);
    });
  }

  startPoll(poll: Poll): void | Promise<void> {
    this.socket.emit(
      'createPoll',
      poll.options.map((_option, index) => (index + 1).toString()),
      poll.duration ? poll.duration * 1000 : 30 * 1000,
      0
    );
  }

  disconnect() {
    this.socket.disconnect();
  }

  setCallback(callback: ChatMessageCallback) {
    this.callback = callback;
  }
}

import { Poll, PollStatus } from '../utils/polls.js';
import { getSetting, setSetting } from '../utils/settings.ts';
import type { ChatConnector, ChatMessageCallback } from './chatConnector.js';
import type { PollConnector } from './pollConnector.js';

export class LocalServer implements ChatConnector, PollConnector {
  url = '';
  socket;
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
    return 0;
  }

  disableChatListener(): void | Promise<void> {
    return undefined;
  }

  enableChatListener(): void | Promise<void> {
    return undefined;
  }

  init() {
    this.url = getSetting('server-url');
    this.socket = io.connect(this.url);
    this.socket.on('chatMessageRecieved', (user, message) => console.log(user, message));
    this.socket.on('poll', async (tally) => {
      console.debug(tally);
      const poll = getSetting('currentPoll');
      const until = poll.until();
      if (until && poll.status === PollStatus.started) {
        poll.tally = tally;
        if (Date.now() > until) poll.status = PollStatus.stopped;
        await setSetting('currentPoll', poll);
      }
    });
    this.socket.on('noPoll', async () => {
      const poll = getSetting('currentPoll');
      const until = poll.until();
      if (until && poll.status === PollStatus.started) {
        poll.status = PollStatus.failed;
        await setSetting('currentPoll', poll);
      }
    });
    this.socket.emit('getPoll', 0);
    this.socket.on('chatMessageRecieved', (user: string, message: string) => {
      if (this.callback) this.callback(message, user);
    });
    this.socket.emit('startChat');
  }

  startPoll(poll: Poll): void | Promise<void> {
    this.socket.emit(
      'createPoll',
      poll.options.map((option) => option.text),
      poll.duration,
      0
    );
  }

  disconnect(): void | Promise<void> {
    return undefined;
  }

  setCallback(callback: ChatMessageCallback): void | Promise<void> {
    return undefined;
  }
}

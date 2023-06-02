import { Poll, PollStatus } from '../utils/polls.js';
import { getSetting, setSetting } from '../utils/settings.ts';
import { chatMessages } from '../svelte/stores/chatMessages.js';
import { get } from 'svelte/store';
import type { ChatConnector } from './chatConnector.js';

export class Server implements ChatConnector {
  static #singleton;
  url = '';
  socket;

  constructor() {
    this.url = getSetting('server-url');
    this.socket = io.connect(this.url);
    this.socket.on('chatMessageRecieved', (user, message) => console.log(user, message));
    this.socket.on('poll', (tally) => {
      console.debug(tally);
      const poll = getSetting('currentPoll');
      const until = poll.until();
      if (until && poll.status === PollStatus.started) {
        poll.tally = tally;
        if (Date.now() > until) poll.status = PollStatus.stopped;
        setSetting('currentPoll', poll);
      }
    });
    this.socket.on('noPoll', () => {
      const poll = getSetting('currentPoll');
      const until = poll.until();
      if (until && poll.status === PollStatus.started) {
        poll.status = PollStatus.failed;
        setSetting('currentPoll', poll);
      }
    });
    this.socket.emit('getPoll', 0);
    this.socket.on('chatMessageRecieved', (user: string, message: string) => {
      chatMessages.set([...get(chatMessages), [user, message]]);
    });
    this.socket.emit('startChat');
  }

  static getServer() {
    return this.#singleton;
  }

  static createServer() {
    this.#singleton = new Server();
  }

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
    return undefined;
  }

  enableChatListener(): void | Promise<void> {
    return undefined;
  }

  init(): void | Promise<void> {
    return undefined;
  }

  startPoll(poll: Poll): void | Promise<void> {
    this.socket.emit('createPoll', poll.options.map((option) => option.text), poll.duration, 0);
  }
}

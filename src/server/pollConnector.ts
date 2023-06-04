import { Poll } from '../utils/polls.js';

export interface PollConnector {
  init(): void | Promise<void>;

  startPoll(poll: Poll): void | Promise<void>;

  disconnect(): void | Promise<void>;

  abortPoll(): void | Promise<void>;
}

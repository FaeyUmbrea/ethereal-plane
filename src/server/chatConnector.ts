import type { Poll } from '../utils/polls.ts';

export interface ChatConnector {
  init(): void | Promise<void>;

  sendMessage(message: string): void | Promise<void>;

  enableChatListener(): void | Promise<void>;

  disableChatListener(): void | Promise<void>;

  startPoll(poll: Poll): void | Promise<void>;
}
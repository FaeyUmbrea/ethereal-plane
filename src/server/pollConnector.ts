import { Poll } from "../utils/polls";

export interface PollConnector {
  startPoll(poll: Poll): void | Promise<void>;
  abortPoll(): void | Promise<void>;
  disconnect(): void | Promise<void>;
  init(): void | Promise<void>;
}

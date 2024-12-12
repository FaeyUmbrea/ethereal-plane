export type ChatMessageCallback = (
  message: string,
  user: string,
  subscribed: boolean,
  id: string,
) => void | Promise<void>;

export type ChatDeletionCallback = (messageId: string) => void | Promise<void>;

export interface ChatConnector {
  disconnect(): void;
  setCallback(callback: ChatMessageCallback): void;
  setDeletionCallback(callback: ChatDeletionCallback): void;
  init(): void | Promise<void>;
  enableChatListener(): void | Promise<void>;
  disableChatListener(): void | Promise<void>;
  sendMessage(message: string): void | Promise<void>;
}

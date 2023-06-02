export interface ChatConnector {
  setCallback(callback: ChatMessageCallback): void | Promise<void>;

  init(): void | Promise<void>;

  sendMessage(message: string): void | Promise<void>;

  enableChatListener(): void | Promise<void>;

  disableChatListener(): void | Promise<void>;

  disconnect(): void | Promise<void>;
}

export declare type ChatMessageCallback = (message: string, user: string) => void | Promise<void>;

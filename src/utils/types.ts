export type ChatMessageCallback = (
	message: string,
	user: string,
	subscribed: boolean,
	id: string,
) => void | Promise<void>;

export type ChatDeletionCallback = (messageId: string) => void | Promise<void>;

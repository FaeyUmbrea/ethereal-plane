export type ChatMessageCallback = (
	message: string,
	user: string,
	subscribed: boolean,
	id: string,
) => void | Promise<void>;

export type ChatDeletionCallback = (messageId: string) => void | Promise<void>;

export type ChatTriggerCallback = (event: ChatTriggerEvent) => boolean | Promise<boolean>;

export interface TriggerEvent {
	trigger_type: string;
	trigger_id: string;
}

export interface ChatTriggerEvent extends TriggerEvent {
	type: 'ChatCommand';
	macro_arguments: unknown;
	raw_message: string;
	message_overflow: string[];
	message_parts: string[];
	user: string;
	is_subscribed: boolean;
}

export interface TriggerConfig {
	id: string;
	title: string;
	created_at: string;
	updated_at: string;
	active: boolean;
}

export interface TriggerMacro { id: string; macro: string }

export interface ExportTriggerMacro { id: string; macro: string | Macro }

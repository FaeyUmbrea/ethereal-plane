import type { HubConnection } from '@microsoft/signalr';
import { error, log } from '../utils/utils';

let connection: HubConnection;

export interface ChatMessage {
	displayName: string;
	messageId: string;
	messageContent: string;
	isMember: boolean;
	channel: string;
	platform: string;
	timeStamp: Date;
}

export async function initChatAPI(
	accessToken: string,
	handleChatMessageReceived: (chatMessage: ChatMessage) => void,
	handleChatMessageDeleted: (messageId: string) => void,
	baseURL: string,
): Promise<void> {
	const signalR = await import('@microsoft/signalr');
	connection = new signalR.HubConnectionBuilder()
		.withUrl(`${baseURL}api/v2/hubs/chat`, {
			accessTokenFactory: () => accessToken,
			withCredentials: false,
		})
		.configureLogging(signalR.LogLevel.Information)
		.build();

	connection.on('ChatMessageReceived', handleChatMessageReceived);
	connection.on('ChatMessageDeleted', handleChatMessageDeleted);
	connection.onclose(() => {
		log('disconnected');
	});

	await connection.start();
}

export async function sendChatMessage(message: string) {
	if (connection === undefined) {
		return;
	}
	return connection
		.invoke('SendMessage', message)
		.catch(err => error(err));
}

export async function enableChatListeners(): Promise<void> {
	if (connection === undefined) {
		return;
	}
	return connection
		.invoke('EnableChatListeners')
		.catch(err => error(err));
}

export async function disableChatListeners() {
	if (connection === undefined) {
		return;
	}
	return connection
		.invoke('DisableChatListeners')
		.catch(err => error(err));
}

export async function setYoutubeId(id: string) {
	if (connection === undefined) {
		return;
	}
	connection.invoke('SetYoutubeId', id).catch(err => error(err));
}

export async function disconnectChatAPI() {
	if (connection) {
		await connection.stop();
	}
}

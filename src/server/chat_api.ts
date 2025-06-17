import { API_URL, CHAT_ENDPOINT, CONFIG_ENDPOINT, SOCKET_ENDPOINT } from '../utils/const.ts';
import { get_token, handle_refresh_error, refresh, wrapClient } from './patreon_auth.ts';

export interface ChatMessage {
	display_name: string;
	message_id: string;
	message_content: string;
	is_member: boolean;
	channel: string;
	platform: string;
	time_stamp: Date;
}

/*
export async function initChatAPI(
	accessToken: string,
	baseURL: string,
): Promise<void> {
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
*/

export async function sendChatMessage(message: string) {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	await authFetch(CHAT_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			message,
		}),
	});
}

let socket: ReturnType<typeof io> | undefined;

export async function enableChatListeners(handleChatMessageReceived: (chatMessage: ChatMessage) => void, handleChatMessageDeleted: (messageId: string) => void, handleErrorMessage: (error: string) => void) {
	const token = get_token();
	if (!token) {
		return;
	}
	let once = true;
	socket = io(`${API_URL}chat`, {
		path: SOCKET_ENDPOINT,
		reconnection: true,
		reconnectionAttempts: 5,
		transports: ['websocket'],
		auth: {
			token: token.access_token,
		},
	});

	socket.on('connect_error', async () => {
		if (once && socket !== undefined) {
			const newToken = (await refresh(token.refresh_token)).refresh_token;
			if (newToken === undefined) {
				socket.disconnect();
				return;
			}
			(socket.auth as { token: string }).token = newToken;
			socket.connect();
		} else {
			socket?.disconnect();
			await handle_refresh_error();
		}
		once = false;
	});

	socket.on('message', (message: ChatMessage) => {
		handleChatMessageReceived(message);
	});

	socket.on('delete_message', (messageId: string) => {
		handleChatMessageDeleted(messageId);
	});

	socket.on('error', (error: string) => {
		handleErrorMessage(error);
	});
}

export function disableChatListeners() {
	socket?.disconnect();
}

export async function setYoutubeId(id: string) {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	await authFetch(`${CONFIG_ENDPOINT}/youtube/id`, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8',
		},
		body: id,
	});
}

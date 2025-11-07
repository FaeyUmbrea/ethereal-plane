import type { ChatTriggerEvent, TriggerConfig, TriggerEvent } from '../utils/types.ts';
import { API_URL, SOCKET_ENDPOINT, TRIGGER_ENDPOINT } from '../utils/const.ts';
import { get_token, handle_refresh_error, refresh, wrapClient } from './patreon_auth.ts';
import { ServerStatus, triggerStatus } from './status.ts';

let socket: ReturnType<typeof io> | undefined;

export async function enableTriggerListeners(handleTriggerReceived: (chatMessage: ChatTriggerEvent) => Promise<boolean>) {
	const token = await get_token();
	if (!token) {
		return;
	}
	triggerStatus.set(ServerStatus.Connecting);
	let once = true;
	socket = io(`${API_URL}trigger`, {
		path: SOCKET_ENDPOINT,
		reconnection: true,
		reconnectionAttempts: 5,
		transports: ['websocket'],
		auth: {
			token: token.access_token,
		},
	});

	socket.on('disconnect', (reason) => {
		if (reason === 'io client disconnect') {
			triggerStatus.set(ServerStatus.Inactive);
		}
		triggerStatus.set(ServerStatus.Disconnected);
	});
	socket.on('connect', () => {
		triggerStatus.set(ServerStatus.Connected);
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

	socket.on('trigger', async (triggerEvent: TriggerEvent, callback: (trigger_lock: boolean) => void | Promise<void>) => {
		const trigger_lock = await handleTriggerReceived(triggerEvent as ChatTriggerEvent);
		await callback(trigger_lock);
	});
}

export async function getTriggers(): Promise<TriggerConfig[] | undefined> {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	const res = await authFetch(`${TRIGGER_ENDPOINT}`, {
		method: 'GET',
	});
	if (res?.status === 200) {
		return res.json();
	}
}

export function disableTriggerListeners() {
	socket?.disconnect();
}

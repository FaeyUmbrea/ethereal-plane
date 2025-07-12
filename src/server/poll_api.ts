import { API_URL, POLL_ENDPOINT, SOCKET_ENDPOINT } from '../utils/const.ts';
import { get_token, handle_refresh_error, refresh, wrapClient } from './patreon_auth.ts';
import { pollStatus, ServerStatus } from './status.ts';

export interface PollData {
	id: string;
	title: string;
	chat_poll_prefix: string;
	end_time_stamp: Date;
	start_time_stamp: Date;
	aborted: boolean;
	finalized: boolean;
	options: Array<{ count: number; name: string }>;
}

export interface PollCreateOption {
	name: string;
	title: string;
}

export async function getPoll(pollId: string): Promise<PollData | undefined> {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	const res = await authFetch(`${POLL_ENDPOINT}/${encodeURIComponent(pollId)}`, {
		method: 'GET',
	});
	if (res?.status === 200) {
		return res.json();
	}
}

export async function createPoll(
	duration: number,
	options: Array<PollCreateOption>,
	prefix: string,
	title: string,
): Promise<string | undefined> {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	const res = await authFetch(POLL_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			duration,
			options,
			prefix,
			title,
		}),
	});
	if (res?.status === 200) {
		return res.text();
	}
}

export async function abortPoll(pollId: string): Promise<void> {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	const res = await authFetch(`${POLL_ENDPOINT}/${encodeURIComponent(pollId)}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			status: 'aborted',
		}),
	});
	disablePollListeners();
	if (res?.status === 200) {
		return res.json();
	}
}

export async function endPoll(pollId: string) {
	const authFetch = (await wrapClient(fetch))?.fetch;
	if (authFetch === undefined) {
		return;
	}
	const res = await authFetch(`${POLL_ENDPOINT}/${encodeURIComponent(pollId)}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			status: 'ended',
		}),
	});
	if (res?.status === 200) {
		return res.json();
	}
}

let socket: ReturnType<typeof io> | undefined;

export async function enablePollListeners(pollUpdateCallback: (data: PollData) => void, handleErrorMessage: (error: string) => void) {
	const token = get_token();
	if (!token) {
		return;
	}
	let once = true;
	pollStatus.set(ServerStatus.Connecting);
	socket = io(`${API_URL}poll`, {
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
			pollStatus.set(ServerStatus.Inactive);
		}
		pollStatus.set(ServerStatus.Disconnected);
	});
	socket.on('connect', () => {
		pollStatus.set(ServerStatus.Connected);
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

	socket.on('poll', (data: PollData) => {
		pollUpdateCallback(data);
	});

	socket.on('error', (error: string) => {
		handleErrorMessage(error);
	});
}

export function disablePollListeners() {
	socket?.disconnect();
	pollStatus.set(ServerStatus.Inactive);
}

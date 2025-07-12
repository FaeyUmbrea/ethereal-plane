import { writable } from 'svelte/store';

export enum ServerStatus {
	Connected = 'connected',
	Disconnected = 'disconnected',
	Inactive = 'inactive',
	Connecting = 'connecting',
}

export const chatStatus = writable<ServerStatus>(ServerStatus.Inactive);
export const triggerStatus = writable<ServerStatus>(ServerStatus.Inactive);
export const pollStatus = writable<ServerStatus>(ServerStatus.Inactive);

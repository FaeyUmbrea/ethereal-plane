import { writable } from "svelte/store";

export const chatMessages = writable<
  { user: string; message: string; id: string }[]
>([]);

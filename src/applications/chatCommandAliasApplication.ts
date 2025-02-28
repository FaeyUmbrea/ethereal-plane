import type { SvelteApp } from '#runtime/svelte/application';
import { SvelteApplication } from '#runtime/svelte/application';
import ChatCommandAliasUi from '../svelte/ChatCommandAliasUi.svelte';

export default class ChatCommandAliasApplication extends SvelteApplication<Options> {
	aliases: string[];
	callback: (aliases: string[]) => void | Promise<void>;

	constructor(aliases: string[], callback: (aliases: string[]) => void | Promise<void>) {
		super();
		this.aliases = aliases;
		this.callback = callback;
	}

	// @ts-expect-error Excessive stack depth
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['command-alias-editor'],
			id: 'command-alias-editor-application',
			title: 'ethereal-plane.ui.chat-command-alias-application-title',
			// tabs: [{ navSelector: '.tabs', contentSelector: '.content', initial: 'onLoad' }],
			height: 400,
			width: 400,
			resizable: true,
			// resizable: true,
			svelte: {
				class: ChatCommandAliasUi,
				target: document.body,
			},
		});
	}

	async close(options = {}) {
		this.callback(this.aliases);
		return super.close(options);
	}
}

export type External = SvelteApp.Context.External<ChatCommandAliasApplication>;
export interface Options extends SvelteApp.Options {
	aliases: string[];
}

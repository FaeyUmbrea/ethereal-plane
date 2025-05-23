import { SvelteApplication } from '#runtime/svelte/application';
import ConfigUI from '../svelte/ConfigUI.svelte';

// @ts-expect-error get off my case
export class ConfigApplication extends SvelteApplication {
	/** @static */
	static override get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['eppolls'],
			minimizable: true,
			width: 600,
			height: 610,
			id: 'config-application',
			title: 'ethereal-plane.ui.config-application-title',
			resizable: true,
			positionOrtho: false,
			transformOrigin: null,
			svelte: {
				class: ConfigUI,
				target: document.body,
				intro: true,
			},
		});
	}
}

import ConfigUI from '../svelte/ConfigUI.svelte';
import { DOCS_URL } from '../utils/const.ts';
import { SvelteApplicationMixin } from './mixin.svelte.ts';

export class ConfigApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
	/** @static */

	protected override root = ConfigUI;

	static override DEFAULT_OPTIONS = {
		classes: ['eppolls'],

		position: {
			width: 600,
			height: 610,
		},
		window: {
			minimizable: true,
			resizable: true,
			controls: [
				{
					icon: 'fas fa-book',
					label: 'ethereal-plane.ui.docs',
					action: 'open_docs',
				},
			],
		},
		id: 'config-application',
		title: 'ethereal-plane.ui.config-application-title',
		actions: {
			open_docs: ConfigApplication.open_docs,
		},
	};

	static open_docs() {
		window.open(DOCS_URL, '_blank');
	}
}

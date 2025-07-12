import { SvelteApplication } from '#runtime/svelte/application';
import DocsButton from '../svelte/components/DocsButton.svelte';
import ConfigUI from '../svelte/ConfigUI.svelte';
import { DOCS_URL } from '../utils/const.ts';

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

	override _getHeaderButtons() {
		const buttons = super._getHeaderButtons();

		buttons.unshift(
			{
				icon: 'fas fa-book',
				class: 'ethereal-plane-docs-button',
				title: 'ethereal-plane.ui.docs',
				label: 'ethereal-plane.ui.docs',
				svelte: {
					class: DocsButton,
				},
				onclick() {
					window.open(DOCS_URL, '_blank');
				},
			},
		);
		return buttons;
	}
}

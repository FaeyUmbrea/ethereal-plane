import type { DeepPartial } from 'fvtt-types/utils';
import PollApplicationUi from '../svelte/PollApplicationUI.svelte';
import { SvelteApplicationMixin } from './mixin.svelte.ts';

export default class PollApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
	/** */
	sidebarButton: SceneControls.Tool;

	constructor(options: DeepPartial<foundry.applications.api.ApplicationV2.Configuration>, sidebarButton: SceneControls.Tool) {
		super(options);
		this.sidebarButton = sidebarButton;
	}

	protected override root = PollApplicationUi;

	static override DEFAULT_OPTIONS = {
		classes: ['eppolls'],
		position: {
			width: 500,
			height: 330,
		},
		window: {
			minimizable: true,
		},
		id: 'polls-application',
		title: 'ethereal-plane.ui.polls-application-title',
	};

	override async close(options?: DeepPartial<foundry.applications.api.ApplicationV2.ClosingOptions>) {
		$('[data-tool=openStreamDirector]').removeClass('active');
		this.sidebarButton.active = false;
		return await super.close(options);
	}
}

import type { DeepPartial } from 'fvtt-types/utils';
import LoginUI from '../svelte/LoginUI.svelte';
import { SvelteApplicationMixin } from './mixin.svelte.ts';

export default class LoginApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
	user_code: string;
	uri: string;

	constructor(config: DeepPartial<foundry.applications.api.ApplicationV2.Configuration>, user_code: string, uri: string) {
		super(config);
		this.user_code = user_code;
		this.uri = uri;
	}

	protected override root = LoginUI;

	static override DEFAULT_OPTIONS = {
		classes: ['login-dialog'],
		id: 'login-application',
		title: 'ethereal-plane.ui.login-application-title',
		position: {
			width: 400,
			height: 455,
		},
	};
}

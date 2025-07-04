import { SvelteApplication } from '#runtime/svelte/application';
import LoginUI from '../svelte/LoginUI.svelte';

export default class LoginApplication extends SvelteApplication {
	constructor(user_code: string, uri: string | undefined) {
		super({
			// @ts-expect-error yep
			classes: ['login-dialog'],
			id: 'login-application',
			title: 'ethereal-plane.ui.login-application-title',
			width: 400,
			height: 455,
			svelte: {
				class: LoginUI,
				target: document.body,
				props: { user_code, uri },
			},
		});
	}
}

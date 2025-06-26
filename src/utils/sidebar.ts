import type { ComponentConstructorOptions, SvelteComponent } from 'svelte';
import { SvelteApplication } from '#runtime/svelte/application';
import SidebarTabButton from '../svelte/components/SidebarTabButton.svelte';
import SidebarPopout from '../svelte/sidebar/SidebarPopout.svelte';
import SidebarTab from '../svelte/sidebar/SidebarTab.svelte';

export async function addSidebar(
	id: string,
	tooltip: string,
	icon: string,
	before: string,
	SvelteClass: new (
		options: ComponentConstructorOptions<Record<string, never>>,
	) => SvelteComponent,
	props = {},
) {
	const foundrySidebar = document.querySelector('#sidebar');
	const foundrySidebarTabs = document.querySelector('#sidebar-tabs');

	if ((ui as unknown as Record<string, object>)[id] !== void 0) {
		throw new Error('Sidebar element with this id already exists');
	}

	const button = foundrySidebarTabs!.querySelector(`[data-tab=${before}]`);

	// eslint-disable-next-line no-new
	new SidebarTabButton({
		target: foundrySidebarTabs!,
		anchor: button ?? undefined,
		props: {
			id,
			icon,
			tooltip,
		},
	});

	const beforeTab
    = foundrySidebar!.querySelector(`template[data-tab=${before}]`) && foundrySidebar!.querySelector(`section[data-tab=${before}]`);

	// eslint-disable-next-line no-new
	new SidebarTab({
		target: foundrySidebar!,
		anchor: beforeTab ?? undefined,
		props: {
			id,
			sidebarClass: SvelteClass,
			sidebarProps: props,
		},
	});

	const popout = new SvelteApplication({
		// @ts-expect-error types not updated
		title: tooltip,
		resizable: true,
		svelte: {
			class: SidebarPopout as never,
			target: document.body,
			intro: true,
			props: {
				sidebarClass: SvelteClass,
				sidebarProps: props,
			},
		},
	});

	(ui as unknown as Record<string, object>)[`${id}`] = Object.assign({
		_popout: popout,
		renderPopout: () => popout.render(true, { focus: true }),
		render() {},
	});
}

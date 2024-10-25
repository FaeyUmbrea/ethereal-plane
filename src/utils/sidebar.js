import SidebarTabButton from "../svelte/components/SidebarTabButton.svelte";
import { SvelteApplication } from "#runtime/svelte/application";
import SidebarPopout from "../svelte/sidebar/SidebarPopout.svelte";
import SidebarTab from "../svelte/sidebar/SidebarTab.svelte";

export async function addSidebar(
  id,
  tooltip,
  icon,
  before,
  SvelteClass,
  props = {},
) {
  const foundrySidebar = document.querySelector("#sidebar");
  const foundrySidebarTabs = document.querySelector("#sidebar-tabs");

  if (window.ui[id] !== void 0) {
    throw new Error("Sidebar element with this id already exists");
  }

  const button = foundrySidebarTabs.querySelector(`[data-tab=${before}]`);

  new SidebarTabButton({
    target: foundrySidebarTabs,
    anchor: button,
    props: {
      id,
      icon,
      tooltip,
    },
  });

  const beforeTab =
    foundrySidebar.querySelector(`template[data-tab=${before}]`) &&
    foundrySidebar.querySelector(`section[data-tab=${before}]`);

  new SidebarTab({
    target: foundrySidebar,
    anchor: beforeTab,
    props: {
      id,
      sidebarClass: SvelteClass,
      sidebarProps: props,
    },
  });

  const popout = new SvelteApplication({
    title: tooltip,
    resizable: true,
    svelte: {
      class: SidebarPopout,
      target: document.body,
      intro: true,
      props: {
        sidebarClass: SvelteClass,
        sidebarProps: props,
      },
    },
  });

  window.ui[`${id}`] = Object.assign({
    _popout: popout,
    renderPopout: () => popout.render(true, { focus: true }),
    render() {},
  });
}

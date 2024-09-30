import PollApplicationUi from "../svelte/PollApplicationUI.svelte";
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";

/** @extends SvelteApplication */
export default class PollApplication extends SvelteApplication {
  /** */
  sidebarButton = undefined;

  constructor(sidebarButton) {
    super();
    this.sidebarButton = sidebarButton;
  }

  /** @static */
  static get defaultOptions() {
    //@ts-ignore
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["eppolls"],
      minimizable: true,
      width: 500,
      height: 315,
      id: "polls-application",
      title: "ethereal-plane.ui.polls-application-title",
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: PollApplicationUi,
        target: document.body,
        intro: true,
      },
    });
  }

  /** @returns {Promise<void>} */
  async close() {
    //@ts-ignore
    await super.close();
    $("[data-tool=openStreamDirector]").removeClass("active");
    this.sidebarButton.active = false;
  }
}

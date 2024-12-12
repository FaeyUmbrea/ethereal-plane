import { SvelteApplication } from "#runtime/svelte/application";
import ConfigUI from "../svelte/ConfigUI.svelte";

export class ConfigApplication extends SvelteApplication {
  /** @static */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["eppolls"],
      minimizable: true,
      width: 550,
      height: 460,
      id: "config-application",
      title: "ethereal-plane.ui.config-application-title",
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

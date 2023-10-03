import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import ConfigUI from "../svelte/ConfigUI.svelte";
import { settings } from "../utils/settings.js";

/** @extends SvelteApplication */
export class ConfigApplication extends SvelteApplication {
  /** @static */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["eppolls"],
      minimizable: true,
      width: 550,
      height: 460,
      id: "config-application",
      title: "Ethereal Plane Config",
      resizable: true,
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: ConfigUI,
        target: document.body,
        intro: true,
        props: {
          settings: settings,
        },
      },
    });
  }
}

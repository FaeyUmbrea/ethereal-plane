import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import ChatCommandConfigUI from "../svelte/ChatCommandConfigUI.svelte";

/** @extends SvelteApplication */
export class ChatCommandApplication extends SvelteApplication {
  /** @static */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["eppolls"],
      minimizable: true,
      width: 500,
      height: 320,
      id: "chatcommand-config-application",
      title: "Chat Command Config",
      resizable: true,
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: ChatCommandConfigUI,
        target: document.body,
        intro: true,
      },
    });
  }
}

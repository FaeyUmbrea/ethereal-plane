import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import NotificationCenterUI from "../svelte/NotificationCenterUI.svelte";

export default class NotificationCenter extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["notification-center"],
      id: "notification-application",
      title: "Ethereal Plane Notification Center",
      height: 420,
      width: 520,
      resizable: true,
      svelte: {
        class: NotificationCenterUI,
        target: document.body,
      },
    });
  }
}

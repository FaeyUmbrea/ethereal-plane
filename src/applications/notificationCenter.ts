import { SvelteApplication } from "#runtime/svelte/application";
import NotificationCenterUI from "../svelte/NotificationCenterUI.svelte";

export default class NotificationCenter extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["notification-center"],
      id: "notification-application",
      title: "ethereal-plane.ui.notification-application-title",
      height: 600,
      width: 900,
      resizable: true,
      svelte: {
        target: document.body,
        class: NotificationCenterUI,
      },
    });
  }
}

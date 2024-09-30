import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import LoginUI from "../svelte/LoginUI.svelte";

export default class LoginApplication extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["login-dialog"],
      id: "login-application",
      title: "Ethereal Plane Login",
      width: 400,
      height: 435,
      svelte: {
        class: LoginUI,
        target: document.body,
      },
    });
  }
}

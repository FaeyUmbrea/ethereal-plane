import { MODULE_ID } from "./const.js";
import { sendRoll } from "../handlers/rollHandler.js";
import { getSetting } from "./settings.js";

let modulesocket;

Hooks.once("socketlib.ready", () => {
  modulesocket = window.socketlib.registerModule(MODULE_ID);

  modulesocket.register("roll", sendRollIfAllowed);
});

/** @param {string} user
 * @param {string} formula
 * @param {string} result
 * @returns {void}
 */
export function sendRollToGM(user, formula, result) {
  if (getSetting("allow-socket")) {
    modulesocket.executeAsGM("roll", user, formula, result);
  }
}

/** @param {string} user
 * @param {string} formula
 * @param {string} result
 * @returns {void}
 */
export function sendRollIfAllowed(user, formula, result) {
  if (getSetting("allow-socket")) {
    sendRoll(user, formula, result);
  }
}

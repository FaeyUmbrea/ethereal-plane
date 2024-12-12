import { sendRoll } from "../handlers/rollHandler";
import { getSetting } from "./settings";

Hooks.once("init", () => {
  game.socket.on("event.ethereal-plane", handleEvent);
});

async function handleEvent({ eventType, targetUser, payload }) {
  if (!!targetUser && game.userId !== targetUser) return;

  if (eventType === "roll" && game.user?.isGM) {
    sendRollIfAllowed(payload.user, payload.formula, payload.result);
  }
}

/** @param {string} user
 * @param {string} formula
 * @param {string} result
 * @returns {void}
 */
export function sendRollToGM(user, formula, result) {
  if (getSetting("allow-socket")) {
    const eventData = {
      eventType: "roll",
      payload: { user: user, formula: formula, result: result },
    };
    game.socket.emit("event.ethereal-plane", eventData);
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

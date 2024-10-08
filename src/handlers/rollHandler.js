import { getSetting } from "../utils/settings.js";
import { getGame } from "../utils/helpers.js";
import { getConnectionManager } from "../server/connectionManager.js";
import { sendRollToGM } from "../utils/sockets.js";

/** @returns {void} */
export function registerHanlder() {
  if (getGame().user?.isGM) {
    Hooks.on("createChatMessage", (event) => {
      const msg = event;
      if (msg.isRoll && msg.whisper.length === 0) {
        const formula = msg.rolls.reduce(
          (accumulator, currentValue) =>
            accumulator
              ? accumulator + " + "
              : accumulator + currentValue.formula,
          "",
        );
        const result = msg.rolls.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue.total),
          0,
        );

        if (getSetting("send-rolls-to-chat")) {
          if (!event.user?.name || !formula || !result) return;
          sendRoll(event.user.name, formula, result.toString());
        }
      }
    });
  }

  Hooks.on("midi-qol.AttackRollComplete", (workflow) => {
    const attackRoll = workflow.attackRoll;
    const message = getGame().messages?.get(workflow.itemCardId);
    if (!message) return;
    const formula = attackRoll.formula;
    const result = attackRoll.total;

    if (message.data.whisper.length === 0 && getSetting("send-rolls-to-chat")) {
      const name = getGame().user?.name;
      if (!name) return;
      if (getGame().user?.isGM) {
        sendRoll(name, formula, result);
      } else {
        sendRollToGM(name, formula, result);
      }
    }
  });

  Hooks.on("midi-qol.DamageRollComplete", (workflow) => {
    const attackRoll = workflow.damageRoll;
    const message = getGame().messages?.get(workflow.itemCardId);
    if (!message) return;
    const formula = attackRoll.formula;
    const result = attackRoll.total;

    if (message.data.whisper.length === 0 && getSetting("send-rolls-to-chat")) {
      const name = getGame().user?.name;
      if (!name) return;
      if (getGame().user?.isGM) {
        sendRoll(name, formula, result);
      } else {
        sendRollToGM(name, formula, result);
      }
    }
  });
}

/** @param {string} user
 * @param {string} formula
 * @param {string} result
 * @returns {void}
 */
export function sendRoll(user, formula, result) {
  const pattern = getSetting("chat-message-template");
  const message = pattern
    .replace("%USER%", user)
    .replace("%FORMULA%", formula)
    .replace("%RESULT%", result);
  getConnectionManager().sendMessage(message);
}

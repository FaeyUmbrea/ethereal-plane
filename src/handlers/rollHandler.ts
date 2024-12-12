import { getSetting } from "../utils/settings";
import { getGame } from "../utils/helpers";
import { getConnectionManager } from "../server/connectionManager";
import { sendRollToGM } from "../utils/sockets";

type Workflow = { attackRoll: AttackRoll; itemCardId: string };
type DamageWorkflow = { damageRoll: AttackRoll; itemCardId: string };
type AttackRoll = { formula: string; total: string };

export function registerHandler(): void {
  if (getGame().user?.isGM) {
    Hooks.on("createChatMessage", (msg: ChatMessage) => {
      if (msg.isRoll && msg.whisper.length === 0) {
        const formula = msg.rolls.reduce(
          (accumulator, currentValue) =>
            accumulator
              ? accumulator + " + "
              : accumulator + currentValue.formula,
          "",
        );
        const result = msg.rolls.reduce(
          (accumulator, currentValue) => accumulator + currentValue.total,
          0,
        );

        if (getSetting("send-rolls-to-chat")) {
          // @ts-expect-error why
          if (!msg.author.name || !formula || !result) return;
          sendRoll(msg.author.name, formula, result.toString());
        }
      }
    });
  }

  function sendMidiRoll(message: ChatMessage, attackRoll: AttackRoll) {
    if (!message) return;
    const formula = attackRoll.formula;
    const result = attackRoll.total;

    if (message.whisper.length === 0 && getSetting("send-rolls-to-chat")) {
      const name = getGame().user?.name;
      if (!name) return;
      if (getGame().user?.isGM) {
        sendRoll(name, formula, result);
      } else {
        sendRollToGM(name, formula, result);
      }
    }
  }

  Hooks.on("midi-qol.AttackRollComplete", (workflow: Workflow) => {
    const attackRoll = workflow.attackRoll;
    const message = getGame()?.messages?.get(
      workflow.itemCardId,
    ) as ChatMessage;
    sendMidiRoll(message, attackRoll);
  });

  Hooks.on("midi-qol.DamageRollComplete", (workflow: DamageWorkflow) => {
    const attackRoll = workflow.damageRoll;
    const message = getGame().messages?.get(workflow.itemCardId);
    sendMidiRoll(message, attackRoll);
  });
}

export function sendRoll(user: string, formula: string, result: string): void {
  const pattern = getSetting("chat-message-template");
  const message = pattern
    .replace("%USER%", user)
    .replace("%FORMULA%", formula)
    .replace("%RESULT%", result);
  getConnectionManager().sendMessage(message);
}

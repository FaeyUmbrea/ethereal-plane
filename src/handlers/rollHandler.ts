import { getSetting } from '../utils/settings.ts';
import { Server } from '../server/server.ts';
import { getGame } from '../utils/helpers.js';

export function registerHanlder() {
  Hooks.on('createChatMessage', (event) => {
    const msg = event;
    if (msg.isRoll && msg.whisper.length === 0) {
      const formula = msg.roll?.formula;
      const result = msg.roll?.total;

      if (getSetting('sendRollsToChat')) {
        Server.getServer().sendMessage('Rolled ' + formula + ' and got a ' + result + '!');
      }
    }
  });

  Hooks.on('midi-qol.AttackRollComplete', (workflow) => {
    const attackRoll = workflow.attackRoll;
    const message = getGame().messages?.get(workflow.itemCardId);
    if (!message) return;
    const formula = attackRoll.formula;
    const result = attackRoll.total;

    if (message.data.whisper.length === 0 && getSetting('sendRollsToChat')) {
      Server.getServer().sendMessage('Rolled ' + formula + ' and got a ' + result + '!');
    }
  });

  Hooks.on('midi-qol.DamageRollComplete', (workflow) => {
    const attackRoll = workflow.damageRoll;
    const message = getGame().messages?.get(workflow.itemCardId);
    if (!message) return;
    const formula = attackRoll.formula;
    const result = attackRoll.total;

    if (message.data.whisper.length === 0 && getSetting('sendRollsToChat')) {
      Server.getServer().sendMessage('Rolled ' + formula + ' and got a ' + result + '!');
    }
  });
}

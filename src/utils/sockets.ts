import { MODULE_ID } from './const.js';
import { sendRoll } from '../handlers/rollHandler.js';

let modulesocket;

Hooks.once('socketlib.ready', () => {
  modulesocket = window.socketlib.registerModule(MODULE_ID);

  modulesocket.register('roll', sendRoll);
});

export function sendRollToGM(user: string, formula: string, result: string) {
  modulesocket.executeAsGM('roll', user, formula, result);
}

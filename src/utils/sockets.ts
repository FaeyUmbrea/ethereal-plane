import { MODULE_ID } from './const.js';
import { sendRoll } from '../handlers/rollHandler.js';
import { getSetting } from './settings.js';

let modulesocket;

Hooks.once('socketlib.ready', () => {
  modulesocket = window.socketlib.registerModule(MODULE_ID);

  modulesocket.register('roll', sendRollIfAllowed);
});

export function sendRollToGM(user: string, formula: string, result: string) {
  if (getSetting('allow-socket')) {
    modulesocket.executeAsGM('roll', user, formula, result);
  }
}

export function sendRollIfAllowed(user: string, formula: string, result: string) {
  if (getSetting('allow-socket')) {
    sendRoll(user, formula, result);
  }
}
import PollApplication from './applications/pollApplication.js';
import { registerHanlders } from './handlers/index.js';
import { getSetting, settings } from './utils/settings.js';
import { registerOverlay } from './utils/overlay.js';
import { ChatApplication } from './applications/chatApplication.js';
import { FVTTSidebarControl } from '@typhonjs-fvtt/svelte-standard/application';
import StreamChat from './svelte/StreamChat.svelte';
import { getGame } from './utils/helpers.js';
import { getConnectionManager } from './server/connectionManager.js';

let polls;
let chat;

/**
 * @param {SceneControl[]} buttons
 */
function buildButtons(buttons) {
  if (!getGame().user?.isGM) return;
  const buttonGroup = buttons.find((element) => element.name === 'token');
  const pollsButton: SceneControlTool = {
    icon: 'fa-solid fa-square-poll-vertical',
    name: 'openPolls',
    title: 'Open Polls',
    toggle: true,
    onClick: () => openPolls(pollsButton)
  };
  const chatButton: SceneControlTool = {
    icon: 'fa-solid fa-plus',
    name: 'openChat',
    title: 'Open Chat',
    toggle: true,
    onClick: () => openChat(chatButton)
  };
  buttonGroup?.tools.push(pollsButton);
  buttonGroup?.tools.push(chatButton);
}

/**
 *
 * @param {SceneControl} button
 */
function openPolls(button) {
  if (!polls) polls = new PollApplication(button);
  if (!polls.rendered) polls.render(true);
  else polls.close();
}

function openChat(button) {
  if (!chat) chat = new ChatApplication(button);
  if (!chat.rendered) chat.render(true);
  else chat.close();
}

Hooks.once('init', async () => {
  settings.init();
});
Hooks.once('ready', async () => {
  //await Server.createServer();
  if (getSetting('enabled')) {
    getConnectionManager();
    registerHanlders();
  }
});
Hooks.once('ready', () => {
  if (!getGame().modules.get('lib-wrapper')?.active && getGame().user?.isGM)
    ui.notifications?.error('Module XYZ requires the \'libWrapper\' module. Please install and activate it.');
});

Hooks.on('getSceneControlButtons', buildButtons);

Hooks.on('obsUtilsInit', registerOverlay);

Hooks.once('getSceneControlButtons', () => {
  if (getGame().user?.isGM && getSetting('enableChatTab'))
    FVTTSidebarControl.add({
      beforeId: 'combat',
      id: 'epchat',
      icon: 'fas fa-message-bot',
      title: 'Stream Chat',
      tooltip: 'Stream Chat',
      svelte: {
        class: StreamChat
      }
    });
});

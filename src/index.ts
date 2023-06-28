import PollApplication from './applications/pollApplication.js';
import { registerHanlders } from './handlers/index.js';
import { getSetting, setSetting, settings, showNotifications } from './utils/settings.js';
import { registerOverlay } from './utils/overlay.js';
import { FVTTSidebarControl } from '@typhonjs-fvtt/svelte-standard/application';
import StreamChat from './svelte/StreamChat.svelte';
import { getGame } from './utils/helpers.js';
import { getConnectionManager } from './server/connectionManager.js';
import { nanoid } from 'nanoid';

let polls;

function buildButtons(buttons) {
  if (!getGame().user?.isGM || !getSetting('polls-enabled') || !getSetting('enabled')) return;
  const buttonGroup = buttons.find((element) => element.name === 'token');
  const pollsButton: SceneControlTool = {
    icon: 'fa-solid fa-square-poll-vertical',
    name: 'openPolls',
    title: 'Open Polls',
    toggle: true,
    onClick: () => openPolls(pollsButton)
  };
  buttonGroup?.tools.push(pollsButton);
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
Hooks.once('ready', async () => {
  settings.init();
  if (getSetting('enabled')) {
    registerHanlders();
  }
  if (getGame().user?.isGM) {
    showNotifications();
    getConnectionManager();
    const campaignID = getSetting('campaign-id');
    if (!campaignID) await setSetting('campaign-id', nanoid(64));
  }
});

Hooks.on('getSceneControlButtons', buildButtons);

Hooks.on('obsUtilsInit', registerOverlay);

Hooks.once('getSceneControlButtons', () => {
  if (getGame().user?.isGM && getSetting('enable-chat-tab') && getSetting('enabled'))
    FVTTSidebarControl.add({
      beforeId: 'combat',
      id: 'epchat',
      icon: 'fas fa-message-bot',
      title: 'Stream Chat',
      tooltip: 'Stream Chat',
      svelte: {
        class: StreamChat
      },
    });
});

import PollApplication from "./applications/pollApplication.js";
import {registerHanlders} from "./handlers/index.js";
import {getSetting, registerSettings} from "./utils/settings.js";
import {Server} from "./utils/server.js";

let polls;

/**
 * @param {SceneControl[]} buttons
 */
function buildButtons(buttons) {
  if (!game.user?.isGM) return;
  const buttonGroup = buttons.find((element) => element.name === 'token');
  const newButton = {
    icon: 'fa-solid fa-square-poll-vertical',
    name: 'openPolls',
    title: 'Open Polls',
    toggle: true,
    onClick: () => openPolls(newButton),
  };
  buttonGroup?.tools.push(newButton);
}

/**
 *
 * @param {Server} server
 * @param {SceneControl} button
 */
function openPolls(button) {
  if (!polls) polls = new PollApplication(button);
  if (!polls.rendered) polls.render(true);
  else polls.close();
}

Hooks.once("ready",async () => {
  registerSettings();

  await Server.createServer();
  if (getSetting("enabled")) {
    registerHanlders();
  }
})

Hooks.on('getSceneControlButtons', buildButtons);
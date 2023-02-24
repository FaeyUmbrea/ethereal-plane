import PollApplication from "./applications/pollApplication.js";
import { registerHanlders } from "./handlers/index.js";
import { Server } from "./utils/server.js";
import { getSetting, registerSettings } from "./utils/settings.js";

let polls;
let server;

/**
 * @param {SceneControl[]} buttons
 */
function buildButtons(buttons) {
  if (game.user?.isGM) return;
  const buttonGroup = buttons.find((element) => element.name === 'token');
  const newButton = {
    icon: 'fa-solid fa-square-poll-vertical',
    name: 'openPolls',
    title: 'Open Polls',
    toggle: true,
    onClick: () => openPolls(server,newButton),
  };
  buttonGroup?.tools.push(newButton);
}

/**
 *
 * @param {Server} server
 * @param {SceneControl} button
 */
function openPolls(server,button) {
  if (!polls) polls = new PollApplication(server,button);
  if (!polls.rendered) polls.render(true);
  else polls.close();
}

Hooks.once("ready",()=>{
  registerSettings();
  
  server = new Server();

  if(getSetting("enabled")){
    registerHanlders(server);
  }
})

Hooks.on('getSceneControlButtons', buildButtons);


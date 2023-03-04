import PollApplication from "./applications/pollApplication.js";
import {registerHanlders} from "./handlers/index.js";
import {getSetting, registerSettings} from "./utils/settings.js";
import {Server} from "./utils/server.js";
import {registerOverlay} from "./utils/overlay.js";
import {ChatApplication} from "./applications/chatApplication.js";
//import {ChatSidebar} from "./applications/chatSidebar.js";

let polls;
let chat;

/**
 * @param {SceneControl[]} buttons
 */
function buildButtons(buttons) {
  if (!game.user?.isGM) return;
  const buttonGroup = buttons.find((element) => element.name === 'token');
  const pollsButton = {
    icon: 'fa-solid fa-square-poll-vertical',
    name: 'openPolls',
    title: 'Open Polls',
    toggle: true,
    onClick: () => openPolls(pollsButton),
  };
  const chatButton = {
    icon: 'fa-solid fa-plus',
    name: 'openChat',
    title: 'Open Chat',
    toggle: true,
    onClick: () => openChat(chatButton),
  }
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

Hooks.once("init", async () => {
  /*libWrapper.register('ethereal-plane','Sidebar.prototype.getData',function (wrapped, ...args) {
    let result = wrapped(...args);

    return foundry.utils.mergeObject(result,{
      tabs: {
        epchat: {
          tooltip: "SIDEBAR.TabSettings",
          icon: "fas fa-plus"
        }
      }
    })
  }, 'MIXED');*/

  //CONFIG.ui.epchat = ChatSidebar

  await registerSettings();
})
Hooks.once("ready",async () => {

  await Server.createServer();
  if (getSetting("enabled")) {
    registerHanlders();
  }
})
Hooks.once('ready', () => {
  if(!game.modules.get('lib-wrapper')?.active && game.user.isGM)
    ui.notifications.error("Module XYZ requires the 'libWrapper' module. Please install and activate it.");
});

Hooks.on('getSceneControlButtons', buildButtons);

Hooks.on('obsUtilsInit', registerOverlay)


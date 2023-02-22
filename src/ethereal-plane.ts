import PollApplication from "./applications/pollApplication";
import { registerHanlders } from "./handlers";
import { getGame } from "./utils/helpers";
import { Server } from "./utils/server";
import { getSetting, registerSettings } from "./utils/settings";

let polls: any;
let server: Server;

function buildButtons(buttons: SceneControl[]) {
  if (!getGame().user?.isGM) return;
  const buttonGroup = buttons.find((element) => element.name === 'token');
  const newButton = {
    icon: 'fa-solid fa-square-poll-vertical',
    name: 'openPolls',
    title: 'Open Polls',
    toggle: true,
    onClick: (): void => openPolls(server,newButton),
  };
  buttonGroup?.tools.push(newButton);
}

function openPolls(server:Server,button: SceneControlTool) {
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


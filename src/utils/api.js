import { getSetting } from "./settings.js";
import { getConnectionManager } from "../server/connectionManager.js";

export function getApi() {
  const moduleData = game.modules.get("ethereal-plane");
  if (moduleData) return moduleData.api;
  else throw new Error("Something went very wrong!");
}

export class EtherealPlaneAPI {
  sendMessageToChat(message) {
    if (getSetting("allow-api")) {
      getConnectionManager().sendMessage(message);
    }
  }
}

Hooks.once("init", async () => {
  const moduleData = game?.modules?.get("ethereal-plane");
  if (moduleData) {
    moduleData.api = new EtherealPlaneAPI();
    Hooks.call("etherealPlaneInit");
  }
});

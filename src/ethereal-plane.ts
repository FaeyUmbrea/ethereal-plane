import { registerHanlders } from "./handlers";
import { getSetting, registerSettings } from "./utils/settings";

registerSettings();

if(getSetting("enabled")){
  registerHanlders();
}
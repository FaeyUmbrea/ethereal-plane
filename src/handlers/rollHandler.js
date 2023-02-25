import {getSetting} from "../utils/settings.js";
import {Server} from "../utils/server.js";

export function registerHanlder(){
    Hooks.on("createChatMessage",(event)=>{
        const msg = event
        if(msg.isRoll&&(msg.whisper.length === 0))
        {
            const formula = msg.roll?.formula;
            const result = msg.roll?.result;

            if(getSetting("sendRollsToChat")){
                Server.getServer().sendMessage("Rolled "+formula+" and got a "+result+"!");
            }
        }
    })
}
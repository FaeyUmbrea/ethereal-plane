import {getSetting} from "../utils/settings.js";

/**
 *
 * @param {import("../utils/server").Server} server
 */
export function registerHanlder(server){
    Hooks.on("createChatMessage",(event)=>{
        const msg = event
        if(msg.isRoll&&(msg.whisper.length === 0))
        {
            const formula = msg.roll?.formula;
            const result = msg.roll?.result;

            if(getSetting("sendRollsToChat")){
                server.sendMessage("Rolled "+formula+" and got a "+result+"!");
            }
        }
    })
}
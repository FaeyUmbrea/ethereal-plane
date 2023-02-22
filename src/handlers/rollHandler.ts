import { Server } from "../utils/server";
import { getSetting } from "../utils/settings";

export function registerHanlder(server: Server){
    Hooks.on("createChatMessage",(event:ChatMessage&{whisper:String[]})=>{
        const msg = event
        if(msg.isRoll&&(msg.whisper.length == 0))
        {
            const formula = msg.roll?.formula;
            const result = msg.roll?.result;

            if(getSetting("sendRollsToChat")){
                server.sendMessage("Rolled "+formula+" and got a "+result+"!");
            }
        }
    })
}
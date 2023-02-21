import { sendMessage } from "../utils/server";
import { getSetting } from "../utils/settings";

export function registerHanlder(){
    Hooks.on("createChatMessage",(event:[ChatMessage&{whisper:String[]},any,string])=>{
        const msg = event[0]
        if(msg.isRoll&&(msg.whisper.length == 0))
        {
            const formula = msg.roll?.formula;
            const result = msg.roll?.result;

            if(getSetting("sendRollsToChat")){
                sendMessage("Rolled "+formula+" and got a "+result+"!");
            }
        }
    })
}
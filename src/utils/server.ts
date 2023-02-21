import { getSetting } from "./settings";


const url = getSetting("server-url") as string;

export const socket = io.connect(url) 

export async function sendMessage(message: string){
    socket.emit("message",message);
}


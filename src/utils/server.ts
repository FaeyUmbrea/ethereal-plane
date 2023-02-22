import { Poll, PollStatus } from "./polls";
import { getSetting, setSetting } from "./settings";

export class Server {
    url: string;
    socket;
    constructor(){
        this.url = getSetting("server-url") as string;
        this.socket = io.connect(this.url ) 
        this.socket.on("chatMessageRecieved", (user,message)=> console.log(user,message))
        this.socket.on("poll",(tally)=>{
            console.debug(tally);
            const poll = getSetting("currentPoll") as Poll;
            if(poll.until && poll.status == PollStatus.started){
                poll.tally = tally;
                if(Date.now() > new Date(poll.until).getTime()) poll.status = PollStatus.stopped;
                setSetting("currentPoll",poll);
            }
        })
        this.socket.on("noPoll",()=>{
            const poll = getSetting("currentPoll") as Poll;
            if(poll.until && poll.status == PollStatus.started){
                poll.status = PollStatus.failed;
                setSetting("currentPoll",poll);
            }
        })
        this.socket.emit("getPoll",0);
    }

    async sendMessage(message: string){
        this.socket.emit("message",message);
    }

    async createPoll(options:Array<string>,timeout:number){
        this.socket.emit("createPoll",options,timeout,0);
    }
}

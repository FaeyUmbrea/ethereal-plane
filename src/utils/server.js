import {PollStatus} from "./polls.js";
import {getSetting, setSetting} from "./settings.js";

export class Server {
    static #singleton;
    url = "";
    socket;
    constructor(){
        this.url = getSetting("server-url");
        this.socket = io.connect(this.url)
        this.socket.on("chatMessageRecieved", (user,message)=> console.log(user,message))
        this.socket.on("poll",(tally)=>{
            console.debug(tally);
            const poll = getSetting("currentPoll");
            if(poll.until && poll.status === PollStatus.started){
                poll.tally = tally;
                if(Date.now() > new Date(poll.until).getTime()) poll.status = PollStatus.stopped;
                setSetting("currentPoll",poll);
            }
        })
        this.socket.on("noPoll",()=>{
            const poll = getSetting("currentPoll");
            if(poll.until && poll.status === PollStatus.started){
                poll.status = PollStatus.failed;
                setSetting("currentPoll",poll);
            }
        })
        this.socket.emit("getPoll",0);
    }

    /**
     *
     * @param {string} message
     * @returns {Promise<void>}
     */
    async sendMessage(message){
        this.socket.emit("message",message);
    }

    async abortPoll(){
        this.socket.emit("endPoll",0);
    }

    /**
     *
     * @param {string[]} options
     * @param {number} timeout
     * @returns {Promise<void>}
     */
    async createPoll(options,timeout){
        this.socket.emit("createPoll",options,timeout,0);
    }

    static getServer(){
        return this.#singleton
    }

    static createServer(){
        this.#singleton = new Server();
    }
}


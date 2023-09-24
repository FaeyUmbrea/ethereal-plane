import { executePollMacro, PollStatus } from "../utils/polls.js";
import { getSetting, setSetting } from "../utils/settings.js";

/** */
export class LocalServer {
  /** @default '' */
  url = "";
  /** */
  socket = undefined;
  /** @private */
  callback = undefined;

  /** @returns {Promise<void>} */
  async sendMessage(message) {
    this.socket.emit("message", message);
  }

  /** @returns {Promise<void>} */
  async abortPoll() {
    this.socket.emit("endPoll", 0);
  }

  /** @returns {void | Promise<void>} */
  disableChatListener() {
    this.socket.emit("stopChat");
  }

  /** @returns {void | Promise<void>} */
  enableChatListener() {
    this.socket.emit("startChat");
  }

  /** @returns {void} */
  init() {
    if (!getSetting("enabled")) return;
    this.url = getSetting("server-url");
    this.socket = window.io.connect(this.url);
    this.socket.on("chatMessageRecieved", (user, message) =>
      console.log(user, message),
    );
    this.socket.on("poll", async (tally) => {
      console.debug(tally);
      const poll = getSetting("currentPoll");
      if (!poll.createdAt || !poll.duration) return;
      const until = new Date(poll.createdAt).getTime() + poll.duration * 1000;
      console.warn(until);
      if (until && poll.status === PollStatus.started) {
        poll.tally = tally.map((e) => e[1]);
        if (Date.now() > until) {
          poll.status = PollStatus.stopped;
          executePollMacro();
        }
        await setSetting("currentPoll", poll);
      }
    });
    this.socket.on("noPoll", async () => {
      const poll = getSetting("currentPoll");
      if (!poll.createdAt || !poll.duration) return;
      const until = new Date(poll.createdAt).getTime() + poll.duration * 1000;
      if (until && poll.status === PollStatus.started) {
        poll.status = PollStatus.failed;
        await setSetting("currentPoll", poll);
      }
    });
    this.socket.emit("getPoll", 0);
    this.socket.on("chatMessageRecieved", (user, message) => {
      if (this.callback) this.callback(message, user);
    });
  }

  /** @param {Poll} poll
   * @returns {void | Promise<void>}
   */
  startPoll(poll) {
    this.socket.emit(
      "createPoll",
      poll.options.map((_option, index) => (index + 1).toString()),
      poll.duration ? poll.duration * 1000 : 30 * 1000,
      0,
    );
  }

  /** @returns {void} */
  disconnect() {
    this.socket.disconnect();
  }

  /** @param {ChatMessageCallback} callback
   * @returns {void}
   */
  setCallback(callback) {
    this.callback = callback;
  }
}

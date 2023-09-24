import { getSetting, setSetting, settings } from "../utils/settings.js";
import * as jose from "jose";
import { executePollMacro, PollStatus } from "../utils/polls.js";

const publicKey = {
  kty: "EC",
  x: "ASCUOC6ZJAqrAmc0gH1p1_tQB_Iw4MLdenrgsmxexcDiAUV4v7Bv6DsAvSjWpPpzbzVoVR9lxyttjB2sPeQJQhE0",
  y: "AJFSMJTGYWBYwKdUOqqUWRHK9pS-KUHb1ZN8O5qXcmOuXjVKXFno__KX-KFLA1leYKvieCwZAhgkGFUz0ihC_AHT",
  crv: "P-521",
};

/** @param {string} token
 * @returns {Promise<any>}
 */
async function verifyToken(token) {
  const jwtPublicKey = await jose.importJWK(publicKey, "ES512");
  return await jose.jwtVerify(token, jwtPublicKey);
}

/** */
export class PatreonConnector {
  /** */
  socket = undefined;
  /** @private */
  callback = undefined;
  /** @default false */
  apiOk = false;

  constructor() {
    Hooks.on("ethereal-plane.patreon-login", () => this.login());
    Hooks.on("ethereal-plane.patreon-logout", () => this.logout());
    Hooks.on("ethereal-plane.twitch-connect", () => {
      this.twitchConnect();
    });
    Hooks.on("ethereal-plane.twitch-disconnect", () => {
      this.twitchDisconnect();
    });
    Hooks.on("ethereal-plane.custom-twitch-logout", () => {
      this.twitchCustomBotLogout();
    });
    Hooks.on("ethereal-plane.custom-twitch-login", () => {
      this.twitchCustomBotLogin();
    });
    Hooks.on("ethereal-plane.youtube-connect", () => {
      this.youtubeConnect();
    });
    Hooks.on("ethereal-plane.youtube-disconnect", () => {
      this.youtubeDisconnect();
    });
    Hooks.on("ethereal-plane.set-youtube-id", (id) => {
      this.setYoutubeID(id);
    });
  }

  /** @returns {Promise<void>} */
  async init() {
    console.log("Ethereal Plane | Connecting to Patreon Server");
    const apiVersion = await (
      await fetch("https://ep.void.monster/version")
    ).text();
    if (apiVersion !== "1") {
      ui.notifications?.error(
        "Ethereal Plane API version does not match the installed Module. Please Update. Patreon Features Disabled.",
      );
      return;
    } else {
      this.apiOk = true;
    }
    console.log("Ethereal Plane | Api Version OK");
    const token = getSetting("authentication-token");
    const refreshToken = getSetting("refresh-token");
    if (token) {
      try {
        await verifyToken(token);
        console.log("Ethereal Plane | Connected to Patreon Server");
        this.socket = window.io("ep.void.monster", { auth: { token } });
      } catch (e) {
        this.refresh(refreshToken);
      }
    } else {
      this.refresh(refreshToken);
    }
    if (this.socket) {
      this.socket.on("connect", async () => {
        if (
          getSetting("enable-chat-tab") &&
          getSetting("enabled") &&
          !this.socket?.recovered
        ) {
          this.socket.emit("enable-chat");
        }
        this.socket.on("features", (features) => {
          settings.getStore("available-features")?.set(features);
        });
        this.socket.emit("features");
        this.socket.on("chat-message", (message, user) => {
          if (this.callback) this.callback(message, user);
        });
        this.socket.on("status", (status) => {
          settings.getStore("patreon-status")?.set(status);
        });
        this.socket.emit("status");
        this.socket.on("link-twitch", () => {
          console.log(
            "Ethereal Plane | Connected Twitch Account to Patreon Service",
          );
          this.socket.emit("status");
        });

        this.socket.on("unlink-twitch", () => {
          console.log(
            "Ethereal Plane | Disconnected Twitch Account from Patreon Service",
          );
          this.socket.emit("status");
        });
        this.socket.on("twitch-bot-logout", () => {
          console.log(
            "Ethereal Plane | Disconnected Custom Bot Account from Patreon Service",
          );
          this.socket.emit("status");
        });
        this.socket.on("insufficient-level", () => {
          console.error(
            "Ethereal Plane | Somehow your pledge was too low. Contact Faey about this.",
          );
        });

        // Polls
        this.socket.on("create-poll", async (id) => {
          const poll = getSetting("currentPoll");
          poll.id = id;
          await setSetting("currentPoll", poll);
        });
        this.socket.on("poll-update", async (choices) => {
          const poll = getSetting("currentPoll");
          poll.tally = choices.map((e) => e.votes);
          await setSetting("currentPoll", poll);
        });
        this.socket.on("poll-end", async (choices) => {
          const poll = getSetting("currentPoll");
          poll.tally = choices.map((e) => e.votes);
          if (poll.status === PollStatus.started) {
            poll.status = PollStatus.stopped;
            executePollMacro();
          }
          await setSetting("currentPoll", poll);
        });
        this.socket.on("poll-error", async () => {
          const poll = getSetting("currentPoll");
          poll.status = PollStatus.failed;
          await setSetting("currentPoll", poll);
        });

        // Youtube
        this.socket.on("link-youtube", () => {
          console.log(
            "Ethereal Plane | Connected Youtube Account to Patreon Service",
          );
          this.socket.emit("status");
        });
        this.socket.on("unlink-youtube", () => {
          console.log(
            "Ethereal Plane | Disconnected Youtube Account from Patreon Service",
          );
          this.socket.emit("status");
        });
        this.socket.on("youtube-error", () => {
          this.socket.emit("status");
        });
      });
    }
  }

  /** @param {string} refreshToken
   * @returns {void}
   */
  refresh(refreshToken) {
    if (!refreshToken || !this.apiOk) return;
    console.log("Ethereal Plane | Token Expired - Refreshing");
    const authSocket = window.io("ep.void.monster/auth");
    authSocket.on("connect", () => {
      console.log("refreshing with", refreshToken);
      authSocket.emit("refresh", refreshToken);
      authSocket.on("tokens", async (authToken, refreshToken) => {
        console.log("Refreshed Tokens");
        await setSetting("authentication-token", authToken);
        await setSetting("refresh-token", refreshToken);
        await this.init();
        authSocket.close();
      });
      authSocket.on("invalid-token", async () => {
        console.error("invalid-token");
        await setSetting("authentication-token", "");
        await setSetting("refresh-token", "");
        authSocket.close();
      });
      authSocket.on("patreon-error", async () => {
        console.error("patreon-error");
        await setSetting("authentication-token", "");
        await setSetting("refresh-token", "");
        authSocket.close();
      });
    });
  }

  /** @returns {void} */
  login() {
    console.warn("Login");
    const authSocket = window.io("wss://ep.void.monster/auth");
    authSocket.on("connect", () => {
      authSocket.once("login", (uri) => {
        console.info(uri);
        window.open(
          uri,
          "_blank",
          "location=yes,height=570,width=520,scrollbars=yes,status=yes",
        );
      });
      authSocket.emit("login");
      authSocket.on("tokens", async (authToken, refreshToken) => {
        console.log(authToken);
        console.log(refreshToken);
        await setSetting("authentication-token", authToken);
        await setSetting("refresh-token", refreshToken);
        await this.init();
        authSocket.close();
      });
    });
  }

  /** @returns {void} */
  disableChatListener() {
    this.socket.emit("disable-chat");
    this.chatActive = false;
  }

  /** @returns {void | Promise<void>} */
  enableChatListener() {
    this.socket.emit("enable-chat");
    this.chatActive = true;
  }

  /** @param {string} message
   * @returns {void | Promise<void>}
   */
  sendMessage(message) {
    this.socket.emit("send-message", message);
  }

  /** @param {Poll} poll
   * @returns {void | Promise<void>}
   */
  startPoll(poll) {
    const pollCreateData = {
      choices: poll.options.map((option) => option.text),
      duration: poll.duration,
      title: poll.title,
    };
    this.socket.emit("create-poll", pollCreateData);
  }

  /** @returns {void | Promise<void>} */
  disconnect() {
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }

  /** @param {ChatMessageCallback} callback
   * @returns {void | Promise<void>}
   */
  setCallback(callback) {
    this.callback = callback;
  }

  /** @returns {void} */
  abortPoll() {
    const poll = getSetting("currentPoll");
    this.socket.emit("end-poll", poll.id);
  }

  /** @private
   * @returns {void}
   */
  twitchConnect() {
    console.log("Ethereal Plane | Requesting Twitch Connection Callback");
    this.socket.once("twitch-login", (uri) => {
      window.open(
        uri,
        "_blank",
        "location=yes,height=570,width=520,scrollbars=yes,status=yes",
      );
    });
    this.socket.emit("link-twitch");
  }

  /** @private
   * @returns {void}
   */
  youtubeConnect() {
    console.log("Ethereal Plane | Requesting Twitch Connection Callback");
    this.socket.once("youtube-login", (uri) => {
      window.open(
        uri,
        "_blank",
        "location=yes,height=570,width=520,scrollbars=yes,status=yes",
      );
    });
    this.socket.emit("link-youtube");
  }

  /** @private
   * @returns {void}
   */
  twitchDisconnect() {
    console.log(
      "Ethereal Plane | Disconnecting Twitch Account from Patreon Service",
    );
    this.socket.emit("unlink-twitch");
  }

  /** @private
   * @returns {void}
   */
  youtubeDisconnect() {
    console.log(
      "Ethereal Plane | Disconnecting Twitch Account from Patreon Service",
    );
    this.socket.emit("unlink-youtube");
  }

  /** @private
   * @returns {void}
   */
  twitchCustomBotLogin() {
    console.log("Ethereal Plane | Logging into Custom Bot Acount");
    this.socket.once("twitch-login", (uri) => {
      window.open(
        uri,
        "_blank",
        "location=yes,height=570,width=520,scrollbars=yes,status=yes",
      );
    });
    this.socket.emit("twitch-bot-login");
  }

  /** @private
   * @returns {void}
   */
  twitchCustomBotLogout() {
    this.socket.emit("twitch-bot-logout");
  }

  /** @private
   * @returns {Promise<void>}
   */
  async logout() {
    this.disconnect();
    await setSetting("refresh-token", "");
    await setSetting("authentication-token", "");
  }

  /** @private
   * @param {string} id
   * @returns {void}
   */
  setYoutubeID(id) {
    this.socket.emit("youtube-stream-id", id);
  }
}

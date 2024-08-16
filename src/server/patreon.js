import { getSetting, setSetting } from "../utils/settings.js";
import { executePollMacro, PollStatus } from "../utils/polls.js";
import {
  disableChatListeners,
  disconnectChatAPI,
  enableChatListeners,
  initChatAPI,
  sendChatMessage,
  setYoutubeId,
} from "./chat_api.js";
import { PATREON_URL } from "../utils/const.js";
import {
  connectClient,
  disconnectClient,
  patreonLogin,
  refresh,
  waitForPatreonVerification,
} from "./patreon_auth.js";
import {
  abortPoll,
  createPoll,
  disconnectPollAPI,
  initPollAPI,
} from "./poll_api.js";

export class PatreonConnector {
  /**
   * @type {ChatMessageCallback}
   */
  callback;

  constructor() {
    Hooks.on("ethereal-plane.patreon-login", () => this.login());
    Hooks.on("ethereal-plane.patreon-logout", () => this.logout());
    Hooks.on("ethereal-plane.patreon-connect", () => this.connect());
    Hooks.on("ethereal-plane.patreon-disconnect", () => this.deleteClient());
    Hooks.on("ethereal-plane.set-youtube-id", (id) => {
      this.setYoutubeID(id);
    });
  }

  connect() {
    connectClient().then();
  }

  /** @returns {Promise<void>} */
  async init() {
    console.log("Ethereal Plane | Connecting to Patreon Server");
    const apiVersion = await (
      await fetch("https://localhost:7242/version")
    ).text();
    if (apiVersion !== "2") {
      ui.notifications?.error(
        "Ethereal Plane API version does not match the installed Module. Please Update. Patreon Features Disabled.",
      );
      return;
    }
    console.log("Ethereal Plane | Api Version OK");

    const clientConnected = foundry.utils.fetchWithTimeout(
      `${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
    );

    if (!clientConnected) {
      console.log("Ethereal Plane | No client connected, please connect");
      ui.notifications?.warn("Please log in to use Ethereal Plane");
      return;
    }
    console.log("Ethereal Plane | Client OK");

    const token = getSetting("authentication-token");
    const refreshToken = getSetting("refresh-token");

    if (token === "" || refreshToken === "") {
      console.log("No credentials present, please log in");
      ui.notifications?.warn("Please log in to use Ethereal Plane");
      return;
    }

    try {
      await initChatAPI(
        token,
        this.getHandleChatMessageReceived(),
        PATREON_URL,
      );
      await initPollAPI(token, this.getPollUpdateCallback(), PATREON_URL);
    } catch {
      let tokens = await refresh(refreshToken);
      await setSetting("authentication-token", tokens.access_token);
      await setSetting("refresh-token", tokens.refresh_token);

      await initChatAPI(
        tokens.access_token,
        this.getHandleChatMessageReceived(),
        PATREON_URL,
      );
      await initPollAPI(
        tokens.access_token,
        this.getPollUpdateCallback(),
        PATREON_URL,
      );
    }
    console.log("Ethereal Plane | Connected");
  }

  getHandleChatMessageReceived() {
    return (message) => {
      this.callback(
        message.messageContent,
        message.displayName,
        message.isMember,
      );
    };
  }

  getPollUpdateCallback() {
    return async (pollUpdate) => {
      /**
       * @type {Poll}
       */
      const poll = getSetting("currentPoll");
      let wasRunning = false;
      if (poll.status === PollStatus.started) {
        wasRunning = true;
      }
      poll.status = pollUpdate.aborted
        ? PollStatus.failed
        : pollUpdate.finalized
          ? PollStatus.stopped
          : PollStatus.started;
      poll.tally = pollUpdate.options.map((entry) => {
        return entry.count;
      });
      if (wasRunning && poll.status === PollStatus.stopped) {
        executePollMacro();
      }
      await setSetting("currentPoll", poll);
    };
  }

  /** @returns {void} */
  async login() {
    console.warn("Login");
    const { device_code, verification_uri_complete: uri } =
      await patreonLogin();
    console.info(uri);
    window.open(
      uri,
      "_blank",
      "location=yes,height=570,width=520,scrollbars=yes,status=yes",
    );
    const { access_token, refresh_token } =
      await waitForPatreonVerification(device_code);
    await setSetting("authentication-token", access_token);
    await setSetting("refresh-token", refresh_token);
    await this.init();
  }

  /** @returns {void} */
  async disableChatListener() {
    await disableChatListeners();
  }

  /** @returns {Promise<void>} */
  async enableChatListener() {
    await enableChatListeners();
  }

  /** @param {string} message
   * @returns {void | Promise<void>}
   */
  async sendMessage(message) {
    await sendChatMessage(message);
  }

  /** @param {Poll} poll
   * @returns {void | Promise<void>}
   */
  async startPoll(poll) {
    const pollId = await createPoll(
      poll.duration * 1000,
      poll.options.map((option) => {
        return { name: option.text, title: option.text };
      }),
      "!vote",
      poll.title,
    );
    const currentPoll = getSetting("currentPoll");
    currentPoll.id = pollId;
    await setSetting("currentPoll", poll);
  }

  /** @returns {void | Promise<void>} */
  async disconnect() {
    await disconnectPollAPI();
    await disconnectChatAPI();
  }

  /** @param {ChatMessageCallback} callback
   * @returns {void | Promise<void>}
   */
  setCallback(callback) {
    this.callback = callback;
  }

  /** @returns {void} */
  async abortPoll() {
    const poll = getSetting("currentPoll");
    await abortPoll(poll.id);
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
  async setYoutubeID(id) {
    await setYoutubeId(id);
  }

  async deleteClient() {
    await disconnectClient();
  }
}

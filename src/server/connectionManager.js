import { getSetting, settings } from "../utils/settings.js";
import { Modes } from "../utils/const.js";
import { PatreonConnector } from "./patreon.js";
import { LocalServer } from "./localserver.js";
import { chatMessages } from "../svelte/stores/chatMessages.js";
import { get } from "svelte/store";
import { processChat } from "../utils/chatCommands.js";

/** */
class ConnectionManager {
  /** @private */
  currentMode = undefined;
  /** @private */
  chatConnector = undefined;
  /** @private */
  pollConnector = undefined;
  /** @private */
  messageListeners = undefined;

  constructor() {
    settings.getStore("mode")?.subscribe((mode) => {
      this.onChangeMode(mode);
    });
    this.messageListeners = [];
    this.messageListeners.push((message, user) => {
      chatMessages.set([...get(chatMessages), [user, message]]);
    });
    this.messageListeners.push(processChat);
  }

  /** @param {(message: string, user: string) => void} listener
   * @returns {void}
   */
  addMessageListener(listener) {
    this.messageListeners.push(listener);
  }

  /** @param {(message: string, user: string) => void} listener
   * @returns {void}
   */
  removeMessageListener(listener) {
    const index = this.messageListeners.indexOf(listener);
    this.messageListeners = this.messageListeners.splice(index, 1);
  }

  /**
   * @default (message: string, user: string) => {
   *     this.messageListeners.forEach((listener) => {
   *       listener(message, user);
   *     });
   *   }
   */
  handleMessages = (message, user) => {
    this.messageListeners.forEach((listener) => {
      listener(message, user);
    });
  };

  /** @param {string} message
   * @returns {void}
   */
  sendMessage(message) {
    this.chatConnector.sendMessage(message);
  }

  /** @param {Poll} poll
   * @returns {void}
   */
  createPoll(poll) {
    this.pollConnector.startPoll(poll);
  }

  /** @returns {void} */
  abortPoll() {
    this.pollConnector.abortPoll();
  }

  /** @private
   * @param {Modes} mode
   * @returns {Promise<void>}
   */
  async onChangeMode(mode) {
    console.log(
      "Ethereal Plane | Starting connection manager in " + mode + " mode.",
    );
    if (this.currentMode) {
      if (this.currentMode !== mode) {
        if (this.currentMode === Modes.localchat) {
          if (mode === Modes.patreon) {
            this.chatConnector.disconnect();
            this.chatConnector = this.pollConnector;
            this.chatConnector.setCallback(this.handleMessages);
          } else {
            this.pollConnector.disconnect();
            this.pollConnector = this.chatConnector;
          }
        } else if (this.currentMode === Modes.patreon) {
          this.chatConnector = new LocalServer();
          await this.chatConnector.init();
          if (mode === Modes.localonly) {
            this.pollConnector.disconnect();
            this.pollConnector = this.chatConnector;
          }
        } else {
          this.pollConnector = new PatreonConnector();
          await this.pollConnector.init();
          if (mode === Modes.patreon) {
            this.chatConnector.disconnect();
            this.chatConnector = this.pollConnector;
          }
        }
      }
    } else {
      if (mode === Modes.patreon) {
        const patreon = new PatreonConnector();
        this.chatConnector = patreon;
        this.pollConnector = patreon;
        await this.pollConnector.init();
      } else if (mode === Modes.localonly) {
        const local = new LocalServer();
        this.chatConnector = local;
        this.pollConnector = local;
        await this.pollConnector.init();
      } else {
        if (
          this.chatConnector instanceof PatreonConnector ||
          !this.chatConnector
        ) {
          this.chatConnector = new LocalServer();
          await this.chatConnector.init();
        }
        if (this.pollConnector instanceof LocalServer || !this.pollConnector) {
          this.pollConnector = new PatreonConnector();
          await this.pollConnector.init();
        }
      }
    }
    this.chatConnector.setCallback(this.handleMessages);
    this.currentMode = mode;
    try {
      if (
        (getSetting("enable-chat-tab") || getSetting("")) &&
        getSetting("enabled")
      ) {
        console.log("Enable Chat Listener");
        this.chatConnector.enableChatListener();
      } else {
        this.chatConnector.disableChatListener();
      }
    } catch (e) {
      console.log(e);
    }
  }
}

let connectionManager;

/** @returns {ConnectionManager} */
export function getConnectionManager() {
  if (connectionManager) return connectionManager;
  connectionManager = new ConnectionManager();
  return connectionManager;
}

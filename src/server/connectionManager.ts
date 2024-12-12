import { getSetting, settings } from "../utils/settings";
import { Modes } from "../utils/const";
import { PatreonConnector } from "./patreon";
import { LocalServer } from "./localserver";
import { chatMessages } from "../svelte/stores/chatMessages";
import { processChat } from "../utils/chatCommands.js";
import { ChatConnector, ChatMessageCallback } from "./chatConnector";
import { PollConnector } from "./pollConnector";
import { Poll } from "../utils/polls";

class ConnectionManager {
  /** @private */
  currentMode = undefined;
  private chatConnector?: ChatConnector;
  private pollConnector?: PollConnector;

  messageListeners: ChatMessageCallback[] = [];
  /** @private */

  messageDeletionListeners: ((id: string) => void)[] = [];

  constructor() {
    settings.getStore("mode")?.subscribe((mode) => {
      this.onChangeMode(mode);
    });
    this.messageListeners.push((message, user, subscribed, id) => {
      chatMessages.update((messages) => {
        messages.push({ user, message, id });
        return messages;
      });
    });
    this.messageListeners.push(processChat);
    this.messageDeletionListeners.push((id) => {
      chatMessages.update((messages) => {
        return messages.filter((message) => message.id !== id);
      });
    });
  }

  handleMessages: ChatMessageCallback = async (
    message,
    user,
    subscribed,
    id,
  ) => {
    this.messageListeners.forEach((listener) => {
      listener(message, user, subscribed, id);
    });
  };

  sendMessage(message: string): void {
    this.chatConnector.sendMessage(message);
  }

  createPoll(poll: Poll): void {
    this.pollConnector.startPoll(poll);
  }

  abortPoll(): void {
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
            this.chatConnector = this.pollConnector as PatreonConnector;
            this.chatConnector.setCallback(this.handleMessages);
          } else {
            this.pollConnector.disconnect();
            this.pollConnector = this.chatConnector as LocalServer;
          }
        } else if (this.currentMode === Modes.patreon) {
          this.chatConnector = new LocalServer();
          await this.chatConnector.init();
          if (mode === Modes.localonly) {
            this.pollConnector.disconnect();
            this.pollConnector = this.chatConnector as LocalServer;
          }
        } else {
          this.pollConnector = new PatreonConnector();
          await this.pollConnector.init();
          if (mode === Modes.patreon) {
            this.chatConnector.disconnect();
            this.chatConnector = this.pollConnector as LocalServer;
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
      if (getSetting("enable-chat-tab") && getSetting("enabled")) {
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

let connectionManager: ConnectionManager | undefined;

export function getConnectionManager(): ConnectionManager {
  if (connectionManager) return connectionManager;
  connectionManager = new ConnectionManager();
  return connectionManager;
}

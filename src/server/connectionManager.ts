import { getSetting, settings } from "../utils/settings.js";
import { Modes } from "../utils/const.js";
import { PatreonConnector } from "./patreon.js";
import { LocalServer } from "./localserver.js";
import { chatMessages } from "../svelte/stores/chatMessages.js";
import { processChat } from "../utils/chatCommands.js";
import {
  ChatConnector,
  ChatDeletionCallback,
  ChatMessageCallback,
} from "./chatConnector.js";
import { PollConnector } from "./pollConnector.js";
import { Poll } from "../utils/polls.js";
import { localize } from "@typhonjs-fvtt/runtime/util/i18n";

class ConnectionManager {
  private currentMode: Modes | undefined;
  private chatConnector?: ChatConnector;
  private pollConnector?: PollConnector;

  messageListeners: ChatMessageCallback[] = [];
  /** @private */

  messageDeletionListeners: ((id: string) => void)[] = [];

  constructor() {
    Hooks.on("ethereal-plane.reconnect", () => this.reconnect());
    settings.getStore("mode")?.subscribe((mode: Modes) => {
      this.onChangeMode(mode).then();
    });
    this.messageListeners.push(
      (message: string, user: string, _subscribed: boolean, id: string) => {
        chatMessages.update(
          (messages: { user: string; message: string; id: string }[]) => {
            messages.push({ user, message, id });
            return messages;
          },
        );
      },
    );
    this.messageListeners.push(processChat);
    this.messageDeletionListeners.push((id) => {
      chatMessages.update((messages) => {
        return messages.filter((message) => message.id !== id);
      });
    });
  }

  async reconnect() {
    ui.notifications?.warn(
      `${localize("ethereal-plane.strings.notification-prefix")}${localize("ethereal-plane.notifications.reconnecting")}`,
    );
    await this.chatConnector?.disconnect();
    await this.pollConnector?.disconnect();
    this.currentMode = undefined;
    await this.onChangeMode(getSetting("mode"));
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

  handleMessageDeletion: ChatDeletionCallback = async (id: string) => {
    this.messageDeletionListeners.forEach((listener) => {
      listener(id);
    });
  };

  sendMessage(message: string): void {
    this.chatConnector?.sendMessage(message);
  }

  createPoll(poll: Poll): void {
    this.pollConnector?.startPoll(poll);
  }

  abortPoll(): void {
    this.pollConnector?.abortPoll();
  }

  async onChangeMode(mode: Modes) {
    console.log(
      "Ethereal Plane | Starting connection manager in " + mode + " mode.",
    );
    if (this.currentMode) {
      if (this.currentMode !== mode) {
        if (this.currentMode === Modes.localchat) {
          if (mode === Modes.patreon) {
            this.chatConnector?.disconnect();
            this.chatConnector = this.pollConnector as PatreonConnector;
            this.chatConnector.setCallback(this.handleMessages);
            this.chatConnector.setDeletionCallback(this.handleMessageDeletion);
          } else {
            this.pollConnector?.disconnect();
            this.pollConnector = this.chatConnector as LocalServer;
          }
        } else if (this.currentMode === Modes.patreon) {
          this.chatConnector = new LocalServer();
          await this.chatConnector.init();
          if (mode === Modes.localonly) {
            this.pollConnector?.disconnect();
            this.pollConnector = this.chatConnector as LocalServer;
          }
        } else {
          this.pollConnector = new PatreonConnector();
          await this.pollConnector.init();
          if (mode === Modes.patreon) {
            this.chatConnector?.disconnect();
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
    this.chatConnector?.setCallback(this.handleMessages);
    this.chatConnector?.setDeletionCallback(this.handleMessageDeletion);
    this.currentMode = mode;
    try {
      if (getSetting("enable-chat-tab") && getSetting("enabled")) {
        console.log("Enable Chat Listener");
        this.chatConnector?.enableChatListener();
      } else {
        this.chatConnector?.disableChatListener();
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

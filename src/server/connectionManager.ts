import { getSetting, settings } from '../utils/settings.js';
import { Modes } from '../utils/const.js';
import type { ChatConnector } from './chatConnector.js';
import type { PollConnector } from './pollConnector.js';
import { PatreonConnector } from './patreon.js';
import { LocalServer } from './localserver.js';
import type { Poll } from '../utils/polls.js';
import { chatMessages } from '../svelte/stores/chatMessages.js';
import { get } from 'svelte/store';
import { processChat } from '../utils/chatCommands.js';

class ConnectionManager {
  private currentMode?: Modes;
  private chatConnector!: ChatConnector;
  private pollConnector!: PollConnector;
  private messageListeners: Array<(message: string, user: string) => void>;

  constructor() {
    settings.getStore('mode')?.subscribe((mode) => {
      this.onChangeMode(mode);
    });
    this.messageListeners = new Array<(message: string, user: string) => void>();
    this.messageListeners.push((message, user) => {
      chatMessages.set([...get(chatMessages), [user, message]]);
    });
    this.messageListeners.push(processChat);
  }

  addMessageListener(listener: (message: string, user: string) => void) {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener: (message: string, user: string) => void) {
    const index = this.messageListeners.indexOf(listener);
    this.messageListeners = this.messageListeners.splice(index, 1);
  }

  handleMessages = (message: string, user: string) => {
    this.messageListeners.forEach((listener) => {
      listener(message, user);
    });
  };

  sendMessage(message: string) {
    this.chatConnector.sendMessage(message);
  }

  createPoll(poll: Poll) {
    this.pollConnector.startPoll(poll);
  }

  abortPoll() {
    this.pollConnector.abortPoll();
  }

  private async onChangeMode(mode: Modes) {
    console.log('Ethereal Plane | Starting connection manager in ' + mode + ' mode.');
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
            this.chatConnector = this.pollConnector as PatreonConnector;
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
        if (this.chatConnector instanceof PatreonConnector || !this.chatConnector) {
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
      if (getSetting('enable-chat-tab') && getSetting('enabled')) {
        console.log('Enable Chat Listener');
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

export function getConnectionManager() {
  if (connectionManager) return connectionManager;
  connectionManager = new ConnectionManager();
  return connectionManager;
}

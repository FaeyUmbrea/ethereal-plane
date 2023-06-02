import { settings } from '../utils/settings.js';
import { Modes } from '../utils/const.js';
import type { ChatConnector } from './chatConnector.js';
import type { PollConnector } from './pollConnector.js';
import { PatreonConnector } from './patreon.js';
import { LocalServer } from './localserver.js';

class ConnectionManager {
  private currentMode?: Modes;
  private chatConnector: ChatConnector;
  private pollConnector: PollConnector;

  constructor() {
    settings.getStore('mode')?.subscribe((mode) => {
      this.onChangeMode(mode);
    });
  }

  sendMessage(message) {
    this.chatConnector.sendMessage(message);
  }

  abortPoll() {
    this.pollConnector.abortPoll();
  }

  private onChangeMode(mode: Modes) {
    console.log('Ethereal Plane | Starting connection manager in ' + mode + ' mode.');
    if (this.currentMode && this.currentMode !== mode) {
      if (mode !== Modes.localchat && this.currentMode === Modes.localchat) {
        if (mode === Modes.patreon) this.chatConnector.disconnect();
        else this.pollConnector.disconnect();
      } else {
        this.chatConnector.disconnect();
        this.pollConnector.disconnect();
      }
    }
    if (mode === Modes.patreon) {
      const patreon = new PatreonConnector();
      this.chatConnector = patreon;
      this.pollConnector = patreon;
      this.pollConnector.init();
    } else if (mode === Modes.localonly) {
      const local = new LocalServer();
      this.chatConnector = local;
      this.pollConnector = local;
      this.pollConnector.init();
    } else {
      if (this.chatConnector instanceof PatreonConnector || !this.chatConnector) {
        this.chatConnector = new LocalServer();
        this.chatConnector.init();
      }
      if (this.pollConnector instanceof LocalServer || !this.pollConnector) {
        this.pollConnector = new PatreonConnector();
        this.pollConnector.init();
      }
    }
    this.currentMode = mode;
  }
}

let connectionManager: ConnectionManager | undefined;

export function getConnectionManager() {
  if (connectionManager) return connectionManager;
  connectionManager = new ConnectionManager();
  return connectionManager;
}

import { getSetting, setSetting, settings } from '../utils/settings.ts';
import * as jose from 'jose';
import type { ChatConnector, ChatMessageCallback } from './chatConnector.ts';
import type { Poll } from '../utils/polls.js';
import type { PollConnector } from './pollConnector.js';

const publicKey = {
  kty: 'EC',
  x: 'ASCUOC6ZJAqrAmc0gH1p1_tQB_Iw4MLdenrgsmxexcDiAUV4v7Bv6DsAvSjWpPpzbzVoVR9lxyttjB2sPeQJQhE0',
  y: 'AJFSMJTGYWBYwKdUOqqUWRHK9pS-KUHb1ZN8O5qXcmOuXjVKXFno__KX-KFLA1leYKvieCwZAhgkGFUz0ihC_AHT',
  crv: 'P-521'
};

async function verifyToken(token) {
  const jwtPublicKey = await jose.importJWK(publicKey, 'ES512');
  return await jose.jwtVerify(token, jwtPublicKey);
}

export class PatreonConnector implements ChatConnector, PollConnector {
  socket: ReturnType<typeof window.io>;
  private callback?: ChatMessageCallback;

  constructor() {
    Hooks.on('ethereal-plane.patreon-login', () => this.login());
  }

  async init() {
    const token = getSetting('authentication-token');
    const refreshToken = getSetting('refresh-token');
    if (token) {
      try {
        await verifyToken(token);
        this.socket = window.io('ep.void.monster', { auth: { token } });
      } catch (e) {
        this.refresh(refreshToken);
      }
    } else {
      this.refresh(refreshToken);
    }
    if (this.socket) {
      this.socket.on('connect', () => {
        this.socket.on('features', (features: string[]) => {
          settings.getStore('available-features')?.set(features);
        });
        this.socket.emit('features');
        this.socket.on('chat-message', (message: string, user: string) => {
          if (this.callback) this.callback(message, user);
        });
      });
    }
  }

  refresh(refreshToken: string) {
    if (!refreshToken) return;
    const authSocket = window.io('ep.void.monster/auth');
    authSocket.on('connect', () => {
      console.log('refreshing with', refreshToken);
      authSocket.emit('refresh', refreshToken);
      authSocket.on('tokens', async (authToken, refreshToken) => {
        console.log('Refreshed Tokens');
        await setSetting('authentication-token', authToken);
        await setSetting('refresh-token', refreshToken);
        await this.init();
        authSocket.close();
      });
      authSocket.on('invalid-token', async () => {
        console.error('invalid-token');
        await setSetting('authentication-token', '');
        await setSetting('refresh-token', '');
        authSocket.close();
      });
      authSocket.on('patreon-error', async () => {
        console.error('patreon-error');
        await setSetting('authentication-token', false);
        await setSetting('refresh-token', '');
        authSocket.close();
      });
    });
  }

  login() {
    const authSocket = window.io('wss://ep.void.monster/auth');
    authSocket.on('connect', () => {
      authSocket.on('login', (uri) => {
        console.info(uri);
        window.open(uri, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
      });
      authSocket.emit('login');
      authSocket.on('tokens', async (authToken, refreshToken) => {
        console.log(authToken);
        console.log(refreshToken);
        await setSetting('authentication-token', authToken);
        await setSetting('refresh-token', refreshToken);
        await this.init();
        authSocket.close();
      });
    });
  }

  disableChatListener() {
    this.socket.emit('enable-chat');
  }

  enableChatListener(): void | Promise<void> {
    this.socket.emit('disable-chat');
  }

  sendMessage(message: string): void | Promise<void> {
    this.socket.emit('send-message', message);
  }

  startPoll(poll: Poll): void | Promise<void> {
    const pollCreateData = {
      choices: poll.options.map((option) => option.text),
      duration: poll.duration,
      title: poll.title
    };
    this.socket.emit('create-poll', pollCreateData);
  }

  disconnect(): void | Promise<void> {
    this.socket.disconnect();
  }

  setCallback(callback: ChatMessageCallback): void | Promise<void> {
    this.callback = callback;
  }

  abortPoll(): number | Promise<number> {
    const until = getSetting('currentPoll').until();
    return until ? until : 0;
  }
}

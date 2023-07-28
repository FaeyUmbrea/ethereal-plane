import { getSetting, setSetting, settings } from '../utils/settings.ts';
import * as jose from 'jose';
import type { ChatConnector, ChatMessageCallback } from './chatConnector.ts';
import type { Poll } from '../utils/polls.js';
import { executePollMacro, PollStatus } from '../utils/polls.js';
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
  apiOk = false;

  constructor() {
    Hooks.on('ethereal-plane.patreon-login', () => this.login());
    Hooks.on('ethereal-plane.patreon-logout', () => this.logout());
    Hooks.on('ethereal-plane.twitch-connect', () => {
      this.twitchConnect();
    });
    Hooks.on('ethereal-plane.twitch-disconnect', () => {
      this.twitchDisconnect();
    });
    Hooks.on('ethereal-plane.custom-twitch-logout', () => {
      this.twitchCustomBotLogout();
    });
    Hooks.on('ethereal-plane.custom-twitch-login', () => {
      this.twitchCustomBotLogin();
    });
    Hooks.on('ethereal-plane.youtube-connect', () => {
      this.youtubeConnect();
    });
    Hooks.on('ethereal-plane.youtube-disconnect', () => {
      this.youtubeDisconnect();
    });
    Hooks.on('ethereal-plane.set-youtube-id', (id: string) => {
      this.setYoutubeID(id);
    });
  }

  async init() {
    console.log('Ethereal Plane | Connecting to Patreon Server');
    const apiVersion = await (await fetch('https://ep.void.monster/version')).text();
    if (apiVersion !== '1') {
      ui.notifications?.error(
        'Ethereal Plane API version does not match the installed Module. Please Update. Patreon Features Disabled.'
      );
      return;
    } else {
      this.apiOk = true;
    }
    console.log('Ethereal Plane | Api Version OK');
    const token = getSetting('authentication-token');
    const refreshToken = getSetting('refresh-token');
    if (token) {
      try {
        await verifyToken(token);
        console.log('Ethereal Plane | Connected to Patreon Server');
        this.socket = window.io('ep.void.monster', { auth: { token } });
      } catch (e) {
        this.refresh(refreshToken);
      }
    } else {
      this.refresh(refreshToken);
    }
    if (this.socket) {
      this.socket.on('connect', async () => {
        this.socket.on('features', (features: string[]) => {
          settings.getStore('available-features')?.set(features);
        });
        this.socket.emit('features');
        this.socket.on('chat-message', (message: string, user: string) => {
          if (this.callback) this.callback(message, user);
        });
        this.socket.on('status', (status: string[]) => {
          settings.getStore('patreon-status')?.set(status);
        });
        this.socket.emit('status');
        this.socket.on('link-twitch', () => {
          console.log('Ethereal Plane | Connected Twitch Account to Patreon Service');
          this.socket.emit('status');
        });

        this.socket.on('unlink-twitch', () => {
          console.log('Ethereal Plane | Disconnected Twitch Account from Patreon Service');
          this.socket.emit('status');
        });
        this.socket.on('twitch-bot-logout', () => {
          console.log('Ethereal Plane | Disconnected Custom Bot Account from Patreon Service');
          this.socket.emit('status');
        });
        this.socket.on('insufficient-level', () => {
          console.error('Ethereal Plane | Somehow your pledge was too low. Contact Faey about this.');
        });

        // Polls
        this.socket.on('create-poll', async (id: string) => {
          const poll = getSetting('currentPoll');
          poll.id = id;
          await setSetting('currentPoll', poll);
        });
        this.socket.on(
          'poll-update',
          async (
            choices: {
              votes: number;
              bits_votes: number;
              channel_points_votes: number;
            }[],
          ) => {
            const poll = getSetting('currentPoll');
            poll.tally = choices.map((e) => e.votes);
            await setSetting('currentPoll', poll);
          },
        );
        this.socket.on(
          'poll-end',
          async (
            choices: {
              votes: number;
              bits_votes: number;
              channel_points_votes: number;
            }[],
          ) => {
            const poll = getSetting('currentPoll');
            poll.tally = choices.map((e) => e.votes);
            if (poll.status == PollStatus.started) {
              poll.status = PollStatus.stopped;
              executePollMacro();
            }
            await setSetting('currentPoll', poll);
          },
        );
        this.socket.on('poll-error', async () => {
          const poll = getSetting('currentPoll');
          poll.status = PollStatus.failed;
          await setSetting('currentPoll', poll);
        });

        // Youtube
        this.socket.on('link-youtube', () => {
          console.log('Ethereal Plane | Connected Youtube Account to Patreon Service');
          this.socket.emit('status');
        });
        this.socket.on('unlink-youtube', () => {
          console.log('Ethereal Plane | Disconnected Youtube Account from Patreon Service');
          this.socket.emit('status');
        });
        this.socket.on('youtube-error', () => {
          this.socket.emit('status');
        });
      });
    }
  }

  refresh(refreshToken: string) {
    if (!refreshToken || !this.apiOk) return;
    console.log('Ethereal Plane | Token Expired - Refreshing');
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
        await setSetting('authentication-token', '');
        await setSetting('refresh-token', '');
        authSocket.close();
      });
    });
  }

  login() {
    console.warn('Login');
    const authSocket = window.io('wss://ep.void.monster/auth');
    authSocket.on('connect', () => {
      authSocket.once('login', (uri) => {
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
    this.socket.emit('disable-chat');
  }

  enableChatListener(): void | Promise<void> {
    this.socket.emit('enable-chat');
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
    this.socket.removeAllListeners();
  }

  setCallback(callback: ChatMessageCallback): void | Promise<void> {
    this.callback = callback;
  }

  abortPoll() {
    const poll = getSetting('currentPoll');
    this.socket.emit('end-poll', poll.id);
  }

  private twitchConnect() {
    console.log('Ethereal Plane | Requesting Twitch Connection Callback');
    this.socket.once('twitch-login', (uri) => {
      window.open(uri, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
    this.socket.emit('link-twitch');
  }

  private youtubeConnect() {
    console.log('Ethereal Plane | Requesting Twitch Connection Callback');
    this.socket.once('youtube-login', (uri) => {
      window.open(uri, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
    this.socket.emit('link-youtube');
  }

  private twitchDisconnect() {
    console.log('Ethereal Plane | Disconnecting Twitch Account from Patreon Service');
    this.socket.emit('unlink-twitch');
  }

  private youtubeDisconnect() {
    console.log('Ethereal Plane | Disconnecting Twitch Account from Patreon Service');
    this.socket.emit('unlink-youtube');
  }

  private twitchCustomBotLogin() {
    console.log('Ethereal Plane | Logging into Custom Bot Acount');
    this.socket.once('twitch-login', (uri) => {
      window.open(uri, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
    this.socket.emit('twitch-bot-login');
  }

  private twitchCustomBotLogout() {
    this.socket.emit('twitch-bot-logout');
  }

  private async logout() {
    this.disconnect();
    await setSetting('refresh-token', '');
    await setSetting('authentication-token', '');
  }

  private setYoutubeID(id: string) {
    this.socket.emit('youtube-stream-id', id);
  }
}

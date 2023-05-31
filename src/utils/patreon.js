import { getSetting, setSetting } from './settings.js';
import * as jose from 'jose';

const publicKey = {
  kty: 'EC',
  x: 'ASCUOC6ZJAqrAmc0gH1p1_tQB_Iw4MLdenrgsmxexcDiAUV4v7Bv6DsAvSjWpPpzbzVoVR9lxyttjB2sPeQJQhE0',
  y: 'AJFSMJTGYWBYwKdUOqqUWRHK9pS-KUHb1ZN8O5qXcmOuXjVKXFno__KX-KFLA1leYKvieCwZAhgkGFUz0ihC_AHT',
  crv: 'P-521',
};

async function verifyToken(token) {
  const jwtPublicKey = await jose.importJWK(publicKey, 'ES512');
  return await jose.jwtVerify(token, jwtPublicKey);
}

class PatreonConnector {
  /**@type {import('socket.io').Socket} */
  socket;

  async init() {
    const token = getSetting('authentication-token');
    if (token) {
      try {
        await verifyToken(token);
        this.socket = window.io('ep.void.monster', { auth: { token } });
      } catch (e) {
        const authSocket = window.io('ep.void.monster/auth');
        authSocket.on('connect', () => {
          authSocket.emit('refresh', getSetting('refresh-token'));
          authSocket.on('tokens', async (authToken, refreshToken) => {
            console.log('Refreshed Tokens');
            await setSetting('authentication-token', authToken);
            await setSetting('refresh-token', refreshToken);
            authSocket.close();
          });
          authSocket.on('invalid-token', () => {
            setSetting('authentication-token', false);
            authSocket.close();
          });
          authSocket.on('patreon-error', () => {
            setSetting('authentication-token', false);
            authSocket.close();
          });
        });
        this.socket = window.io('ep.void.monster', { auth: { token } });
      }
    }
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
        authSocket.close();
      });
    });
  }
}

export const patreon = new PatreonConnector();

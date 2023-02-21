import type { Client } from 'socket.io/dist/client';

declare global {
    namespace ClientSettings {
        interface Values {
          "ethereal-plane.server-url": string;
          "ethereal-plane.enabled": boolean;
        }
    }
}
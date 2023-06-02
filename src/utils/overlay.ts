import PollOverlay from '../svelte/PollOverlay.svelte';

import '../css/overlay.scss';
import { getGame } from './helpers.js';

export async function registerOverlay() {
  getGame().modules.get('obs-utils').api.registerUniqueOverlay(PollOverlay);
}
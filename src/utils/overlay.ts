import PollOverlay from '../svelte/overlays/PollOverlay.svelte';
import { getGame } from './helpers.js';
import '../css/overlay.styl';

export async function registerOverlay() {
	(getGame()?.modules?.get('obs-utils')?.api as obsAPI)?.registerUniqueOverlay(PollOverlay);
}

import PollOverlay from '../svelte/overlays/PollOverlay.svelte';
import { getGame } from './helpers.js';
import '../css/overlay.scss';

export async function registerOverlay() {
	(getGame()?.modules?.get('obs-utils')?.api as obsAPI)?.registerUniqueOverlay(PollOverlay);
}

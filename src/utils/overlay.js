import PollOverlay from "../svelte/overlays/PollOverlay.svelte";

import "../css/overlay.styl";
import { getGame } from "./helpers.js";

/** @returns {Promise<void>} */
export async function registerOverlay() {
  getGame().modules.get("obs-utils").api.registerUniqueOverlay(PollOverlay);
}

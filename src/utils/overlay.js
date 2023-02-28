import PollOverlay from "../svelte/PollOverlay.svelte";

import "../css/overlay.scss"

export async function registerOverlay() {
    game.modules.get("obs-utils").api.registerUniqueOverlay(PollOverlay);
}


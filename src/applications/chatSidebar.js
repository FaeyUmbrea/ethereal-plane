import {SvelteApplication} from '@typhonjs-fvtt/runtime/svelte/application';
import {SvelteSidebarTab} from "./SvelteSidebarTab.js";
import PollApplicationUi from "../svelte/PollApplicationUI.svelte";
export class ChatSidebar extends SvelteSidebarTab{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "epchat",
            svelte: {
                class: PollApplicationUi,
                target: document.body,
                intro: true,
            }
        })
    }
}
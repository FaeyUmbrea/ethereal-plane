import {SvelteSidebarTab} from "./SvelteSidebarTab.js";
import ChatTab from "../svelte/ChatTab.svelte";

export class ChatSidebar extends SvelteSidebarTab {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "epchat",
            headerButtonNoClose: true,
            resizable: false,
            minimizable: true,
            popOut: false,
            height: 'auto',
            positionOrtho: false,
            transformOrigin: null,
            zIndex: 95,
            svelte: {
                class: ChatTab,
                intro: true,
            }
        })
    }
}
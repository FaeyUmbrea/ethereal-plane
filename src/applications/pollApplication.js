import PollApplicationUi from '../svelte/PollApplicationUI.svelte';
import {SvelteApplication} from '@typhonjs-fvtt/runtime/svelte/application';

const PLAIN_TEMPLATE = "modules/ethereal-plane/templates/apps.hbs"

export default class PollApplication extends SvelteApplication {
    /**
     * @type {import("../utils/server").Server}
     */
    static server;
    /**
     * @type {SceneControlTool}
     */
    sidebarButton;

    /**
     *
     * @param {import("../utils/server").Server} server
     * @param {SceneControlTool} sidebarButton
     */
    constructor(server, sidebarButton) {
        super();
        this.server = server;
        this.sidebarButton = sidebarButton;

    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['eppolls'],
            minimizable: true,
            width: 500,
            height: 320,
            template: PLAIN_TEMPLATE,
            id: 'polls-application',
            title: 'Polls',
            resizable: true,
            positionOrtho: false,
            transformOrigin: null,
            svelte: {
                class: PollApplicationUi,
                target: document.body,
                intro: true,
                props:{
                    server: this.server
                }
            }
        })
    }

    /**
     * @param {any} options
     * @returns {Promise<void>}
     */
    async close(options) {
        await super.close(options);
        $('[data-tool=openStreamDirector]').removeClass('active');
        this.sidebarButton.active = false;
    }
}
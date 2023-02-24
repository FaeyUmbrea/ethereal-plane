import PollApplicationUi from '../svelte/PollApplicationUI.svelte';
import {SvelteApplication} from '@typhonjs-fvtt/runtime/application';

const PLAIN_TEMPLATE = "modules/ethereal-plane/templates/apps.hbs"

export default class PollApplication extends SvelteApplication {
    /**
     * @type {import("../utils/server").Server}
     */
    server;
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
        return mergeObject(super.defaultOptions, {
            classes: ['eppolls'],
            popOut: true,
            minimizable: true,
            width: 400,
            height: 300,
            template: PLAIN_TEMPLATE,
            id: 'polls-application',
            title: 'Polls',
            resizable: true
        })
    }

    /**
     * @param {any} data
     * @returns {Promise<any>}
     * @private
     */
    async _renderInner(data){
        const html = await super._renderInner(data);
        new PollApplicationUi({
            target: html.get(0),
            props: {
                server: this.server
            }
        })
        return html;
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
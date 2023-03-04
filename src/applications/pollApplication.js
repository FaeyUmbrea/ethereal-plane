import PollApplicationUi from '../svelte/PollApplicationUI.svelte';
import {SvelteApplication} from '@typhonjs-fvtt/runtime/svelte/application';

export default class PollApplication extends SvelteApplication {
    /**
     * @type {SceneControlTool}
     */
    sidebarButton;

    /**
     *
     * @param {SceneControlTool} sidebarButton
     */
    constructor(sidebarButton) {
        super();
        this.sidebarButton = sidebarButton;

    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['eppolls'],
            minimizable: true,
            width: 500,
            height: 320,
            id: 'polls-application',
            title: 'Polls',
            resizable: true,
            positionOrtho: false,
            transformOrigin: null,
            svelte: {
                class: PollApplicationUi,
                target: document.body,
                intro: true,
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
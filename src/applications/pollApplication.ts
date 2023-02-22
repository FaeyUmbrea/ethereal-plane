import PollApplicationUi from "../svelte/PollApplicationUI.svelte";
import { Server } from "../utils/server";

const PLAIN_TEMPLATE = 'modules/ethereal-plane/templates/apps.hbs'

export default class PollApplication extends Application {
    server: Server;
    sidebarButton: SceneControlTool;
    constructor(server: Server, sidebarButton: SceneControlTool) {
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

    protected async _renderInner(data: object): Promise<JQuery<HTMLElement>> {
        const html = await super._renderInner(data);
        new PollApplicationUi({
            target: html.get(0) as Element,
            props: {
                server: this.server
            }
        })
        return html;
    }

    async close(options: any) {
        super.close(options);
        $('[data-tool=openStreamDirector]').removeClass('active');
        this.sidebarButton.active = false;
    }
}
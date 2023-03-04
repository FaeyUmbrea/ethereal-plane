import {SvelteApplication} from "@typhonjs-fvtt/runtime/svelte/application";

export class SvelteSidebarTab extends SvelteApplication {

    constructor(...args) {
        super(...args);

        /**
         * The base name of this sidebar tab
         * @type {string}
         */
        this.tabName = this.constructor.defaultOptions.id;

        /**
         * A reference to the pop-out variant of this SidebarTab, if one exists
         * @type {SidebarTab}
         * @protected
         */
        this._popout = null;

        /**
         * Denote whether this is the original version of the sidebar tab, or a pop-out variant
         * @type {SidebarTab}
         */
        this._original = null;

        // Adjust options
        if (this.options.popOut) this.options.classes.push("sidebar-popout");
        this.options.classes.push(`${this.options.id}-sidebar`);

        // Register the tab as the sidebar singleton
        if (!this.popOut && ui.sidebar) ui.sidebar.tabs[this.tabName] = this;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            popOut: false,
            width: 300,
            height: "auto",
            classes: ["tab", "sidebar-tab"],
        });
    }

    get id() {
        return `${this.options.id}${this._original ? "-popout" : ""}`;
    }

    async _render(force = false, options = {}) {
        await super._render(force, options);
        if (this._popout) await this._popout._render(force, options);
    }

    async _renderInner(data) {
        let html = await super._renderInner(data);
        if (ui.sidebar?.activeTab === this.options.id) html.addClass("active");
        if (this.popOut) html.removeClass("tab");
        return html;
    }

    activate() {
        ui.sidebar.activateTab(this.tabName);
    }

    async close(options) {
        if (this.popOut) {
            const base = this._original;
            base._popout = null;
            return super.close(options);
        }
    }

    createPopout() {
        if (this._popout) return this._popout;
        const pop = new this.constructor({popOut: true});
        this._popout = pop;
        pop._original = this;
        return pop;
    }

    renderPopout() {
        const pop = this.createPopout();
        pop.render(true);
    }

}
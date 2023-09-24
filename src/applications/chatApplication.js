import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import ChatApplicationUi from "../svelte/ChatApplicationUi.svelte";

export class ChatApplication extends SvelteApplication {
  /**
   * The Scene Control Tool sidebar button.
   * @type {SceneControlTool}
   */
  sidebarButton;

  /**
   * Creates a new instance of ChatApplication.
   * @param {SceneControlTool} sidebarButton The Scene Control Tool sidebar button.
   */
  constructor(sidebarButton) {
    super();
    this.sidebarButton = sidebarButton;
  }

  /**
   * Gets the default options for the ChatApplication.
   * @returns {object} The default options.
   */
  static get defaultOptions() {
    // @ts-ignore
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["epchat"],
      minimizable: true,
      width: 300,
      height: 700,
      id: "streamchat-application",
      title: "Stream Chat",
      resizable: true,
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: ChatApplicationUi,
        target: document.body,
        intro: true,
      },
    });
  }

  /**
   * Closes the application.
   * @returns {Promise<void>}
   */
  async close() {
    //@ts-ignore
    await super.close();
    $("[data-tool=openStreamDirector]").removeClass("active");
    this.sidebarButton.active = false;
  }
}

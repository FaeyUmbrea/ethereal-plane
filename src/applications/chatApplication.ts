import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';
import ChatApplicationUi from '../svelte/ChatApplicationUi.svelte';

export class ChatApplication extends SvelteApplication {
  sidebarButton: SceneControlTool;

  constructor(sidebarButton: SceneControlTool) {
    super();
    this.sidebarButton = sidebarButton;
  }

  static get defaultOptions() {
    // @ts-ignore
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['epchat'],
      minimizable: true,
      width: 300,
      height: 700,
      id: 'streamchat-application',
      title: 'Stream Chat',
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

  async close() {
    //@ts-ignore
    await super.close();
    $('[data-tool=openStreamDirector]').removeClass('active');
    this.sidebarButton.active = false;
  }
}

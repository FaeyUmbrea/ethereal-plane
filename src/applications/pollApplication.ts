import PollApplicationUi from '../svelte/PollApplicationUI.svelte';
import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

export default class PollApplication extends SvelteApplication {
  sidebarButton: SceneControlTool;

  constructor(sidebarButton: SceneControlTool) {
    super();
    this.sidebarButton = sidebarButton;
  }

  static get defaultOptions() {
    //@ts-ignore
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['eppolls'],
      minimizable: true,
      width: 500,
      height: 315,
      id: 'polls-application',
      title: 'Polls',
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: PollApplicationUi,
        target: document.body,
        intro: true
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

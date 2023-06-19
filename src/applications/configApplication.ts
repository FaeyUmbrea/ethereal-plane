import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';
import ConfigUI from '../svelte/ConfigUI.svelte';
import { settings } from '../utils/settings.js';

export class ConfigApplication extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['eppolls'],
      minimizable: true,
      width: 500,
      height: 320,
      id: 'config-application',
      title: 'Ethereal Plane Config',
      resizable: true,
      positionOrtho: false,
      transformOrigin: null,
      svelte: {
        class: ConfigUI,
        target: document.body,
        intro: true,
        props: {
          settings: settings,
        },
      },
    });
  }
}

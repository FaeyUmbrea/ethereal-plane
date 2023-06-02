<svelte:options accessors={true} />

<script>
  import { onDestroy } from 'svelte';
  import { Poll } from '../utils/polls.ts';
  import { getSetting } from '../utils/settings.ts';
  import PollDisplay from './PollDisplay.svelte';
  import PollEditor from './PollEditor.svelte';
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/core';

  let poll = getSetting('currentPoll');
  export let elementRoot = void 0;
  let total = tallyTotal();

  let hook = Hooks.on('updateSetting', (setting, change) => {
    if (setting.key === 'ethereal-plane.currentPoll' && change != null) {
      poll = JSON.parse(change.value);
      total = tallyTotal();
    }
  });

  function tallyTotal() {
    if (!poll.tally) return 0;
    return poll.tally.reduce((prev, val) => prev + val[1], 0);
  }

  onDestroy(() => {
    Hooks.off('updateSettings', hook);
  });

  if (!poll) {
    poll = new Poll();
  }
</script>

<ApplicationShell bind:elementRoot>
  <main>
    {#if poll.until}
      <PollDisplay bind:poll {total} />
    {:else}
      <PollEditor bind:poll />
    {/if}
  </main>
</ApplicationShell>

<style lang="scss">
  main {
    text-align: center;
    display: flex;
    flex-direction: column;

    button,
    div.bottom {
      margin-top: auto;
    }

    div.container {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      padding: 10px;
      margin-top: auto;
    }

    h1 {
      color: #ff3e00;
      text-transform: uppercase;
      font-size: 4em;
      font-weight: 100;
    }

    label {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>

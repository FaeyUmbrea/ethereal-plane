<svelte:options accessors={true} />

<script>
  import { Poll } from '../utils/polls.ts';
  import { settings } from '../utils/settings.ts';
  import PollDisplay from './PollDisplay.svelte';
  import PollEditor from './PollEditor.svelte';
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/core';

  let poll = settings.getStore('currentPoll');
  export let elementRoot = void 0;

  if (!$poll) {
    console.warn('No Poll Found');
    poll.set(new Poll());
  }
</script>

<ApplicationShell bind:elementRoot>
  <main>
    {#if $poll.duration}
      <PollDisplay />
    {:else}
      <PollEditor />
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

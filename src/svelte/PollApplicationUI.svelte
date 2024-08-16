<svelte:options accessors="{true}" />

<script>
  import { Poll } from "../utils/polls.js";
  import { settings } from "../utils/settings.js";
  import PollDisplay from "./components/PollDisplay.svelte";
  import PollEditor from "./components/PollEditor.svelte";
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";

  let poll = settings.getStore("currentPoll");
  export let elementRoot = void 0;

  if (!$poll) {
    console.warn("No Poll Found");
    poll.set(new Poll());
  }
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <main>
    {#if $poll.duration}
      <PollDisplay />
    {:else}
      <PollEditor />
    {/if}
  </main>
</ApplicationShell>

<style lang="stylus">
  main {
    text-align: center;
    display: flex;
    flex-direction: column;
  }
</style>

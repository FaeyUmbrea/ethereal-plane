<script>
    import {onDestroy} from "svelte";
    import {Poll} from "../utils/polls.js";
    import {getSetting} from "../utils/settings.js";
    import PollDisplay from "./PollDisplay.svelte";
    import PollEditor from "./PollEditor.svelte";
    import {ApplicationShell} from '@typhonjs-fvtt/runtime/svelte/component/core';

    let poll = getSetting("currentPoll");
    export let elementRoot = void 0;

    let hook = Hooks.on("updateSetting", (setting, change) => {
        if(setting.key === 'ethereal-plane.currentPoll' && change != null){
            poll = JSON.parse(change.value);
        }
    })

    onDestroy(() => {
        Hooks.off('updateSettings', hook);
    })

    if(!poll){
        poll = new Poll();
    }
</script>

<svelte:options accessors={true}/>

<ApplicationShell  bind:elementRoot>
    <main>
{#if (poll.until)}
    <PollDisplay bind:poll={poll}/>
{:else}
    <PollEditor bind:poll={poll} />
{/if}
    </main>
</ApplicationShell >

<style lang="scss">
  main {
    text-align: center;
    display: flex;
    flex-direction: column;
    button, div.bottom {
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
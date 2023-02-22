<script lang="ts">
    import { onDestroy } from "svelte";
    import { Poll } from "../utils/polls";
    import { Server } from "../utils/server";
    import { getSetting } from "../utils/settings";
    import PollDisplay from "./PollDisplay.svelte";
    import PollEditor from "./PollEditor.svelte";

    let poll = getSetting("currentPoll") as Poll;
    export let server: Server;

    let hook = Hooks.on("updateSetting", (setting: Setting, change:any) => {
        if(setting.key == 'ethereal-plane.currentPoll' && change != null){
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

{#if (poll.until)}
    <PollDisplay bind:poll={poll}/>
{:else}
    <PollEditor server={server} bind:poll={poll} />
{/if}
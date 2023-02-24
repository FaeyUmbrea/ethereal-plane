<script>
    import { onDestroy } from "svelte";
    import { Poll } from "../utils/polls.js";
    import { Server } from "../utils/server.js";
    import { getSetting } from "../utils/settings.js";
    import PollDisplay from "./PollDisplay.svelte";
    import PollEditor from "./PollEditor.svelte";

    let poll = getSetting("currentPoll");
    export let server: Server;

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

{#if (poll.until)}
    <PollDisplay bind:poll={poll}/>
{:else}
    <PollEditor server={server} bind:poll={poll} />
{/if}
<script>
    import { Poll, PollStatus } from "../utils/polls.js";
    import { Server } from "../utils/server.js";
    import { setSetting } from "../utils/settings.js";

    export var poll: Poll
    export let server:Server;
    const options = poll.options;
    let optionSize = options.length;

    function addOption(){
        options.push("")
        optionSize = options.length;
    }
    function startPoll(){
        poll.until = (new Date(Date.now() + 30000)).toString();
        poll.tally = Array.from(options).map((_val,i) => [i.toString(),0]);
        poll.status = PollStatus.started
        setSetting("currentPoll",poll);
        server.createPoll(options.map((_val,index) => index.toString()),30000);
    }
</script>

<div>
    {#key optionSize}
    {#each options as option,index}
        {index}
        <input type="text" bind:value={option}/>
    {/each}
    {/key}
    <button on:click={addOption}>Add</button>
    <button on:click={startPoll}>Start</button>
</div>
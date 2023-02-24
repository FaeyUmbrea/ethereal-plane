<script lang="ts">
    import { Poll, PollStatus } from "../utils/polls.js";

    export var poll:Poll
</script>

<div>
    {#if (poll.tally)}
    {#each (poll.tally) as tally}
        <span>{poll.options[Number.fromString(tally[0])]} : {tally[1]}</span>
    {/each}
    {/if}
    {poll.status >= PollStatus.stopped}
</div>
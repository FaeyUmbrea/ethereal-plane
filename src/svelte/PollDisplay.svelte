<script>
    import {Poll, PollStatus} from "../utils/polls.js";
    import {setSetting} from "../utils/settings.js";
    import {Server} from "../utils/server.js";

    export var poll

    function tallyTotal() {
        return poll.tally.reduce((prev, val) => prev + val[1])
    }

    function abortPoll() {
        poll.status = PollStatus.failed;
        Server.getServer().abortPoll()
    }

    function endPoll() {
        setSetting("currentPoll", new Poll())
    }
</script>

<div class="display">
    <div class="tally">
        {#if (poll.tally)}
            {#each (poll.tally) as tally,index}
                <span class="tally-entry">{poll.options[Number.fromString(tally[0])]}</span>
                <progress value={tally[1]} max={tallyTotal()}></progress>
            {/each}
        {/if}
    </div>
    <div class="buttons">
        {#if (poll.status <= PollStatus.started)}
            <button id="abort" on:click={abortPoll}>Abort</button>
        {:else}
            <button id="end" on:click={endPoll}>End</button>
        {/if}
    </div>
</div>

<style lang="scss">
  .display {
    height: 100%;
    min-height: 100%;
    display: grid;
    grid-template-rows: auto 35px;
  }

  .tally {
    align-content: flex-start;
    display: grid;
    grid-template-columns: 100px auto;
    grid-row-gap: 5px;
    grid-column-gap: 2px;
  }
  progress {
    width: auto;
    height: 25px;
  }
  span {
    border: gray solid 1px;
    border-radius: 5px;
    padding-top: 2.5px;
  }
  #abort {
    background: lightcoral;
  }
</style>
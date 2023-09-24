<script>
  import { getSetting } from "../utils/settings.js";
  import { onDestroy } from "svelte";
  import { PollStatus } from "../utils/polls.js";

  let poll = getSetting("currentPoll");
  let total = tallyTotal();

  let hook = Hooks.on("updateSetting", (setting, change) => {
    if (setting.key === "ethereal-plane.currentPoll" && change != null) {
      poll = JSON.parse(change.value);
      total = tallyTotal();
    }
  });

  onDestroy(() => {
    Hooks.off("updateSettings", hook);
  });

  function tallyTotal() {
    return poll.tally.reduce((prev, val) => prev + val[1], 0);
  }
</script>

{#if poll.status >= PollStatus.started}
  <div class="ethereal-plane" id="poll">
    <div class="tally">
      {#if poll.tally}
        {#each poll.tally as tally, index}
          <span class="tally-entry" id="{'entry' + index}"
            >{poll.options[Number.fromString(tally[0])]}</span
          >
          <progress value="{tally[1]}" max="{total}" id="{'bar' + index}"
          ></progress>
          <span class="tally-value" id="{'value' + index}">{tally[1]} </span>
        {/each}
        <span class="tally-total">{tallyTotal()}</span>
        <span class="poll-status">{poll.status}</span>
      {/if}
    </div>
  </div>
{/if}

<script>
  import { PollStatus } from '../utils/polls.js';
  import { setSetting } from '../utils/settings.js';
  import { Server } from '../utils/server.js';

  export var poll;
  // noinspection JSUnusedAssignment
  const options = poll.options;
  let optionSize = options.length;

  function addOption() {
    options.push('');
    optionSize = options.length;
  }

  function removeOption() {
    options.pop();
    optionSize = options.length;
  }

  function startPoll() {
    poll.until = new Date(Date.now() + 30000).toString();
    poll.tally = Array.from(options).map((_val, i) => [i.toString(), 0]);
    poll.status = PollStatus.started;
    setSetting('currentPoll', poll);
    Server.getServer().createPoll(
      options.map((_val, index) => index.toString()),
      30000
    );
  }
</script>

<div class="editor">
  <div class="options">
    {#key optionSize}
      {#each options as option, index}
        <label for={index}>{index}</label>
        <input id={index} type="text" bind:value={option} />
      {/each}
    {/key}
  </div>
  <div class="buttons">
    <button class="addrem" on:click={addOption}><i class="fas fa-plus" /></button>
    <button class="addrem" on:click={removeOption}><i class="fas fa-minus" /></button>
    <button on:click={startPoll}>Start</button>
  </div>
</div>

<style lang="scss">
  .options {
    display: grid;
    grid-template-columns: 35px auto;
    grid-column-gap: 2px;
    grid-row-gap: 3px;
    align-content: flex-start;
  }

  label {
    height: 25px;
    border: 1px solid grey;
    border-radius: 5px;
    padding: 3px;
    width: 35px;
  }

  button.addrem {
    width: 35px;
  }

  .buttons {
    display: flex;
  }

  .editor {
    height: 100%;
    min-height: 100%;
    display: grid;
    grid-template-rows: auto 35px;
  }
</style>

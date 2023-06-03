<script>
  import { PollStatus } from '../utils/polls.ts';
  import { setSetting, settings } from '../utils/settings.ts';
  import { TJSDocument } from '@typhonjs-fvtt/runtime/svelte/store';

  const poll = settings.getStore('currentPoll');

  function addOption() {
    if ($poll.options.length >= 5) return;
    const newPoll = $poll;
    newPoll.options.push({ key: 'new option' });
    setSetting('currentPoll', newPoll);
  }

  function removeOption() {
    if ($poll.options.length <= 2) return;
    const newPoll = $poll;
    newPoll.options.pop();
    setSetting('currentPoll', newPoll);
  }

  async function startPoll() {
    const newPoll = $poll;
    newPoll.tally = Array(newPoll.options.length).fill(0);
    newPoll.status = PollStatus.started;
    newPoll.duration = 30;
    await setSetting('currentPoll', newPoll);
    //getConnectionManager().createPoll();
  }

  const doc = new TJSDocument();

  async function onDrop(event, index) {
    console.log('Ethereal Plane | Adding Macro to Poll Option ' + index);
    try {
      await doc.setFromDataTransfer(JSON.parse(event.dataTransfer.getData('text/plain')));
      const newPoll = $poll;
      newPoll.options[index].macro = doc.get();
      await setSetting('currentPoll', newPoll);
    } catch (err) {
      console.error(err);
    }
  }

  function onClick(index) {
    console.log('Not implemented');
  }

  async function onRClick(index) {
    console.log('Ethereal Plane | Removing Macro from Poll Option ' + index);
    const newPoll = $poll;
    newPoll.options[index].macro = undefined;
    await setSetting('currentPoll', newPoll);
  }
</script>

<div class="editor">
  <div class="options">
    {#each $poll.options as option, index}
      <label for={index}>{index + 1}</label>
      <input id={index} type="text" bind:value={option.text} />
      <section
        class="macro"
        on:click={() => onClick(index)}
        on:auxclick={() => onRClick(index)}
        on:drop|preventDefault|stopPropagation={(e) => onDrop(e, index)}
      >
        {option.macro ? option.macro.name : ''}
      </section>
    {/each}
  </div>
  <div class="buttons">
    <button class="addrem" disabled={$poll.options.length >= 5} on:click={addOption}><i class="fas fa-plus" /> </button>
    <button class="addrem" disabled={$poll.options.length <= 2} on:click={removeOption}
      ><i class="fas fa-minus" />
    </button>
    <button on:click={startPoll}>Start</button>
  </div>
</div>

<style lang="scss">
  .options {
    display: grid;
    grid-template-columns: 35px auto 35px;
    grid-column-gap: 2px;
    grid-row-gap: 3px;
    align-content: flex-start;

    .macro {
      border: grey 1px solid;
      border-radius: 5px;
      height: 35px;
    }

    input {
      height: 35px;
      font-size: 20px;
    }
  }

  label {
    height: 35px;
    border: 1px solid grey;
    border-radius: 5px;
    text-align: center;
    padding: 3px;
    font-size: 20px;
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

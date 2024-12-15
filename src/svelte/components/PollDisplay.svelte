<script>
	import { localize } from '#runtime/util/i18n';
	import { getConnectionManager } from '../../server/connectionManager.ts';
	import { Poll, PollStatus } from '../../utils/polls.ts';
	import { setSetting, settings } from '../../utils/settings.ts';

	const pollStore = settings.getStore('currentPoll');

	const disableEnd = false;

	function abortPoll() {
		const poll = $pollStore;
		poll.status = PollStatus.failed;
		setSetting('currentPoll', poll);
		getConnectionManager().abortPoll();
	}

	function endPoll() {
		setSetting('currentPoll', new Poll());
	}

	function total() {
		const tally = $pollStore.tally.reduce((e, p) => e + p, 0);
		return tally || 1;
	}
</script>

<div class='display'>
	<div class='tally'>
		{#if $pollStore.tally}
			{#each $pollStore.tally as tally, index}
				<span class='tally-entry'>{$pollStore.options[index].text}</span>
				<progress value={tally} max={total(tally)}></progress>
				<span class='tally-entry'
				>{tally} / {Math.round((tally / total()) * 100)}%</span
				>
			{/each}
		{/if}
	</div>
	<div class='buttons'>
		{#if $pollStore.status <= PollStatus.started}
			<button id='abort' on:click={abortPoll}
			>{localize('ethereal-plane.ui.abort')}</button
			>
		{:else}
			<button id='end' disabled={disableEnd} on:click={endPoll}
			>{localize('ethereal-plane.ui.end')}</button
			>
		{/if}
	</div>
</div>

<style lang='stylus'>
  .display {
    height: 100%;
    min-height: 100%;
    display: grid;
    grid-template-rows: auto 35px;
  }

  .tally {
    align-content: flex-start;
    display: grid;
    grid-template-columns: min-content auto min-content;
    grid-row-gap: 5px;
    grid-column-gap: 5px;
  }
  progress {
    width: auto;
    height: 25px;
  }
  span {
    border: gray solid 1px;
    border-radius: 5px;
    padding-top: 2.5px;
    padding-left: 10px;
    padding-right: 10px;
    white-space: nowrap;
  }
  #abort {
    background: lightcoral;
  }
</style>

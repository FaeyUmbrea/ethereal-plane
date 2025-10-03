<svelte:options runes={true} />
<script lang='ts'>
	import { onDestroy } from 'svelte';
	import { Poll, PollStatus } from '../../utils/polls.ts';
	import { getSetting } from '../../utils/settings.ts';

	let poll = $state(getSetting('currentPoll') as Poll);
	let total = $state(tallyTotal());

	const hook = Hooks.on('updateSetting', (setting, change) => {
		if (setting.key === 'ethereal-plane.currentPoll' && change != null) {
			poll = JSON.parse(change.value as string);
			total = tallyTotal();
		}
	});

	onDestroy(() => {
		// @ts-expect-error wha
		Hooks.off('updateSettings', hook);
	});

	function tallyTotal() {
		// @ts-expect-error why
		return poll.tally.reduce((prev, val) => prev + val[1], 0);
	}
</script>

{#if poll.status >= PollStatus.started}
	<div class='ethereal-plane' id='poll'>
		<div class='tally'>
			{#if poll.tally}
				{#each poll.tally as tally, index}
					<span class='tally-entry' id={`entry${index}`}
					>{poll.options[Number.fromString(tally[0])]}</span
					>
					<progress value={tally[1]} max={total} id={`bar${index}`}
					></progress>
					<span class='tally-value' id={`value${index}`}>{tally[1]} </span>
				{/each}
				<span class='tally-total'>{tallyTotal()}</span>
				<span class='poll-status'>{poll.status}</span>
			{/if}
		</div>
	</div>
{/if}

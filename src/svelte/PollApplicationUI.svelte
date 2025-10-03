<svelte:options runes={true} />
<script lang='ts'>
	import { Poll, PollStatus } from '../utils/polls.ts';
	import { settings } from '../utils/settings.ts';
	import PollDisplay from './components/PollDisplay.svelte';
	import PollEditor from './components/PollEditor.svelte';

	const poll = settings.getStore('currentPoll');

	if (!$poll) {
		console.warn('No Poll Found');
		poll.set(new Poll());
	}
</script>

<main>
	{#if $poll.status > PollStatus.notStarted}
		<PollDisplay />
	{:else}
		<PollEditor />
	{/if}
</main>

<style lang='scss'>
  main {
    text-align: center;
    display: flex;
    flex-direction: column;
		height: 100%
  }
</style>

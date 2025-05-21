<svelte:options accessors={true} />

<script>
	import { ApplicationShell } from '#runtime/svelte/component/application';
	import { Poll, PollStatus } from '../utils/polls.ts';
	import { settings } from '../utils/settings.ts';
	import PollDisplay from './components/PollDisplay.svelte';
	import PollEditor from './components/PollEditor.svelte';

	const poll = settings.getStore('currentPoll');
	export let elementRoot = void 0;

	if (!$poll) {
		console.warn('No Poll Found');
		poll.set(new Poll());
	}
</script>

<ApplicationShell bind:elementRoot={elementRoot}>
	<main>
		{#if $poll.status > PollStatus.notStarted}
			<PollDisplay />
		{:else}
			<PollEditor />
		{/if}
	</main>
</ApplicationShell>

<style lang='stylus'>
  main {
    text-align: center;
    display: flex;
    flex-direction: column;
		height: 100%
  }
</style>

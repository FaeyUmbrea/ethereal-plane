<script lang='ts'>
	import { localize } from '#runtime/util/i18n';
	import { afterUpdate } from 'svelte';
	import { chatMessages } from '../stores/chatMessages.ts';
	import ChatMessage from './ChatMessage.svelte';

	let element: HTMLElement | null = null;

	const scrollToBottom = async (node: HTMLElement | null) => {
		node?.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	afterUpdate(() => {
		if ($chatMessages) scrollToBottom(element);
	});

	$: if ($chatMessages && element) {
		scrollToBottom(element);
	}
</script>

<ol bind:this={element} class='ep-chat'>
	<ChatMessage
		message={localize('ethereal-plane.ui.chat-welcome')}
		user={localize('ethereal-plane.ui.system')}
	/>
	{#each $chatMessages as { user, message }}
		<ChatMessage user={user} message={message} />
	{/each}
</ol>
<div id='anchor'></div>

<style lang='scss'>
  .ep-chat {
		overflow-anchor: none;
		height: 100%;
		margin: 0;
		padding: 0;
		overflow-x: hidden;
		overflow-y: auto;
		list-style: none;
	}

  #anchor {
		overflow-anchor: auto;
		height: 1px;
		min-height: 1px;
		max-height: 1px;
	}

</style>

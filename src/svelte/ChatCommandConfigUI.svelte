<svelte:options accessors={true} />

<script lang='ts'>
	import { ApplicationShell } from '#runtime/svelte/component/application';
	import { localize } from '#runtime/util/i18n';
	import { getContext } from 'svelte';
	import { ChatCommand } from '../utils/chatCommands.ts';
	import { setSetting, settings } from '../utils/settings.ts';
	import ChatCommandConfig from './components/ChatCommandConfig.svelte';

	const commands = settings.getStore('chat-commands');
	export let elementRoot = void 0;

	function add() {
		const commandArray = $commands;
		commandArray.push(new ChatCommand());
		$commands = commandArray;
	}

	const context = getContext('#external');

	async function close() {
		await setSetting('chat-commands', $commands);
		context.application.close();
	}

	async function remove(index) {
		const commandArray = $commands;
		commandArray.splice(index, 1);
		$commands = commandArray;
	}
</script>

<ApplicationShell bind:elementRoot={elementRoot}>
	<main>
		<div class='header-section'>
			<span class='config'>{localize('ethereal-plane.ui.commands.base')}</span>
			<span class='cooldown'
			>{localize('ethereal-plane.ui.commands.cooldown')}</span
			>
			<span class='macro'></span>
			<span></span>
			<span></span>
			<span class='user'>{localize('ethereal-plane.ui.commands.user')}</span>
			<span class='target'>{localize('ethereal-plane.ui.commands.target')}</span
			>
			<span></span>
			<span></span>
			<span></span>

			<span>{localize('ethereal-plane.ui.commands.active')}</span>
			<span>{localize('ethereal-plane.ui.commands.name')}</span>
			<span>{localize('ethereal-plane.ui.commands.template')}</span>
			<span>{localize('ethereal-plane.ui.commands.non-subscriber')}</span>
			<span>{localize('ethereal-plane.ui.commands.subscriber')}</span>
			<span>{localize('ethereal-plane.ui.commands.non-subscriber')}</span>
			<span>{localize('ethereal-plane.ui.commands.subscriber')}</span>
			<span>{localize('ethereal-plane.ui.commands.target-identifier')}</span>
			<span class='macro'>{localize('ethereal-plane.ui.commands.macro')}</span>
			<span></span>
		</div>
		<div class='command-section'>
			{#each $commands as command, index}
				<ChatCommandConfig bind:command={command} index={index}
				/>
				<button on:click={() => remove(index)}
				><i class='fas fa-trash'></i></button
				>
			{/each}
		</div>
		<hr />
		<div class='footer'>
			<button class='add' on:click={add}><i class='fas fa-plus'></i></button>
			<button on:click={close}>{localize('ethereal-plane.ui.save')}</button>
		</div>
	</main>
</ApplicationShell>

<style lang='scss'>
  main {
		height: 100%;
		display: grid;
		grid-template-rows: 75px auto 35px 40px;
		gap: 2px;
	}
  button {
		width: 100%;
		height: 35px;
	}
  .footer {
		display: grid;
		grid-template-columns: 35px auto;
		grid-column-gap: 3px;
	}

  .add {
		width: 35px;
	}

	.header-section {
		display: grid;
		grid-template-columns: 40px 2fr 3fr 40px 40px 40px 40px 3fr 40px 35px;
		grid-template-rows: 15px 20px;
	}

	.command-section {
		display: grid;
		max-height: 100%;
		overflow-y: scroll;
		overflow-x: hidden;
		gap: 2px;
		grid-template-columns: 40px 2fr 3fr 40px 40px 40px 40px 3fr 40px 35px;
		grid-auto-rows: 35px;
	}

  span {
		text-align: center;
		border-left: 1px solid grey;
	}
  .config {
		grid-column: 1 / 4;
	}
  .cooldown {
		grid-column: 4 / 9;
	}

  .user {
		grid-column: 4 / 6;
	}

  .target {
		grid-column: 6/8;
	}

</style>

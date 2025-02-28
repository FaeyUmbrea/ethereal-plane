<script>
	import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
	import ChatCommandAliasApplication from '../../applications/chatCommandAliasApplication.js';

	export let command;
	export let index;

	function openMacro() {
		if (command.macro) {
			game.macros.get(command.macro).sheet.render(true);
		}
	}

	function deleteMacro() {
		command.macro = '';
	}

	const doc = new TJSDocument();

	async function dropMacro(event) {
		try {
			await doc.setFromDataTransfer(
				JSON.parse(event.dataTransfer.getData('text/plain')),
			);
			command.macro = doc.get().id;
		} catch (err) {
			console.error(err);
		}
	}

	function openAliasEditor() {
		const editor = new ChatCommandAliasApplication(command.commandAliases, (commandAliases) => {
			command.commandAliases = commandAliases;
		});
		editor.render(true);
	}
</script>

<label for='active-checkbox-{index}'>
	{#if command.active}<i class='fas fa-check'></i>{/if}
</label>
<input
	bind:checked={command.active}
	id='active-checkbox-{index}'
	type='checkbox'
/>
<div class='command-prefix'>
	<input bind:value={command.commandPrefix} type='text' />
	<button on:click={() => { openAliasEditor(); }}
	><i class='fas fa-list'></i></button
	></div>
<input bind:value={command.commandTemplate} type='text' />
<input bind:value={command.perUserCooldown} type='number' />
<input bind:value={command.perUserSubCooldown} type='number' />
<input bind:value={command.perTargetCooldown} type='number' />
<input bind:value={command.perTargetSubCooldown} type='number' />
<input
	bind:value={command.targetIdentifier}
	disabled={command.perTargetCooldown <= 0 && command.perTargetSubCooldown <= 0}
	type='text'
/>
<section
	role='none'
	class='macro'
	on:auxclick={deleteMacro}
	on:click={openMacro}
	on:drop|preventDefault|stopPropagation={dropMacro}
>
	{#if command.macro}
		<section class='macro'>
			<img alt='Macro Icon' src={game.macros.get(command.macro)?.img ?? ''} />
		</section>
	{/if}
</section>

<style lang='stylus'>
  .macro
    border grey 1px solid;
    border-radius 5px;
    height 35px;
    width 35px;
    justify-self center

  input
    height 35px

  input[type=checkbox]
    display none

  label
    border grey 1px solid;
    border-radius 5px;
    height 35px;
    width 35px;
    font-size 25px;
    display inline-flex;
    justify-content: center;
    align-items: center;
    justify-self center;

	.command-prefix
		display grid;
		grid-template-columns auto 35px;

		button
			width 35px;
</style>

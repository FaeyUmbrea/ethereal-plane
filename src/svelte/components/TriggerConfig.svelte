<script lang='ts'>
	import type { TriggerConfig, TriggerMacro } from '../../utils/types.ts';
	import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
	import { onMount } from 'svelte';
	import { getGame } from '../../utils/helpers.ts';
	import { getSetting, setSetting } from '../../utils/settings.ts';

	export let trigger: TriggerConfig;

	let macro: Macro | undefined;

	function getMacro() {
		const macro_map = getSetting('chat-trigger-macros') as TriggerMacro[];
		const macro_name = macro_map?.find(data => data.id === trigger.id)?.macro;

		if (!macro_name) {
			macro = undefined;
			return;
		}
		macro = getGame().macros?.get(macro_name);
	}

	function openMacro() {
		macro?.sheet?.render(true);
	}

	async function deleteMacro() {
		const macros = getSetting('chat-trigger-macros') as TriggerMacro[];
		const index = macros.findIndex(entry => entry.id === trigger.id);
		macros.splice(index, 1);
		macro = undefined;
		await setSetting('chat-trigger-macros', macros);
	}

	const doc = new TJSDocument<Macro>();

	async function dropMacro(event: TJSDocument.Data.UUIDDataTransfer) {
		try {
			await doc.setFromDataTransfer(
				JSON.parse(event.dataTransfer.getData('text/plain')),
			);
			const macro_data = doc.get();
			if (macro_data && macro_data.id) {
				const macro_map = getSetting('chat-trigger-macros') as TriggerMacro[];
				const macro_entry = macro_map?.find(data => data.id === trigger.id);
				if (macro_entry) {
					macro_entry.macro = macro_data.id;
				} else {
					macro_map.push({
						id: trigger.id,
						macro: macro_data.id,
					});
				}
				await setSetting('chat-trigger-macros', macro_map);
			}
			macro = macro_data;
		} catch (err) {
			console.error(err);
		}
	}

	onMount(() => {
		getMacro();
	});
</script>

<div class='label'>
	{#if trigger.active}
		<i class='fas fa-check'></i>
	{:else}
		<i class='fas fa-x'></i>
	{/if}
</div>
<div class='name'>
	<span>
		{trigger.title}
	</span>
</div>
<div class='created date'>
	<span>
		{new Date(trigger.created_at).toLocaleString()}
	</span>
</div>
<div class='updated date'>
	<span>
		{new Date(trigger.updated_at).toLocaleString()}
	</span>
</div>
<section
	role='none'
	class='macro'
	on:auxclick={deleteMacro}
	on:click={openMacro}
	on:drop|preventDefault|stopPropagation={dropMacro}
>
	{#if macro}
		<section class='macro'>
			<img alt='Macro Icon' src={macro.img ?? ''} />
		</section>
	{/if}
</section>

<style lang='scss'>
	.name {
		font-size: 18px;
		font-weight: bold;
		align-content: center;
		text-align: center;
		height: 35px;
		overflow: hidden;
		text-overflow: ellipsis;
		text-wrap: nowrap;
	}

	.date {
		font-size: 16px;
		font-weight: bold;
		align-content: center;
		text-align: center;
		height: 35px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

  .macro {
		border: grey 1px solid;
		border-radius: 5px;
		height: 35px;
		width: 35px;
		justify-self: center;
	}

  .label {
		border: grey 1px solid;

		border-radius: 5px;
		height: 35px;
		width: 35px;
		font-size: 25px;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		justify-self: center;
	}

	.name {
		width: 100%;
	}
</style>

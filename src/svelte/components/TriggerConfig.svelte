<svelte:options runes={true} />

<script lang='ts'>
	import type { TriggerConfig, TriggerMacro } from '../../utils/types.ts';
	import { onMount } from 'svelte';
	import {
		downloadTriggerMacro,
		uploadTriggerMacro,
	} from '../../server/trigger_api.ts';
	import { createMacro, getGame } from '../../utils/helpers.ts';
	import { getSetting, setSetting } from '../../utils/settings.ts';

	let { trigger = $bindable() }: { trigger: TriggerConfig } = $props();

	let macro: Macro | undefined = $state();

	function getMacro() {
		const macro_map = getSetting('chat-trigger-macros') as TriggerMacro[];
		const macro_name = macro_map?.find(
			data => data.id === trigger.id,
		)?.macro;

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

	async function dropMacro(event: DragEvent) {
		if (!event.dataTransfer) {
			return;
		}
		try {
			const data = JSON.parse(event.dataTransfer.getData('text/plain'));
			if (
				Object.keys(data).includes('type')
				&& Object.keys(data).includes('uuid')
			) {
				if (data.type === 'Macro') {
					const macro_data = (game as ReadyGame).macros.get(
						data.uuid.split('.')[1],
					);
					if (macro_data && macro_data.id) {
						const macro_map = getSetting(
							'chat-trigger-macros',
						) as TriggerMacro[];
						const macro_entry = macro_map?.find(
							data => data.id === trigger.id,
						);
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
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function uploadMacro() {
		if (macro) {
			const res = await uploadTriggerMacro(trigger.id, macro.command);
			if (res) {
				ui.notifications?.info(
					`${(game as ReadyGame).i18n.localize('ethereal-plane.macro.upload.success')}`,
				);
			} else {
				ui.notifications?.warn(
					`${(game as ReadyGame).i18n.localize('ethereal-plane.macro.upload.failure')}`,
				);
			}
		}
	}

	async function downloadMacro() {
		const res = await downloadTriggerMacro(trigger.id);
		if (res) {
			if (macro) {
				macro.update({ command: res });
			} else {
				macro = await createMacro(trigger.title, res);
				if (macro && macro.id) {
					const macro_map = getSetting(
						'chat-trigger-macros',
					) as TriggerMacro[];
					const macro_entry = macro_map?.find(
						data => data.id === trigger.id,
					);
					if (macro_entry) {
						macro_entry.macro = macro.id;
					} else {
						macro_map.push({
							id: trigger.id,
							macro: macro.id,
						});
					}
					await setSetting('chat-trigger-macros', macro_map);
				}
			}
			ui.notifications?.info(
				`${(game as ReadyGame).i18n.localize('ethereal-plane.macro.download.success')}`,
			);
		} else {
			ui.notifications?.warn(
				`${(game as ReadyGame).i18n.localize('ethereal-plane.macro.download.failure')}`,
			);
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
<div class='macro-area'>
	<button aria-label='upload macro' onclick={uploadMacro} disabled={!macro}>
		<i class='fas fa-upload'></i>
	</button>
	<button aria-label='download macro' onclick={downloadMacro}>
		<i class='fas fa-download'></i>
	</button>
	<section
		role='none'
		class='macro'
		onauxclick={deleteMacro}
		onclick={openMacro}
		ondrop={dropMacro}
	>
		{#if macro}
			<section class='macro'>
				<img alt='Macro Icon' src={macro.img ?? ''} />
			</section>
		{/if}
	</section>
</div>

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

	.macro-area {
		display: flex;
		flex-direction: row;
	}

	button {
		width: 35px;
		height: 35px;
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

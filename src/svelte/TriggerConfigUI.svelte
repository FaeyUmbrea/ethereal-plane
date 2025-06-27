<svelte:options accessors={true} />

<script lang='ts'>
	import type { TriggerConfig } from '../utils/types.ts';
	import { ApplicationShell } from '#runtime/svelte/component/application';
	import { localize } from '#runtime/util/i18n';
	import { onMount } from 'svelte';
	import { getTriggers } from '../server/trigger_api.ts';
	import Trigger from './components/TriggerConfig.svelte';

	let triggers: TriggerConfig[] = [];

	export let elementRoot = void 0;

	let load = false;

	async function reload_triggers() {
		load = true;
		triggers = (await getTriggers()) ?? [];
		load = false;
	}

	onMount(async () => {
		await reload_triggers();
	});
</script>

<ApplicationShell bind:elementRoot={elementRoot}>
	<main>
		<div class='header-section'>
			<span>{localize('ethereal-plane.ui.commands.active')}</span>
			<span>{localize('ethereal-plane.ui.commands.name')}</span>
			<span>{localize('ethereal-plane.ui.commands.created_at')}</span>
			<span>{localize('ethereal-plane.ui.commands.updated_at')}</span>
			<span class='macro'>{localize('ethereal-plane.ui.commands.macro')}</span>
		</div>
		<hr />
		<div class='command-section'>
			{#each triggers as trigger, index (index)}
				<Trigger trigger={trigger} index={index} />
			{/each}
		</div>
		{#if load}
			<div class='loader'>
				<i class='fa-solid fa-spinner-third'></i>
			</div>
		{/if}
	</main>
</ApplicationShell>

<style lang='scss'>
  main {
		height: 100%;
		display: grid;
		grid-template-rows: 10px 25px auto;
		gap: 2px;
	}

	.header-section {
		display: grid;
		grid-template-columns: 40px auto 150px 150px 55px;
		grid-template-rows: 15px;
	}

	.command-section {
		display: grid;
		max-height: 100%;
		height: 100%;
		width: 100%;
		max-width: 100%;
		overflow-y: scroll;
		overflow-x: hidden;
		gap: 2px;
		grid-template-columns: 40px auto 150px 150px 35px;
		grid-auto-rows: 35px;
	}

  span {
		text-align: center;
	}

	.loader {
		width: 100%;
		height: calc(100% - 50px);
		background: #00000050;
		position: absolute;
		top: 50px;
		left: 0;

		i {
			position: absolute;
			top: calc(50% - 25px);
			left: calc(50% - 25px);
			font-size: 50px;
			animation: fa-spin 1s infinite linear;
		}
	}
</style>

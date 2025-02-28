<svelte:options accessors={true} />

<script lang='ts'>
	import type { External } from '../applications/chatCommandAliasApplication.ts';
	import { ApplicationShell } from '#runtime/svelte/component/application';
	import { localize } from '#runtime/util/i18n';
	import { getContext } from 'svelte';

	export let elementRoot = void 0;

	const application = getContext<External>('#external').application;

	let aliases = application.aliases;

	function close() {
		application.aliases = aliases;
		application.close();
	}

	let changed = false;

	function remove(index: number) {
		aliases = aliases.filter((_, i) => i !== index);
		changed = !changed;
	}

	function add() {
		aliases = [...aliases, ''];
		changed = !changed;
	}
</script>

<ApplicationShell bind:elementRoot={elementRoot}>
	<div class='content'>
		{#key changed}
			<ul>
				{#each aliases as alias, index}
					<li>
						<input bind:value={alias} name='style' type='text' />
						<button on:click={() => remove(index)}><i class='fas fa-trash'></i></button>
					</li>
				{/each}
			</ul>
		{/key}
		<hr />
		<footer>
			<button class='add' on:click={add}><i class='fas fa-plus'></i></button>
			<button on:click={close}
			>{localize('ethereal-plane.ui.save')}</button
			>
		</footer>
	</div>
</ApplicationShell>

<style lang='stylus'>
    footer {
        width 100%
				display grid
				grid-template-columns 35px auto
    }

		li {
			display grid
			grid-template-columns auto 35px
			height 35px
			min-height 35px
			padding-left 4px
			padding-right 4px
			input {
				height 100%
			}
		}

		ul {
			list-style-type none
			padding 0
			padding-top 10px
			height 100%
			max-height 100%
			overflow-y scroll
			display flex
			flex-direction column
			row-gap 5px
		}

		.content {
			display grid
			grid-template-rows auto 2px 35px
			grid-template-columns auto
			width 100%
			height 100%
			max-height 100%
			grid-row-gap 5px
		}

		hr {
			width 100%
		}
</style>

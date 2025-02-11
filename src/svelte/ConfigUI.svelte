<svelte:options accessors={true} />

<script>
	import { ApplicationShell } from '#runtime/svelte/component/application';
	import { localize } from '#runtime/util/i18n';
	import { tooltip } from '@svelte-plugins/tooltips';
	import { Modes } from '../utils/const.ts';
	import { settings } from '../utils/settings.ts';
	import CollapsibleSection from './components/CollapsibleSection.svelte';
	import InfoBox from './components/InfoBox.svelte';
	import PatreonConfig from './components/PatreonConfig.svelte';

	const mode = settings.getStore('mode');
	const modes = Object.values(Modes);
	const serverUrl = settings.getStore('server-url');
	const sendRollsToChat = settings.getStore('send-rolls-to-chat');
	const chatMessageTemplate = settings.getStore('chat-message-template');
	const pollsEnabled = settings.getStore('polls-enabled');
	const moduleEnabled = settings.getStore('enabled');
	const allowSocket = settings.getStore('allow-socket');
	const allowAPI = settings.getStore('allow-api');

	export let elementRoot = void 0;
</script>

<ApplicationShell bind:elementRoot={elementRoot}>
	<main>
		{#if !$moduleEnabled}
			<InfoBox variant='error'>
				{localize('ethereal-plane.strings.disabled')}
			</InfoBox>
		{/if}
		<CollapsibleSection
			collapsed={false}
			title={localize('ethereal-plane.ui.general-tab')}
		>
			<section class='settings'>
				<span>{localize(`ethereal-plane.settings.mode.Name`)}</span>
				<select bind:value={$mode} name='mode'>
					{#each modes as choice}
						<option value={choice}
						>{localize(`ethereal-plane.settings.mode.${choice}`)}</option
						>
					{/each}
				</select>
				<span
				>{localize('ethereal-plane.settings.send-rolls-to-chat.Name')}</span
				>
				<input bind:checked={$sendRollsToChat} type='checkbox' />
				{#if $sendRollsToChat}
					<span
					>{localize(
						'ethereal-plane.settings.chat-message-template.Name',
					)}</span
					>
					<textarea bind:value={$chatMessageTemplate}></textarea>
				{/if}
				<span>{localize('ethereal-plane.settings.allow-socket.Name')}</span>
				<div
					use:tooltip={{
						content: localize('ethereal-plane.settings.allow-socket.Hint'),
						position: 'left',
						autoPosition: true,
						align: 'center',
						style: { backgroundColor: 'white', color: 'black' },
					}}
				>
					<input bind:checked={$allowSocket} type='checkbox' />
				</div>
				<span>{localize('ethereal-plane.settings.allow-api.Name')}</span>
				<div
					use:tooltip={{
						content: localize('ethereal-plane.settings.allow-api.Hint'),
						position: 'left',
						autoPosition: true,
						align: 'center',
						style: { backgroundColor: 'white', color: 'black' },
					}}
				>
					<input bind:checked={$allowAPI} type='checkbox' />
				</div>
				<span>{localize('ethereal-plane.ui.reconnect')}</span>
				<div>
					<button
						on:click={() => {
							Hooks.call('ethereal-plane.reconnect');
						}}><i class='fa-solid fa-arrows-rotate'></i></button
					>
				</div>
			</section>
		</CollapsibleSection>
		{#if $mode === Modes.patreon || $mode === Modes.localchat}
			<CollapsibleSection
				collapsed={false}
				title={localize('ethereal-plane.ui.hosted-tab')}
			>
				<PatreonConfig />
			</CollapsibleSection>
		{/if}

		{#if $mode === Modes.localonly || $mode === Modes.localchat}
			<CollapsibleSection
				collapsed={false}
				title={localize('ethereal-plane.ui.local-tab')}
			>
				<section class='settings'>
					<span>{localize(`ethereal-plane.settings.server-url.Name`)}</span>
					<input type='text' bind:value={$serverUrl} />
					{#if $mode === Modes.localonly}
						<span>{localize('ethereal-plane.settings.polls-enabled.Name')}</span
						>
						<input bind:checked={$pollsEnabled} type='checkbox' />
					{/if}
				</section>
			</CollapsibleSection>
		{/if}
	</main>
</ApplicationShell>

<style lang='stylus'>
  .settings
    display: grid
    grid-template-columns: min-content auto
    row-gap: 5px
    column-gap: 2px
    text-align: center
    vertical-align: middle
    white-space: nowrap

    span
      padding-top: 5px

    input
      justify-self: right

    div
      justify-self: right

    textarea
      resize: vertical

</style>

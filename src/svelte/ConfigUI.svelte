<svelte:options accessors={true} />

<script lang='ts'>
	import { ApplicationShell } from '#runtime/svelte/component/application';
	import { localize } from '#runtime/util/i18n';
	import { tooltip } from '@svelte-plugins/tooltips';
	import { chatStatus, pollStatus, triggerStatus } from '../server/status.ts';
	import { settings } from '../utils/settings.ts';
	import CollapsibleSection from './components/CollapsibleSection.svelte';
	import InfoBox from './components/InfoBox.svelte';
	import PatreonConfig from './components/PatreonConfig.svelte';
	import StatusIcon from './components/StatusIcon.svelte';

	const sendRollsToChat = settings.getStore<boolean>('send-rolls-to-chat');
	const chatMessageTemplate = settings.getStore<string>('chat-message-template');
	const moduleEnabled = settings.getStore<boolean>('enabled');
	const allowSocket = settings.getStore<boolean>('allow-socket');
	const allowAPI = settings.getStore<boolean>('allow-api');

	export let elementRoot = void 0;
</script>

<ApplicationShell bind:elementRoot={elementRoot}>
	<main>

		<CollapsibleSection
			collapsed={false}
			title={localize('ethereal-plane.ui.status')}
		>
			<section>
				{#if !$moduleEnabled}
					<InfoBox variant='error'>
						{localize('ethereal-plane.strings.disabled')}
					</InfoBox>
				{/if}
				<div class='status'>
					<span>{localize('ethereal-plane.ui.poll-status')}</span>
					<span class='status-text'>{localize(`ethereal-plane.ui.${$pollStatus}`)}</span>
					<StatusIcon status={$pollStatus} />
				</div>
				<div class='status'>
					<span>{localize('ethereal-plane.ui.chat-status')}</span>
					<span class='status-text'>{localize(`ethereal-plane.ui.${$chatStatus}`)}</span>
					<StatusIcon status={$chatStatus} />
				</div>
				<div class='status'>
					<span>{localize('ethereal-plane.ui.trigger-status')}</span>
					<span class='status-text'>{localize(`ethereal-plane.ui.${$triggerStatus}`)}</span>
					<StatusIcon status={$triggerStatus} />
				</div>
			</section>
		</CollapsibleSection>
		<CollapsibleSection
			collapsed={false}
			title={localize('ethereal-plane.ui.general-tab')}
		>
			<section class='settings'>
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
		<CollapsibleSection
			collapsed={false}
			title={localize('ethereal-plane.ui.hosted-tab')}
		>
			<PatreonConfig />
		</CollapsibleSection>
	</main>
</ApplicationShell>

<style lang='scss'>
  .settings {
		display: grid;
		grid-template-columns: min-content auto;
		row-gap: 5px;
		column-gap: 2px;
		text-align: center;
		vertical-align: middle;
		white-space: nowrap;
	}
    span {
			padding-top: 5px;
		}
    input {
			justify-self: right;
		}

    div {
			justify-self: right;
		}

    textarea {
			resize: vertical;
		}

		.status-text {
			text-align: right;
		}

		.status {
			width: 100%;
			display: grid;
			grid-template-columns: auto 70px 25px;
			grid-gap: 10px;
		}
</style>

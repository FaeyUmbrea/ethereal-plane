<svelte:options runes={true} />

<script lang='ts'>
	import { chatStatus, pollStatus, triggerStatus } from '../server/status.ts';
	import { settings } from '../utils/settings.ts';
	import CollapsibleSection from './components/CollapsibleSection.svelte';
	import InfoBox from './components/InfoBox.svelte';
	import PatreonConfig from './components/PatreonConfig.svelte';
	import StatusIcon from './components/StatusIcon.svelte';

	const sendRollsToChat = settings.getStore('send-rolls-to-chat');
	const chatMessageTemplate = settings.getStore('chat-message-template');
	const moduleEnabled = settings.getStore('enabled');
	const allowSocket = settings.getStore('allow-socket');
	const allowAPI = settings.getStore('allow-api');
</script>

<main>

	<CollapsibleSection
		collapsed={false}
		title={game.i18n?.localize('ethereal-plane.ui.status')}
	>
		<section>
			{#if !$moduleEnabled}
				<InfoBox variant='error'>
					{game.i18n?.localize('ethereal-plane.strings.disabled')}
				</InfoBox>
			{/if}
			<div class='status'>
				<span>{game.i18n?.localize('ethereal-plane.ui.poll-status')}</span>
				<span class='status-text'>{game.i18n?.localize(`ethereal-plane.ui.${$pollStatus}`)}</span>
				<StatusIcon status={pollStatus} />
			</div>
			<div class='status'>
				<span>{game.i18n?.localize('ethereal-plane.ui.chat-status')}</span>
				<span class='status-text'>{game.i18n?.localize(`ethereal-plane.ui.${$chatStatus}`)}</span>
				<StatusIcon status={chatStatus} />
			</div>
			<div class='status'>
				<span>{game.i18n?.localize('ethereal-plane.ui.trigger-status')}</span>
				<span class='status-text'>{game.i18n?.localize(`ethereal-plane.ui.${$triggerStatus}`)}</span>
				<StatusIcon status={triggerStatus} />
			</div>
		</section>
	</CollapsibleSection>
	<CollapsibleSection
		collapsed={false}
		title={game.i18n?.localize('ethereal-plane.ui.general-tab')}
	>
		<section class='settings'>
			<span
			>{game.i18n?.localize('ethereal-plane.settings.send-rolls-to-chat.Name')}</span
			>
			<input bind:checked={$sendRollsToChat} type='checkbox' />
			{#if $sendRollsToChat}
				<span
				>{game.i18n?.localize(
					'ethereal-plane.settings.chat-message-template.Name',
				)}</span
				>
				<textarea bind:value={$chatMessageTemplate}></textarea>
			{/if}
			<span>{game.i18n?.localize('ethereal-plane.settings.allow-socket.Name')}</span>
			<div>
				<input bind:checked={$allowSocket} type='checkbox' />
			</div>
			<span>{game.i18n?.localize('ethereal-plane.settings.allow-api.Name')}</span>
			<div>
				<input bind:checked={$allowAPI} type='checkbox' />
			</div>
			<span>{game.i18n?.localize('ethereal-plane.ui.reconnect')}</span>
			<div>
				<button
					aria-label='reconnect'
					onclick={() => {
						Hooks.call('ethereal-plane.reconnect');
					}}><i class='fa-solid fa-arrows-rotate'></i></button
				>
			</div>
		</section>
	</CollapsibleSection>
	<CollapsibleSection
		collapsed={false}
		title={game.i18n?.localize('ethereal-plane.ui.hosted-tab')}
	>
		<PatreonConfig />
	</CollapsibleSection>
</main>

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

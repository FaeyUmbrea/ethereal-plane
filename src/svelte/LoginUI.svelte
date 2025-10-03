<svelte:options runes={true} />

<script lang='ts'>
	import type LoginApplication from '../applications/loginApplication.ts';
	import { QRCode } from '@castlenine/svelte-qrcode';
	import { onDestroy } from 'svelte';

	const { foundryApp }: { foundryApp: LoginApplication } = $props();

	const hook = Hooks.on('ethereal-plane.patreon-logged-in', close);

	async function close() {
		await foundryApp.close();
	}

	async function copy() {
		await navigator.clipboard.writeText(foundryApp.uri);
		ui.notifications?.info(
			`${game.i18n?.localize('ethereal-plane.strings.notification-prefix')}${game.i18n?.localize('ethereal-plane.notifications.login-copy')}`,
		);
	}

	onDestroy(() => {
		Hooks.off('ethereal-plane.patreon-logged-in', hook);
	});
</script>

<main>
	<div class='text'>
		<span>
			{game.i18n?.localize('ethereal-plane.ui.login.device-code')}:&nbsp;<code
				class='user-code'>{foundryApp.user_code}</code
			>.
		</span>
		<span>
			{game.i18n?.localize('ethereal-plane.ui.login.hint1')}
		</span>
		<span>
			{game.i18n?.localize('ethereal-plane.ui.login.hint2')}
		</span>
	</div>
	<div class='QR'>
		<QRCode data={foundryApp.uri} />
	</div>
	<div class='buttons'>
		<button
			onclick={() => {
				window.open(
					foundryApp.uri,
					'_blank',
					'location=yes,height=570,width=520,scrollbars=yes,status=yes',
				);
			}}
		>
			{game.i18n?.localize('ethereal-plane.ui.open')}
		</button>
		<button onclick={copy}>{game.i18n?.localize('ethereal-plane.ui.copy')}</button>
		<button onclick={close}>{game.i18n?.localize('ethereal-plane.ui.cancel')}</button>
	</div>
</main>

<style lang='scss'>
  button {
		width: 100%;
		height: 35px;
	}
  .user-code {
		background-color: black;
		padding-left: 2px;
		padding-right: 2px;
		color: white;
		border-radius: 4px;
	}

  .text {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

  .buttons {
		padding-top: 4px;
		display: flex;
	}
  .QR {
		display: flex;
		justify-content: center;
	}
</style>

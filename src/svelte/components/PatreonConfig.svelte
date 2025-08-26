<script lang='ts'>
	import type { MinimalWritable } from '#runtime/svelte/store/util';
	import type { ModuleConfig } from '../../utils/types.ts';
	import { localize } from '#runtime/util/i18n';
	import { tooltip } from '@svelte-plugins/tooltips';
	import { onDestroy, onMount } from 'svelte';
	import { fetchFeatures } from '../../server/patreon.js';
	import { disconnectClient } from '../../server/patreon_auth.ts';
	import { FRONTEND_URL } from '../../utils/const.js';
	import { settings } from '../../utils/settings.ts';
	import InfoBox from './InfoBox.svelte';

	const key = settings.getStore('authentication-token');
	const pollsEnabled = settings.getStore('polls-enabled') as MinimalWritable<boolean> | undefined;
	const moduleEnabled = settings.getStore('enabled');

	let clientIdExists = false;
	foundry.utils
		.fetchWithTimeout(
			`${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
		)
		.then(async (v) => {
			clientIdExists = !!(await v.text());
		});

	let features: ModuleConfig;

	onMount(async () => {
		features = await fetchFeatures();
	});

	function login() {
		Hooks.call('ethereal-plane.patreon-login');
	}

	function connect() {
		Hooks.call('ethereal-plane.patreon-connect');
	}

	function logout() {
		Hooks.call('ethereal-plane.patreon-logout');
	}

	async function disconnect() {
		await disconnectClient();
	}

	async function refreshClient() {
		clientIdExists = !!(await (
			await foundry.utils.fetchWithTimeout(
				`${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
			)
		).text());
	}

	async function open_patreon_site(path = '') {
		window.open(FRONTEND_URL + path, '_blank');
	}

	const hook1 = Hooks.on('ethereal-plane.patreon-connected', refreshClient);

	const hook2 = Hooks.on('ethereal-plane.patreon-disconnected', refreshClient);

	onDestroy(() => {
		Hooks.off('ethereal-plane.patreon-connected', hook1);
		Hooks.off('ethereal-plane.patreon-disconnected', hook2);
	});

	let youtubeID: string;

	const ytRegex = /(.*?)(^|\/|v=)([\w-]{11})(.*)/i;

	function setYoutubeID() {
		const id = youtubeID.match(ytRegex);
		if (id === null) {
			return;
		}
		youtubeID = id.length >= 4 ? id[3] : '';
		if (youtubeID) {
			Hooks.call('ethereal-plane.set-youtube-id', youtubeID);
		}
	}
</script>

{#if clientIdExists}
	{#if !!$key}
		<div class='buttons'>
			<button on:click={() => open_patreon_site('')}
			>{localize('ethereal-plane.strings.profile')}<i
				class='fas fa-wrench valignmid'
			></i></button
			>
			<button on:click={logout}
			>{localize('ethereal-plane.strings.log-out')}</button
			>
		</div>
		{#if $moduleEnabled}
			{#if features?.features.poll?.includes('editors')}
				<hr />
				<section class='settings'>
					<span>{localize('ethereal-plane.settings.polls-enabled.Name')}</span>
					<input bind:checked={$pollsEnabled} type='checkbox' />
				</section>
			{/if}

			{#if features?.providers.includes('google')}
				<section class='settings'>
					<span>{localize('ethereal-plane.strings.youtube-id')}</span>
					<div
						class='buttonbox'
						use:tooltip={{
							content: localize('ethereal-plane.strings.youtube-id-hint'),
							position: 'top',
							autoPosition: true,
							align: 'center',
							// @ts-expect-error why tho
							style: { backgroundColor: 'white', color: 'black' },
						}}
					>
						<input
							bind:value={youtubeID}
							type='text'
							placeholder={localize(
								'ethereal-plane.strings.youtube-id-placeholder',
							)}
						/>
						<button on:click={setYoutubeID}
						><i class='fas fa-save'></i></button
						>
					</div>
				</section>
			{/if}
		{/if}
		<InfoBox variant='info'>
			<span>{localize('ethereal-plane.strings.youtube')} </span><a
				href='https://www.youtube.com/t/terms'
			>{localize('ethereal-plane.strings.tos')}</a
			><br />
			<span>{localize('ethereal-plane.strings.twitch')} </span><a
				href='https://www.twitch.tv/p/terms-of-service'
			>{localize('ethereal-plane.strings.tos')}</a
			><br />
		</InfoBox>
	{:else}
		<InfoBox variant='error'>
			<span>{localize('ethereal-plane.strings.patreon-logged-out')}</span><br />
			<span>{localize('ethereal-plane.strings.accept-text')}</span><a
				href='https://github.com/FaeyUmbrea/ethereal-plane/blob/main/TERM_OF_USE.md'
			>{localize('ethereal-plane.strings.tos')}</a
			>
			&
			<a
				href='https://github.com/FaeyUmbrea/ethereal-plane/blob/main/PRIVACY_POLICY.md'
			>{localize('ethereal-plane.strings.privacy-policy')}</a
			>
		</InfoBox>
		<button on:click={login}
		>{localize('ethereal-plane.strings.log-in')}
		</button>

		<button on:click={disconnect}
		>{localize('ethereal-plane.strings.disconnect')}
		</button>
	{/if}
{:else}
	<InfoBox variant='info'>
		<span>{localize('ethereal-plane.strings.account-setup-reminder')}</span><br
		/>
	</InfoBox>
	<InfoBox variant='error'>
		<span>{localize('ethereal-plane.strings.patreon-logged-out')}</span><br />
		<span>{localize('ethereal-plane.strings.accept-text')}</span><a
			href='https://github.com/FaeyUmbrea/ethereal-plane/blob/main/TERM_OF_USE.md'
		>{localize('ethereal-plane.strings.tos')}</a
		>
		&
		<a
			href='https://github.com/FaeyUmbrea/ethereal-plane/blob/main/PRIVACY_POLICY.md'
		>{localize('ethereal-plane.strings.privacy-policy')}</a
		>
	</InfoBox>
	<button on:click={() => open_patreon_site()}
	>{localize('ethereal-plane.strings.account-setup')}</button
	>
	<button on:click={connect}
	>{localize('ethereal-plane.strings.connect')}
	</button>
{/if}

<style lang='scss'>
  button {
		width: 100%;
		height: 35px;
	}
  a {
		color: darkred;
	}
  .buttons {
		display: flex;
		button {
			i {
				font-size: 18px;
			}
		}
	}

  .orange {
		color: #f96854;
	}

  .valignmid {
		vertical-align: text-top;
	}
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
    .buttonbox {
			display: flex;

			button {
				width: 27px;
				height: 27px;
				padding-top: 0;
			}
		}

</style>

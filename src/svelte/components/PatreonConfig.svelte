<script>
  import InfoBox from './InfoBox.svelte';
  import { localize } from '@typhonjs-fvtt/runtime/svelte/helper';

  export let settings = void 0;
  const key = settings.getStore('authentication-token');
  const features = settings.getStore('available-features');
  const status = settings.getStore('patreon-status');
  const mode = settings.getStore('mode');
  const pollsEnabled = settings.getStore('polls-enabled');

  function login() {
    Hooks.call('ethereal-plane.patreon-login');
  }

  function logout() {
    Hooks.call('ethereal-plane.patreon-logout');
  }

  function connectTwitch() {
    Hooks.call('ethereal-plane.twitch-connect');
  }

  function disconnectTwitch() {
    Hooks.call('ethereal-plane.twitch-disconnect');
  }

  function customTwitchLogin() {
    Hooks.call('ethereal-plane.custom-twitch-login');
  }

  function customTwitchLogout() {
    Hooks.call('ethereal-plane.custom-twitch-logout');
  }
</script>

{#if !!$key}
  <div class="buttons">
    <button on:click={logout}>Log out&nbsp;<i class="fa-brands fa-patreon orange" /></button>
    {#if $features.includes('twitch-bot')}
      {#if !$status.twitch}
        <button on:click={connectTwitch}>Connect&nbsp;<i class="fa-brands fa-twitch purple" /></button>
      {:else}
        <button on:click={disconnectTwitch}>Disconnect&nbsp;<i class="fa-brands fa-twitch purple" /></button>
      {/if}
    {/if}
    {#if $features.includes('custom-twitch-bot') && $mode === 'patreon'}
      {#if !$status.customTwitchBot}
        <button on:click={customTwitchLogin}>Log In&nbsp;<i class="fas fa-robot purple" /></button>
      {:else}
        <button on:click={customTwitchLogout}>Log out&nbsp;<i class="fas fa-robot purple" /></button>
      {/if}
    {/if}
  </div>
  <InfoBox variant={$status.twitch ? 'ok' : 'info'}>
    <span>{$status.twitch ? 'All good!' : 'Please connect to twitch so we know where to send your bot.'}</span>
  </InfoBox>

  {#if $features.includes('twitch-polls')}
    <hr />
    <section class="settings">
      <span>{localize('ethereal-plane.settings.polls-enabled.Name')}</span>
      <input bind:checked={$pollsEnabled} type="checkbox" />
    </section>
  {/if}
{:else}
  <button on:click={login}>Log in&nbsp;<i class="fa-brands fa-patreon orange" /></button>
  <InfoBox variant="error">
    <span>You need to log in!</span>
  </InfoBox>
{/if}

<style lang="sass">
  .buttons
    display: flex

  .green
    color: green

  .purple
    color: #6441a5

  .orange
    color: #f96854

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
</style>
<script>
  import InfoBox from './InfoBox.svelte';
  import { localize } from '@typhonjs-fvtt/runtime/svelte/helper';
  import { tooltip } from '@svelte-plugins/tooltips';

  export let settings = void 0;
  const key = settings.getStore('authentication-token');
  const features = settings.getStore('available-features');
  const status = settings.getStore('patreon-status');
  const mode = settings.getStore('mode');
  const pollsEnabled = settings.getStore('polls-enabled');
  const moduleEnabled = settings.getStore('enabled');

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

  function connectYoutube() {
    Hooks.call('ethereal-plane.youtube-connect');
  }

  function disconnectYoutube() {
    Hooks.call('ethereal-plane.youtube-disconnect');
  }

  function customTwitchLogin() {
    Hooks.call('ethereal-plane.custom-twitch-login');
  }

  function customTwitchLogout() {
    Hooks.call('ethereal-plane.custom-twitch-logout');
  }

  /**
   * @type {string}
   */
  let youtubeID;

  const ytRegex = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i;

  function setYoutubeID() {
    const id = youtubeID.match(ytRegex);
    youtubeID = id.length >= 4 ? id[3] : '';
    if (youtubeID) {
      Hooks.call('ethereal-plane.set-youtube-id', youtubeID);
    }
  }
</script>

{#if !!$key}
  <div class="buttons">
    <button on:click={logout}
      >{localize('ethereal-plane.strings.log-out')}&nbsp;<i class="fa-brands fa-patreon orange" /></button
    >
    {#if $features.includes('twitch-bot') && (!$status.youtube || $status.twitch)}
      {#if !$status.twitch}
        <button on:click={connectTwitch}
          >{localize('ethereal-plane.strings.connect')}&nbsp;<i class="fa-brands fa-twitch purple" /></button
        >
      {:else}
        <button on:click={disconnectTwitch}
          >{localize('ethereal-plane.strings.disconnect')}&nbsp;<i class="fa-brands fa-twitch purple" /></button
        >
      {/if}
    {/if}
    {#if $features.includes('custom-twitch-bot') && $mode === 'patreon' && ($status.customTwitchBot || $status.twitch)}
      {#if !$status.customTwitchBot}
        <button on:click={customTwitchLogin}
          >{localize('ethereal-plane.strings.log-in')}&nbsp;<i class="fas fa-robot purple" /></button
        >
      {:else}
        <button on:click={customTwitchLogout}
          >{localize('ethereal-plane.strings.log-out')}&nbsp;<i class="fas fa-robot purple" /></button
        >
      {/if}
    {/if}
    {#if $features.includes('youtube-chat') && ($status.youtube || !$status.twitch)}
      {#if !$status.youtube}
        <button on:click={connectYoutube}
          >{localize('ethereal-plane.strings.connect')}&nbsp;<i class="fa-brands fa-youtube red" /></button
        >
      {:else}
        <button on:click={disconnectYoutube}
          >{localize('ethereal-plane.strings.disconnect')}&nbsp;<i class="fa-brands fa-youtube red" /></button
        >
      {/if}
    {/if}
  </div>
  <InfoBox variant={$status.twitch || $status.youtube ? 'ok' : 'info'}>
    <span
      >{$status.twitch || $status.youtube
        ? localize(`ethereal-plane.strings.patreon-ok`)
        : localize(`ethereal-plane.strings.patreon-disconnected`)}</span
    >
  </InfoBox>
  {#if $moduleEnabled}
    {#if $features.includes('twitch-polls') || $features.includes('youtube-polls')}
      <hr />
      <section class="settings">
        <span>{localize('ethereal-plane.settings.polls-enabled.Name')}</span>
        <input bind:checked={$pollsEnabled} type="checkbox" />
      </section>
    {/if}

    {#if $status.youtube}
      <section class="settings">
        <span>{localize('ethereal-plane.strings.youtube-id')}</span>
        <div
          class="buttonbox"
          use:tooltip={{
            content: localize('ethereal-plane.strings.youtube-id-hint'),
            position: 'top',
            autoPosition: true,
            align: 'center',
            style: { backgroundColor: 'white', color: 'black' },
          }}
        >
          <input
            bind:value={youtubeID}
            type="text"
            placeholder={localize('ethereal-plane.strings.youtube-id-placeholder')}
          />
          <button on:click={setYoutubeID}><i class="fas fa-save" /></button>
        </div>
      </section>
    {/if}
  {/if}
{:else}
  <button on:click={login}
    >{localize('ethereal-plane.strings.log-in')}&nbsp;<i class="fa-brands fa-patreon orange" />
  </button>
  <InfoBox variant="error">
    <span>{localize('ethereal-plane.strings.patreon-logged-out')}</span>
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

  .red
    color: #FF0000

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

    .buttonbox
      display: flex

      button
        width: 27px
        height: 27px
        padding-top: 0

</style>

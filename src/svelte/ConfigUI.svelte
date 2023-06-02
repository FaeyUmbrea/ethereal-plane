<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/core';
  import { setSetting } from '../utils/settings.ts';
  import { localize } from '@typhonjs-fvtt/runtime/svelte/helper';
  import { Modes } from '../utils/const.ts';
  import CollapsibleSection from './components/CollapsibleSection.svelte';

  export let settings = void 0;
  const key = settings.getStore('authentication-token');
  const features = settings.getStore('available-features');
  const mode = settings.getStore('mode');
  const modes = Object.values(Modes);
  const serverUrl = settings.getStore('server-url');

  export let elementRoot = void 0;

  function login() {
    Hooks.call('ethereal-plane.patreon-login');
  }

  function logout() {
    key.set('');
    setSetting('refresh-token', '');
  }
</script>

<ApplicationShell bind:elementRoot>
  <main>
    <select bind:value={$mode} name="mode">
      {#each modes as choice}
        <option value={choice}>{localize(`ethereal-plane.settings.mode.${choice}`)}</option>
      {/each}
    </select>
    {#if $mode === Modes.patreon || $mode === Modes.localchat}
      <CollapsibleSection title="Patreon">
        Status:
        {#if !!$key} <span class="green">Logged in!</span> {:else} Logged out!{/if}

        {#if !!$key}
          <br />
          Available Features:
          {#each $features as feature}
            <br />
            {localize('ethereal-plane.feature-names.' + feature)}
          {/each}
          <button on:click={logout}>Log out</button>
        {:else}
          <button on:click={login}>Log in with Patreon&nbsp;<i class="fa-brands fa-patreon orange" /></button>
        {/if}
      </CollapsibleSection>
    {/if}

    {#if $mode === Modes.localonly || $mode === Modes.localchat}
      <CollapsibleSection title="Local Server">
        <input type="text" bind:value={$serverUrl} />
      </CollapsibleSection>
    {/if}
  </main>
</ApplicationShell>

<style lang="sass">
  .green
    color: green

  .orange
    color: #f96854
</style>

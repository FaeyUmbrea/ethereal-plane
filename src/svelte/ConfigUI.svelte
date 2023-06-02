<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/core';
  import { setSetting } from '../utils/settings.ts';
  import { localize } from '@typhonjs-fvtt/runtime/svelte/helper';

  export let settings = void 0;
  const key = settings.getStore('authentication-token');
  const features = settings.getStore('available-features');

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
    Status:
    {#if !!$key} <span class="green">Logged in!</span>{:else} Logged out!{/if}
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
  </main>
</ApplicationShell>

<style lang="sass">
  .green
    color: green

  .orange
    color: #f96854
</style>

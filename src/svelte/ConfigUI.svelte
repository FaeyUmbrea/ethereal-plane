<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/core';
  import { setSetting, settings } from '../utils/settings.js';
  import { patreon } from '../utils/patreon.js';

  const key = settings.getStore('authentication-token');

  export let elementRoot = void 0;

  function login() {
    patreon.login();
  }

  function logout() {
    key.set('');
    setSetting('refresh-token', '');
  }
</script>

<ApplicationShell bind:elementRoot>
  <main>
    Status:
    {#if !!$key} Logged in!{:else} Logged out!{/if}
    {#if !!$key}
      <button on:click={logout}>Log out</button>
    {:else}
      <button on:click={login}>Log in with Patreon&nbsp;<i class="fa-brands fa-patreon orange" /></button>
    {/if}
  </main>
</ApplicationShell>

<style lang="sass">
  .orange
    color: #f96854
</style>

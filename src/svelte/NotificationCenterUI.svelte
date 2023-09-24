<svelte:options accessors="{true}" />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import notifications from "../utils/notifications.json";
  import CollapsibleSection from "./components/CollapsibleSection.svelte";
  import { onDestroy } from "svelte";
  import { setSetting } from "../utils/settings.js";

  export let elementRoot = void 0;

  function openLink(uri) {
    window.open(uri, "_blank").focus();
  }

  onDestroy(() => {
    setSetting("last-read-notification", notifications[0].id);
  });
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <main>
    {#each notifications as notification, index}
      <CollapsibleSection
        title="{notification.title}"
        collapsed="{!(index <= 0)}"
      >
        <div class="news">
          {#each notification.text as block}
            <p>{block}</p>
          {/each}
          <br />
          {#if notification.link}
            {#each notification.link as { url, title }}
              <button on:click="{() => openLink(url)}">{title}</button>
            {/each}
          {/if}
        </div>
      </CollapsibleSection>
    {/each}
  </main>
</ApplicationShell>

<style lang="stylus">
  .news
    font-size: 17px
</style>

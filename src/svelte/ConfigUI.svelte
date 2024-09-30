<svelte:options accessors="{true}" />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
  import { Modes } from "../utils/const.js";
  import { getStore } from "../utils/settings.js";
  import CollapsibleSection from "./components/CollapsibleSection.svelte";
  import PatreonConfig from "./components/PatreonConfig.svelte";
  import InfoBox from "./components/InfoBox.svelte";
  import { tooltip } from "@svelte-plugins/tooltips";

  const mode = getStore("mode");
  const modes = Object.values(Modes);
  const serverUrl = getStore("server-url");
  const sendRollsToChat = getStore("send-rolls-to-chat");
  const chatMessageTemplate = getStore("chat-message-template");
  const pollsEnabled = getStore("polls-enabled");
  const moduleEnabled = getStore("enabled");
  const allowSocket = getStore("allow-socket");
  const allowAPI = getStore("allow-api");

  export let elementRoot = void 0;
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <main>
    {#if !$moduleEnabled}
      <InfoBox variant="error">
        {localize("ethereal-plane.strings.disabled")}
      </InfoBox>
    {/if}
    <CollapsibleSection
      collapsed="{false}"
      title="{localize('ethereal-plane.ui.general-tab')}"
    >
      <section class="settings">
        <span>{localize(`ethereal-plane.settings.mode.Name`)}</span>
        <select bind:value="{$mode}" name="mode">
          {#each modes as choice}
            <option value="{choice}"
              >{localize(`ethereal-plane.settings.mode.${choice}`)}</option
            >
          {/each}
        </select>
        <span
          >{localize("ethereal-plane.settings.send-rolls-to-chat.Name")}</span
        >
        <input bind:checked="{$sendRollsToChat}" type="checkbox" />
        {#if $sendRollsToChat}
          <span
            >{localize(
              "ethereal-plane.settings.chat-message-template.Name",
            )}</span
          >
          <textarea bind:value="{$chatMessageTemplate}"></textarea>
        {/if}
        <span>{localize("ethereal-plane.settings.allow-socket.Name")}</span>
        <div
          use:tooltip="{{
            content: localize('ethereal-plane.settings.allow-socket.Hint'),
            position: 'left',
            autoPosition: true,
            align: 'center',
            style: { backgroundColor: 'white', color: 'black' },
          }}"
        >
          <input bind:checked="{$allowSocket}" type="checkbox" />
        </div>
        <span>{localize("ethereal-plane.settings.allow-api.Name")}</span>
        <div
          use:tooltip="{{
            content: localize('ethereal-plane.settings.allow-api.Hint'),
            position: 'left',
            autoPosition: true,
            align: 'center',
            style: { backgroundColor: 'white', color: 'black' },
          }}"
        >
          <input bind:checked="{$allowAPI}" type="checkbox" />
        </div>
      </section>
    </CollapsibleSection>
    {#if $mode === Modes.patreon || $mode === Modes.localchat}
      <CollapsibleSection
        collapsed="{false}"
        title="{localize('ethereal-plane.ui.hosted-tab')}"
      >
        <PatreonConfig />
      </CollapsibleSection>
    {/if}

    {#if $mode === Modes.localonly || $mode === Modes.localchat}
      <CollapsibleSection
        collapsed="{false}"
        title="{localize('ethereal-plane.ui.local-tab')}"
      >
        <section class="settings">
          <span>{localize(`ethereal-plane.settings.server-url.Name`)}</span>
          <input type="text" bind:value="{$serverUrl}" />
          {#if $mode === Modes.localonly}
            <span>{localize("ethereal-plane.settings.polls-enabled.Name")}</span
            >
            <input bind:checked="{$pollsEnabled}" type="checkbox" />
          {/if}
        </section>
      </CollapsibleSection>
    {/if}
  </main>
</ApplicationShell>

<style lang="stylus">
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

    div
      justify-self: right

    textarea
      resize: vertical


</style>

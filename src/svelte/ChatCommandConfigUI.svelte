<svelte:options accessors="{true}" />

<script>
  import { setSetting, settings } from "../utils/settings.js";
  import ChatCommandConfig from "./components/ChatCommandConfig.svelte";
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { ChatCommand } from "../utils/chatCommands.js";
  import { getContext } from "svelte";

  /**
   * @type {SvelteStore<ChatCommand[]>}
   */
  const commands = settings.getStore("chat-commands");
  export let elementRoot = void 0;

  function add() {
    const commandArray = $commands;
    commandArray.push(new ChatCommand());
    $commands = commandArray;
  }

  const context = getContext("#external");

  async function close() {
    await setSetting("chat-commands", $commands);
    context.application.close();
  }

  async function remove(index) {
    const commandArray = $commands;
    commandArray.splice(index, 1);
    $commands = commandArray;
  }
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <main>
    <div class="command-section">
      <span class="config">Base Config</span>
      <span class="cooldown">Cooldown (seconds)</span>
      <span class="macro"></span>
      <span></span>
      <span>Active</span>
      <span>Name</span>
      <span>Template</span>
      <span>User</span>
      <span>Target</span>
      <span>Target identifier</span>
      <span class="macro">Macro</span>
      <span></span>
      {#each $commands as command, index}
        <ChatCommandConfig bind:command="{command}" index="{index}"
        ></ChatCommandConfig>
        <button on:click="{() => remove(index)}"
          ><i class="fas fa-trash"></i></button
        >
      {/each}
    </div>
    <hr />
    <div class="footer">
      <button class="add" on:click="{add}"><i class="fas fa-plus"></i></button>
      <button on:click="{close}">Save</button>
    </div>
  </main>
</ApplicationShell>

<style lang="stylus">
  .footer
    display grid
    grid-template-columns 35px auto
    grid-column-gap 3px

  .add
    width 35px

  .command-section
    height calc(100% - 50px)
    display grid
    grid-template-columns 40px 2fr 3fr 40px 40px 3fr 40px 35px
    grid-template-rows 15px 20px
    grid-auto-rows 35px;

  .title
    grid-column 1 / span 7

  span
    text-align center
    border-left 1px solid grey

  .config
    grid-column 1 / 4

  .cooldown
    grid-column 4 / 7
</style>

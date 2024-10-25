<svelte:options accessors="{true}" />

<script>
  import { ApplicationShell } from "#runtime/svelte/component/application";
  import { QRCode } from "@castlenine/svelte-qrcode";
  import { getContext, onDestroy } from "svelte";
  import { localize } from "#runtime/util/i18n";

  export let user_code;
  export let uri;
  export let elementRoot = void 0;

  const hook = Hooks.on("ethereal-plane.patreon-logged-in", close);

  const context = getContext("#external");

  async function close() {
    context.application.close();
  }

  async function copy() {
    await navigator.clipboard.writeText(uri);
    ui.notifications?.info(
      `Ethereal Plane | ${localize("ethereal-plane.notifications.login-copy")}`,
    );
  }

  onDestroy(() => {
    Hooks.off("ethereal-plane.patreon-logged-in", hook);
  });
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <main>
    <div class="text">
      <span>
        {localize("ethereal-plane.ui.login.device-code")}:&nbsp;<code
          class="user-code">{user_code}</code
        >.
      </span>
      <span>
        {localize("ethereal-plane.ui.login.hint1")}
      </span>
      <span>
        {localize("ethereal-plane.ui.login.hint2")}
      </span>
    </div>
    <div class="QR">
      <QRCode data="{uri}" />
    </div>
    <div class="buttons">
      <button
        on:click="{() => {
          window.open(
            uri,
            '_blank',
            'location=yes,height=570,width=520,scrollbars=yes,status=yes',
          );
        }}"
      >
        {localize("ethereal-plane.ui.open")}
      </button>
      <button on:click="{copy}">{localize("ethereal-plane.ui.copy")}</button>
      <button on:click="{close}">{localize("ethereal-plane.ui.cancel")}</button>
    </div>
  </main>
</ApplicationShell>

<style lang="stylus">
  .user-code 
    background-color black
    padding-left 2px
    padding-right 2px
    color white
    border-radius 4px
    
  .text
    display flex
    flex-direction column
    gap 6px
  
  .buttons
    padding-top 4px
    display flex
    
  .QR
    display flex
    justify-content center
</style>

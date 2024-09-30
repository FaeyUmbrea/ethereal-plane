<svelte:options accessors="{true}" />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { QRCode } from "@castlenine/svelte-qrcode";
  import { getContext, onDestroy } from "svelte";

  export let user_code;
  export let uri;
  export let elementRoot = void 0;

  const hook = Hooks.on("ethereal-plane.patreon-logged-in", close);

  const context = getContext("#external");

  async function close() {
    context.application.close();
  }

  onDestroy(() => {
    Hooks.off("ethereal-plane.patreon-logged-in", hook);
  });
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <main>
    <div class="text">
      <span>
        The login Device Code is <code class="user-code">{user_code}</code>.
      </span>
      <span>
        Either press "Open" to open a log-in dialog directly, copy it and send
        it to another device, or scan the QR code.
      </span>
      <span>
        This window will automatically close when the login is complete.
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
        Open
      </button>
      <button> Copy </button>
      <button> Cancel </button>
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

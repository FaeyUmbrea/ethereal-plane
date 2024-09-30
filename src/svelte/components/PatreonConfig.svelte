<script>
  import InfoBox from "./InfoBox.svelte";
  import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
  import { tooltip } from "@svelte-plugins/tooltips";
  import { disconnectClient } from "../../server/patreon_auth.js";
  import { onDestroy } from "svelte";
  import { PATREON_URL } from "../../utils/const.js";
  import { getStore } from "../../utils/settings.js";

  const key = getStore("authentication-token");
  const pollsEnabled = getStore("polls-enabled");
  const moduleEnabled = getStore("enabled");

  let clientIdExists = false;
  foundry.utils
    .fetchWithTimeout(
      `${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
    )
    .then(async (v) => {
      clientIdExists = !!(await v.text());
    });

  let features = {
    youtube: false,
    polls: pollsEnabled,
  };

  fetchFeatures();

  function fetchFeatures() {
    if ($key === undefined || $key === "") return;

    fetch(`${PATREON_URL}api/v2/Features`, {
      headers: { Authorization: `Bearer ${$key}` },
    }).then(async (v) => {
      features = JSON.parse(await v.text());
    });
  }

  function login() {
    Hooks.call("ethereal-plane.patreon-login");
  }

  function connect() {
    Hooks.call("ethereal-plane.patreon-connect");
  }

  function logout() {
    Hooks.call("ethereal-plane.patreon-logout");
  }

  async function disconnect() {
    await disconnectClient();
  }

  async function refreshClient() {
    clientIdExists = !!(await (
      await foundry.utils.fetchWithTimeout(
        `${window.location.protocol}//${window.location.host}/modules/ethereal-plane/storage/client_id.txt`,
      )
    ).text());
  }

  async function open_patreon_site(path = "") {
    window.open(PATREON_URL + path, "_blank");
  }

  const hook1 = Hooks.on("ethereal-plane.patreon-connected", refreshClient);

  const hook2 = Hooks.on("ethereal-plane.patreon-disconnected", refreshClient);

  onDestroy(() => {
    Hooks.off("ethereal-plane.patreon-connected", hook1);
    Hooks.off("ethereal-plane.patreon-disconnected", hook2);
  });

  /**
   * @type {string}
   */
  let youtubeID;

  const ytRegex = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i;

  function setYoutubeID() {
    const id = youtubeID.match(ytRegex);
    youtubeID = id.length >= 4 ? id[3] : "";
    if (youtubeID) {
      Hooks.call("ethereal-plane.set-youtube-id", youtubeID);
    }
  }
</script>

{#if clientIdExists}
  {#if !!$key}
    <div class="buttons">
      <button on:click="{() => open_patreon_site('Account/Manage')}"
        >{localize("ethereal-plane.strings.profile")}</button
      >
      <button on:click="{logout}"
        >{localize("ethereal-plane.strings.log-out")}&nbsp;<i
          class="fa-brands fa-patreon orange valignmid"
        ></i></button
      >
    </div>
    {#if $moduleEnabled}
      {#if features.polls}
        <hr />
        <section class="settings">
          <span>{localize("ethereal-plane.settings.polls-enabled.Name")}</span>
          <input bind:checked="{$pollsEnabled}" type="checkbox" />
        </section>
      {/if}

      {#if features.youtube}
        <section class="settings">
          <span>{localize("ethereal-plane.strings.youtube-id")}</span>
          <div
            class="buttonbox"
            use:tooltip="{{
              content: localize('ethereal-plane.strings.youtube-id-hint'),
              position: 'top',
              autoPosition: true,
              align: 'center',
              style: { backgroundColor: 'white', color: 'black' },
            }}"
          >
            <input
              bind:value="{youtubeID}"
              type="text"
              placeholder="{localize(
                'ethereal-plane.strings.youtube-id-placeholder',
              )}"
            />
            <button on:click="{setYoutubeID}"
              ><i class="fas fa-save"></i></button
            >
          </div>
        </section>
      {/if}
    {/if}
    <InfoBox variant="info">
      <span>{localize("ethereal-plane.strings.youtube")} </span><a
        href="https://www.youtube.com/t/terms"
        >{localize("ethereal-plane.strings.tos")}</a
      ><br />
      <span>{localize("ethereal-plane.strings.twitch")} </span><a
        href="https://www.twitch.tv/p/terms-of-service"
        >{localize("ethereal-plane.strings.tos")}</a
      ><br />
    </InfoBox>
  {:else}
    <InfoBox variant="error">
      <span>{localize("ethereal-plane.strings.patreon-logged-out")}</span><br />
      <span>{localize("ethereal-plane.strings.accept-text")}</span><a
        href="https://github.com/FaeyUmbrea/ethereal-plane/blob/main/TERM_OF_USE.md"
        >{localize("ethereal-plane.strings.tos")}</a
      >
      &
      <a
        href="https://github.com/FaeyUmbrea/ethereal-plane/blob/main/PRIVACY_POLICY.md"
        >{localize("ethereal-plane.strings.privacy-policy")}</a
      >
    </InfoBox>
    <button on:click="{login}"
      >{localize("ethereal-plane.strings.log-in")}&nbsp;<i
        class="fa-brands fa-patreon orange"
      ></i>
    </button>

    <button on:click="{disconnect}"
      >{localize("ethereal-plane.strings.disconnect")}&nbsp;<i
        class="fa-brands fa-patreon orange"
      ></i>
    </button>
  {/if}
{:else}
  <InfoBox variant="info">
    <span>{localize("ethereal-plane.strings.account-setup-reminder")}</span><br
    />
  </InfoBox>
  <InfoBox variant="error">
    <span>{localize("ethereal-plane.strings.patreon-logged-out")}</span><br />
    <span>{localize("ethereal-plane.strings.accept-text")}</span><a
      href="https://github.com/FaeyUmbrea/ethereal-plane/blob/main/TERM_OF_USE.md"
      >{localize("ethereal-plane.strings.tos")}</a
    >
    &
    <a
      href="https://github.com/FaeyUmbrea/ethereal-plane/blob/main/PRIVACY_POLICY.md"
      >{localize("ethereal-plane.strings.privacy-policy")}</a
    >
  </InfoBox>
  <button on:click="{() => open_patreon_site()}"
    >{localize("ethereal-plane.strings.account-setup")}</button
  >
  <button on:click="{connect}"
    >{localize("ethereal-plane.strings.connect")}&nbsp;<i
      class="fa-brands fa-patreon orange"
    ></i>
  </button>
{/if}

<style lang="stylus">
  a
    color: darkred
  .buttons
    display: flex

    button
      i
        font-size 18px

  .orange
    color: #f96854

  .valignmid
    vertical-align text-top

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

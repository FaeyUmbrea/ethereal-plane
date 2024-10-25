<script>
  import { chatMessages } from "../stores/chatMessages.js";
  import ChatMessage from "./ChatMessage.svelte";
  import { afterUpdate } from "svelte";
  import { localize } from "#runtime/util/i18n";

  let element;

  afterUpdate(() => {
    if ($chatMessages) scrollToBottom(element);
  });

  $: if ($chatMessages && element) {
    scrollToBottom(element);
  }

  const scrollToBottom = async (node) => {
    node.scroll({ top: node.scrollHeight, behavior: "smooth" });
  };
</script>

<ol bind:this="{element}" class="ep-chat">
  <ChatMessage
    message="{localize('ethereal-plane.ui.chat-welcome')}"
    user="{localize('ethereal-plane.ui.system')}"
  />
  {#each $chatMessages as [user, message]}
    <ChatMessage user="{user}" message="{message}" />
  {/each}
</ol>
<div id="anchor"></div>

<style lang="stylus">
  .ep-chat
    overflow-anchor none
    height 100%
    margin 0
    padding 0
    overflow-x hidden
    overflow-y auto
    list-style none

  #anchor
    overflow-anchor auto
    height 1px
    min-height 1px
    max-height 1px

</style>

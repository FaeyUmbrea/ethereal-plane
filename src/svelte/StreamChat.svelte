<script>
  import { chatMessages } from './stores/chatMessages.ts';
  import ChatMessage from './ChatMessage.svelte';
</script>

<div class="ep-chat">
  <ChatMessage message="This is your stream chat! Messages will appear as they are posted" user="System" />
  {#each $chatMessages as [user, message]}
    <ChatMessage {user} {message} />
  {/each}
</div>
<div id="anchor" />

<style>
  .ep-chat {
    overflow-anchor: none;
  }

  .ep-chat * {
    overflow-anchor: none;
  }

  #anchor {
    overflow-anchor: auto;
    height: 1px;
    min-height: 1px;
    max-height: 1px;
  }
</style>

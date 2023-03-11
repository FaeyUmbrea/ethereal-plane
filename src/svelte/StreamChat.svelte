<script>
    import {chatMessages} from "./stores/chatMessages.js";
    import ChatMessage from "./ChatMessage.svelte";
    import {scrollTop} from "./stores/chatScroll.js";

    scrollTop.subscribe(() => {
        console.warn("Scroll");
    })

</script>

<div class="ep-chat">
    <ChatMessage user="System" message="This is your stream chat! Messages will appear as they are posted"/>
    {#each $chatMessages as [user, message]}
        <ChatMessage {user} {message}/>
    {/each}
</div>
<div id="anchor"></div>


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
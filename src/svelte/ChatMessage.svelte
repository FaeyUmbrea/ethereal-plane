<script>
    export let user;
    export let message;
</script>

<div class="chat-message message flexcol">
    <header class="message-header flexrow"><h4 class="message-sender">{user}</h4></header>
    <div id class="message-content">{message}</div>
</div>
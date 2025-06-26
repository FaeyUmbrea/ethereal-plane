<script lang='ts'>
	export let user;
	export let message;
</script>

<li class='chat-message message flexcol'>
	<header class='message-header flexrow'>
		<h4 class='message-sender'>{user}</h4>
	</header>
	<div class='message-content'>{message}</div>
</li>

<style lang='scss'>
  .chat-message {
		height: fit-content;
		min-height: fit-content;
		overflow-anchor: none;
	}
</style>

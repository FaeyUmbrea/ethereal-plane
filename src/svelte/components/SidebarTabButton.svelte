<script>
	export let icon;
	export let id;
	export let tooltip;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a class='item' data-tab={id} data-tooltip={tooltip}>
	<i class={icon}></i>
</a>

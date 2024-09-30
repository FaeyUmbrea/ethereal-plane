<svelte:options accessors="{true}" />

<script>
  export let element;
  export let icon;
  export let id;
  export let tooltip;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a bind:this="{element}" class="item" data-tab="{id}" data-tooltip="{tooltip}">
  <i class="{icon}"></i>
</a>

<script>
  export let id;
  export let sidebarClass;
  export let sidebarProps;
</script>

<section class="{`tab sidebar-tab ${id}-sidebar`}" id="{id}" data-tab="{id}">
  <svelte:component this="{sidebarClass}" {...sidebarProps} />
</section>

<svelte:options accessors="{true}" />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";

  export let elementRoot = void 0;
  export let sidebarClass;
  export let sidebarProps;
</script>

<ApplicationShell bind:elementRoot="{elementRoot}">
  <svelte:component this="{sidebarClass}" {...sidebarProps} />
</ApplicationShell>

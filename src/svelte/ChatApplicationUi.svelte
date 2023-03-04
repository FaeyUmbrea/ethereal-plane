<script>

    import {ApplicationShell} from '@typhonjs-fvtt/runtime/svelte/component/core';
    import StreamChat from "./StreamChat.svelte";
    import {onDestroy} from "svelte";

    export let elementRoot = void 0;

    onDestroy(() => {
        console.log("Breakpoint!");
    })

</script>

<svelte:options accessors={true}/>

<ApplicationShell bind:elementRoot>
    <StreamChat/>
</ApplicationShell>
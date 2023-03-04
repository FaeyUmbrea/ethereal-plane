<script>

    import {getContext} from "svelte";


    const {application} = getContext('#external');
</script>

<section class="{application.options.classes.join(' ')} directory flexcol" id="{application.options.id}"
         data-tab="{application.options.id}">
    rendered
</section>

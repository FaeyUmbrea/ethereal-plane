<script>
  import { getContext } from 'svelte';

  const { application } = getContext('#external');
</script>

<section
  class="{application.options.classes.join(' ')} directory flexcol"
  data-tab={application.options.id}
  id={application.options.id}
>
  rendered
</section>

<script>
	import { localize } from '@typhonjs-fvtt/runtime/util/i18n';
	import { DOCS_URL } from '../../utils/const.js';
</script>

<div class='header-item'>
	<button class='header-control' on:click={() => window.open(DOCS_URL, '_blank')}>
		<i class='fas fa-book'></i>
		<span>{localize('ethereal-plane.ui.docs')}</span>
	</button>
</div>

<style lang='scss'>
  .header-item  {
    display: flex;
    justify-content: right;
    align-items: center;
  }
</style>

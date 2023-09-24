<script>
  export let variant;
</script>

<div class="{'infobox ' + variant}">
  <slot />
</div>

<style lang="stylus">
  .infobox
    border: #ffffff90 1px solid
    border-radius: 5px
    background: #ffffff50
    margin: 5px
    padding: 5px

  .error
    border-color: #ff000090
    background: #ff000050

  .info
    border-color: #00bbff90
    background: #00bbff50

  .ok
    border-color: #00dd0090
    background: #00dd0050
</style>

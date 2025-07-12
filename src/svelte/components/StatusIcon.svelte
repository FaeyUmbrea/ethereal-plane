<script lang='ts'>
	import { ServerStatus } from '../../server/status.ts';

	export let status: ServerStatus = ServerStatus.Inactive;
</script>

<div class='status-icon'>
	<i class='far fa-circle-dot inner {status}'></i>
</div>

<style>
  .status-icon {
      position: relative;
  }
  .inner {
      position: absolute;
      top: 6px;
      left: 0;
  }
  .inactive {
      color: grey;
  }
  .connected {
      color: green;
  }
  .disconnected {
      color: red;
  }
  .connecting {
      color: orange;
  }
</style>

<script lang="ts">
	import { showPublishModal } from '$lib/stores';
</script>

<button 
	class="btn btn-success btn-sm text-white"
	on:click={() => showPublishModal.set(true)}
>
	Publish
</button>
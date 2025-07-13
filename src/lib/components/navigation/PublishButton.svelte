<script lang="ts">
	import { showPublishModal } from '$lib/stores';
	import { cn } from '$lib/utils';
</script>

<button 
	class={cn(
		"px-4 py-1.5 text-sm font-medium text-white rounded-md transition-colors",
		"bg-affirmative-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
	)}
	on:click={() => showPublishModal.set(true)}
>
	Publish
</button>
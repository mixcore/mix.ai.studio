<script lang="ts">
	import { MessageSquare } from 'lucide-svelte';
	import { showChatPanel } from '$lib/stores';

	function showChat() {
		showChatPanel.set(true);
	}
</script>

{#if !$showChatPanel}
	<button
		class="btn btn-primary btn-circle fixed bottom-4 left-4 z-50 shadow-lg"
		on:click={showChat}
		title="Show chat panel"
		aria-label="Show chat panel"
	>
		<MessageSquare class="w-5 h-5" />
	</button>
{/if}
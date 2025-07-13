<script lang="ts">
	import { PanelLeftClose, PanelLeftOpen } from 'lucide-svelte';
	import { showChatPanel } from '$lib/stores';

	function toggleChat() {
		showChatPanel.update(show => !show);
	}
</script>

<button
	class="btn btn-ghost btn-sm"
	on:click={toggleChat}
	title={$showChatPanel ? 'Hide chat panel' : 'Show chat panel'}
	aria-label={$showChatPanel ? 'Hide chat panel' : 'Show chat panel'}
>
	{#if $showChatPanel}
		<PanelLeftClose class="w-4 h-4" />
	{:else}
		<PanelLeftOpen class="w-4 h-4" />
	{/if}
</button>
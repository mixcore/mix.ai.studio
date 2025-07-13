<script lang="ts">
	import { MoreHorizontal, Settings } from 'lucide-svelte';
	import { chatMode } from '$lib/stores';

	let showDropdown = false;

	function selectMode(mode: 'default' | 'chat-only' | 'agent') {
		chatMode.set(mode);
		showDropdown = false;
	}
</script>

<div class="relative">
	<button 
		class="btn btn-ghost btn-sm"
		on:click={() => showDropdown = !showDropdown}
	>
		<MoreHorizontal class="w-4 h-4" />
	</button>

	{#if showDropdown}
		<div class="absolute right-0 top-8 w-48 bg-base-100 border border-base-300 rounded-md shadow-lg z-50">
			<div class="p-2">
				<div class="px-2 py-1.5 text-xs font-medium text-base-content/60">Chat Mode</div>
				
				<button 
					class="w-full text-left px-2 py-1.5 text-sm hover:bg-base-200 rounded-sm"
					class:bg-accent={$chatMode === 'default'}
					on:click={() => selectMode('default')}
				>
					Default (chat + edits)
				</button>
				
				<button 
					class="w-full text-left px-2 py-1.5 text-sm hover:bg-base-200 rounded-sm"
					class:bg-accent={$chatMode === 'chat-only'}
					on:click={() => selectMode('chat-only')}
				>
					Chat only
				</button>
				
				<button 
					class="w-full text-left px-2 py-1.5 text-sm hover:bg-base-200 rounded-sm"
					class:bg-accent={$chatMode === 'agent'}
					on:click={() => selectMode('agent')}
				>
					Agent mode
				</button>
			</div>
		</div>
	{/if}
</div>

{#if showDropdown}
	<div 
		class="fixed inset-0 z-40" 
		on:click={() => showDropdown = false}
		on:keydown={() => showDropdown = false}
	></div>
{/if}
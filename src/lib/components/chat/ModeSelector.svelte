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
		class="p-1.5 hover:bg-accent rounded-md transition-colors"
		on:click={() => showDropdown = !showDropdown}
	>
		<MoreHorizontal class="w-4 h-4" />
	</button>

	{#if showDropdown}
		<div class="absolute right-0 top-8 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
			<div class="p-1">
				<div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">Chat Mode</div>
				
				<button 
					class="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
					class:bg-accent={$chatMode === 'default'}
					on:click={() => selectMode('default')}
				>
					Default (chat + edits)
				</button>
				
				<button 
					class="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
					class:bg-accent={$chatMode === 'chat-only'}
					on:click={() => selectMode('chat-only')}
				>
					Chat only
				</button>
				
				<button 
					class="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
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
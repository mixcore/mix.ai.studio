<script lang="ts">
	import { User, Settings, LogOut } from 'lucide-svelte';
	import { user } from '$lib/stores';

	let showDropdown = false;

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function closeDropdown() {
		showDropdown = false;
	}
</script>

<div class="relative">
	<button 
		class="w-8 h-8 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-medium hover:bg-blue-700 transition-colors"
		on:click={toggleDropdown}
	>
		{$user?.name?.[0] || 'U'}
	</button>

	{#if showDropdown}
		<div 
			class="absolute right-0 top-10 w-48 bg-popover border border-border rounded-md shadow-lg z-50"
			on:click={closeDropdown}
			on:keydown={closeDropdown}
		>
			<div class="p-2 border-b border-border">
				<div class="text-sm font-medium">{$user?.name || 'User'}</div>
				<div class="text-xs text-muted-foreground">{$user?.email || 'user@example.com'}</div>
			</div>
			
			<div class="p-1">
				<button class="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
					<User class="w-4 h-4" />
					Profile
				</button>
				<button class="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
					<Settings class="w-4 h-4" />
					Settings
				</button>
				<button class="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive">
					<LogOut class="w-4 h-4" />
					Sign out
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Click outside to close -->
{#if showDropdown}
	<div 
		class="fixed inset-0 z-40" 
		on:click={closeDropdown}
		on:keydown={closeDropdown}
	></div>
{/if}
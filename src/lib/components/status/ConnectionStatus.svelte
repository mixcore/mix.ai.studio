<script lang="ts">
	import { Wifi, WifiOff, AlertCircle } from 'lucide-svelte';
	import { mixcoreConnected, isAuthenticated } from '$lib/stores';
	
	$: connectionStatus = $mixcoreConnected ? 'connected' : 'disconnected';
	$: showStatus = !$isAuthenticated || !$mixcoreConnected;
</script>

{#if showStatus}
	<div class="tooltip tooltip-left" data-tip={$mixcoreConnected ? 'Connected to Mixcore' : 'Mixcore unavailable - running in offline mode'}>
		<div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs
			{connectionStatus === 'connected' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}">
			{#if connectionStatus === 'connected'}
				<Wifi class="w-3 h-3" />
				<span class="hidden md:inline">Connected</span>
			{:else}
				<WifiOff class="w-3 h-3" />
				<span class="hidden md:inline">Offline</span>
			{/if}
		</div>
	</div>
{/if}
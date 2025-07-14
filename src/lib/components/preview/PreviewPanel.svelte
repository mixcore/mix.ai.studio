<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';
	import { previewUrl, previewLoading, showCodeView, deviceMode } from '$lib/stores';
	import { cn } from '$lib/utils';

	let iframeContainer: HTMLDivElement;

	$: containerClass = cn(
		"bg-base-100 border border-base-300 rounded-lg overflow-hidden mx-auto",
		$deviceMode === 'mobile' && "w-[375px] h-[667px]",
		$deviceMode === 'tablet' && "w-[768px] h-[1024px]",
		$deviceMode === 'desktop' && "w-full h-full"
	);
</script>

<div class="flex flex-col h-full bg-muted/30">
	<!-- Preview Content -->
	<div class="flex-1 overflow-auto">
		{#if $showCodeView}
			<!-- Code View -->
			<div class="h-full bg-slate-900 text-green-400 rounded-lg m-4 p-4 font-mono text-sm overflow-auto">
				<div class="space-y-2">
					<div class="text-gray-500">// Generated SvelteKit Application</div>
					<div>&lt;script lang="ts"&gt;</div>
					<div class="ml-4">import {{ onMount }} from 'svelte';</div>
					<div class="ml-4">let message = 'Hello, World!';</div>
					<div>&lt;/script&gt;</div>
					<br>
					<div>&lt;main&gt;</div>
					<div class="ml-4">&lt;h1&gt;{{message}}&lt;/h1&gt;</div>
					<div>&lt;/main&gt;</div>
					<br>
					<div>&lt;style&gt;</div>
					<div class="ml-4">h1 {`{ color: #ff6b6b; }`}</div>
					<div>&lt;/style&gt;</div>
				</div>
			</div>
		{:else}
			<!-- Live Preview -->
			<div 
				bind:this={iframeContainer}
				class="h-full flex items-center justify-center p-4"
			>
				<div class={containerClass}>
					{#if $previewLoading}
						<div class="w-full h-full flex items-center justify-center bg-muted">
							<div class="text-center">
								<RefreshCw class="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
								<p class="text-sm text-muted-foreground">Generating preview...</p>
							</div>
						</div>
					{:else}
						<iframe
							src={$previewUrl}
							class="w-full h-full border-0"
							title="App Preview"
							sandbox="allow-scripts allow-same-origin allow-forms"
						></iframe>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
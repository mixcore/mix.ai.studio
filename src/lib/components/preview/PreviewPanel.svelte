<script lang="ts">
	import { RefreshCw, ExternalLink, Code, Monitor, Smartphone, Tablet } from 'lucide-svelte';
	import { previewUrl, previewLoading, showCodeView } from '$lib/stores';
	import { cn } from '$lib/utils';

	let deviceMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
	let iframeContainer: HTMLDivElement;

	function refreshPreview() {
		previewLoading.set(true);
		// Simulate refresh
		setTimeout(() => {
			previewLoading.set(false);
		}, 1000);
	}

	function openInNewTab() {
		window.open($previewUrl, '_blank');
	}

	function toggleCodeView() {
		showCodeView.update(show => !show);
	}

	function setDeviceMode(mode: 'desktop' | 'tablet' | 'mobile') {
		deviceMode = mode;
	}

	$: containerClass = cn(
		"bg-white border border-border rounded-lg overflow-hidden mx-auto",
		deviceMode === 'mobile' && "w-[375px] h-[667px]",
		deviceMode === 'tablet' && "w-[768px] h-[1024px]",
		deviceMode === 'desktop' && "w-full h-full"
	);
</script>

<div class="flex flex-col h-full bg-muted/30">
	<!-- Preview Header -->
	<div class="flex items-center justify-between p-4 bg-background border-b border-border">
		<div class="flex items-center gap-2">
			<h2 class="text-sm font-medium">Preview</h2>
			{#if $previewLoading}
				<div class="flex items-center gap-1 text-muted-foreground">
					<div class="w-1 h-4 bg-accent-primary rounded animate-pulse"></div>
					<span class="text-xs">Generating...</span>
				</div>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<!-- Device Mode Selector -->
			<div class="flex items-center bg-muted rounded-md p-1">
				<button
					class={cn(
						"p-1.5 rounded transition-colors",
						deviceMode === 'desktop' ? "bg-background shadow-sm" : "hover:bg-accent"
					)}
					on:click={() => setDeviceMode('desktop')}
					title="Desktop view"
				>
					<Monitor class="w-4 h-4" />
				</button>
				<button
					class={cn(
						"p-1.5 rounded transition-colors",
						deviceMode === 'tablet' ? "bg-background shadow-sm" : "hover:bg-accent"
					)}
					on:click={() => setDeviceMode('tablet')}
					title="Tablet view"
				>
					<Tablet class="w-4 h-4" />
				</button>
				<button
					class={cn(
						"p-1.5 rounded transition-colors",
						deviceMode === 'mobile' ? "bg-background shadow-sm" : "hover:bg-accent"
					)}
					on:click={() => setDeviceMode('mobile')}
					title="Mobile view"
				>
					<Smartphone class="w-4 h-4" />
				</button>
			</div>

			<!-- View Toggle -->
			<button
				class={cn(
					"flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-md transition-colors",
					$showCodeView ? "bg-accent-primary text-white" : "bg-muted hover:bg-accent"
				)}
				on:click={toggleCodeView}
			>
				<Code class="w-3 h-3" />
				Code
			</button>

			<!-- Preview Controls -->
			<button
				class="p-1.5 hover:bg-accent rounded-md transition-colors"
				on:click={refreshPreview}
				title="Refresh preview"
			>
				<RefreshCw class="w-4 h-4" />
			</button>

			<button
				class="p-1.5 hover:bg-accent rounded-md transition-colors"
				on:click={openInNewTab}
				title="Open in new tab"
			>
				<ExternalLink class="w-4 h-4" />
			</button>
		</div>
	</div>

	<!-- Preview Content -->
	<div class="flex-1 p-4 overflow-auto">
		{#if $showCodeView}
			<!-- Code View -->
			<div class="h-full bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto">
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
				class="h-full flex items-center justify-center"
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
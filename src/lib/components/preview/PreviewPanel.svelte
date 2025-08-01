<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';
	import { previewUrl, previewLoading, showCodeView, deviceMode } from '$lib/stores';
	import { cn } from '$lib/utils';

	let iframeContainer: HTMLDivElement;

	$: containerClass = cn(
		"bg-base-100 border border-base-300 rounded-lg overflow-hidden mx-auto relative",
		$deviceMode === 'mobile' && "w-[375px] h-[667px] shadow-xl",
		$deviceMode === 'tablet' && "w-[768px] h-[1024px] shadow-lg", 
		$deviceMode === 'desktop' && "w-full h-full"
	);

	// Calculate scale for mobile and tablet to fit better in viewport
	$: scaleTransform = (() => {
		if ($deviceMode === 'mobile') {
			return 'scale(0.85)'; // Scale down mobile view for better fit
		} else if ($deviceMode === 'tablet') {
			return 'scale(0.65)'; // Scale down tablet view for better fit
		}
		return 'scale(1)'; // No scaling for desktop
	})();

	// Add device-specific styling and viewport meta simulation
	$: deviceSpecificStyle = (() => {
		if ($deviceMode === 'mobile') {
			return 'width: 375px; height: 667px;'; // iPhone dimensions
		} else if ($deviceMode === 'tablet') {
			return 'width: 768px; height: 1024px;'; // iPad dimensions
		}
		return '';
	})();
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
				<div 
					class={containerClass}
					style="transform: {scaleTransform}; transform-origin: center;"
				>
					{#if $deviceMode === 'mobile'}
						<!-- Mobile Device Frame (iPhone-style) -->
						<div class="absolute -inset-3 bg-gray-900 rounded-[2.5rem] shadow-2xl">
							<!-- Notch -->
							<div class="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-1.5 bg-gray-700 rounded-full"></div>
							<!-- Speaker -->
							<div class="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full"></div>
							<!-- Home indicator -->
							<div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
							<!-- Side buttons -->
							<div class="absolute left-0 top-16 w-0.5 h-8 bg-gray-700 rounded-r"></div>
							<div class="absolute left-0 top-28 w-0.5 h-12 bg-gray-700 rounded-r"></div>
							<div class="absolute right-0 top-20 w-0.5 h-16 bg-gray-700 rounded-l"></div>
						</div>
					{:else if $deviceMode === 'tablet'}
						<!-- Tablet Device Frame (iPad-style) -->
						<div class="absolute -inset-4 bg-gray-800 rounded-2xl shadow-2xl">
							<!-- Home button -->
							<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-700 rounded-full border-2 border-gray-600"></div>
							<!-- Camera -->
							<div class="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-600 rounded-full"></div>
							<!-- Side buttons -->
							<div class="absolute right-0 top-20 w-0.5 h-20 bg-gray-700 rounded-l"></div>
						</div>
					{/if}
					
					<div class="relative z-10 w-full h-full rounded-lg overflow-hidden">
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
								class="w-full h-full border-0 rounded-lg"
								title="App Preview"
								sandbox="allow-scripts allow-same-origin allow-forms"
								style={$deviceMode !== 'desktop' ? `${deviceSpecificStyle}` : ''}
							></iframe>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
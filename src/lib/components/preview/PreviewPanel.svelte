<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';
	import { previewUrl, previewLoading, showCodeView, deviceMode } from '$lib/stores';
	import { cn } from '$lib/utils';


	$: containerClass = cn(
		"bg-base-100 border border-base-300 rounded-lg overflow-hidden mx-auto relative",
		$deviceMode === 'mobile' && "w-[375px] h-[667px] shadow-xl",
		$deviceMode === 'tablet' && "w-[768px] h-[1024px] shadow-lg", 
		$deviceMode === 'desktop' && "w-[1440px] h-[900px] shadow-2xl",
		$deviceMode === 'responsive' && "w-full h-full min-h-[400px] min-w-[320px]"
	);

	// Calculate scale for all device modes to fit better in viewport
	$: scaleTransform = (() => {
		if ($deviceMode === 'mobile') {
			return 'scale(1)';
		} else if ($deviceMode === 'tablet') {
			return 'scale(0.85)';
		} else if ($deviceMode === 'desktop') {
			return 'scale(1)';
		} else if ($deviceMode === 'responsive') {
			return 'scale(1)';
		}
		return 'scale(1)';
	})();

	// Device-specific DPI and pixel ratio simulation
	$: deviceConfig = (() => {
		if ($deviceMode === 'mobile') {
			return {
				width: 375,
				height: 667,
				pixelRatio: 3,
				dpi: 326,
				zoom: 1
			};
		} else if ($deviceMode === 'tablet') {
			return {
				width: 768,
				height: 1024,
				pixelRatio: 2,
				dpi: 264,
				zoom: 1
			};
		} else if ($deviceMode === 'desktop') {
			return {
				width: 1440,
				height: 900,
				pixelRatio: 1,
				dpi: 96,
				zoom: 1
			};
		} else if ($deviceMode === 'responsive') {
			// Use 100% for responsive mode
			return {
				width: '100%',
				height: '100%',
				pixelRatio: window.devicePixelRatio || 1,
				dpi: 96,
				zoom: 1
			};
		}
		return { width: 0, height: 0, pixelRatio: 1, dpi: 96, zoom: 1 };
	})();

	// Generate CSS styles with DPI simulation
	$: deviceSpecificStyle = (() => {
		const config = deviceConfig;
		// Responsive mode: let iframe fill container
		if ($deviceMode === 'responsive') {
			return [
				`width: 100%`,
				`height: 100%`,
				`min-width: 320px`,
				`min-height: 400px`,
				`zoom: 1`,
				`transform-origin: top left`,
				`image-rendering: auto`,
				`font-size: 16px`,
				`-webkit-font-smoothing: auto`,
				`-moz-osx-font-smoothing: auto`
			].join('; ');
		}
		// Other device modes
		const dpiZoom = config.pixelRatio > 1 ? 1 / config.pixelRatio : 1;
		const styles = [
			`width: ${config.width}px`,
			`height: ${config.height}px`,
			`zoom: ${config.zoom}`,
			`transform-origin: top left`,
			`image-rendering: ${config.pixelRatio > 1 ? 'crisp-edges' : 'auto'}`,
			`font-size: ${config.pixelRatio > 1 ? '16px' : '14px'}`,
			`-webkit-font-smoothing: ${config.pixelRatio > 1 ? 'antialiased' : 'auto'}`,
			`-moz-osx-font-smoothing: ${config.pixelRatio > 1 ? 'grayscale' : 'auto'}`
		];
		return styles.join('; ');
	})();

	// Viewport meta tag simulation for iframe content
	$: viewportMeta = (() => {
		const config = deviceConfig;
		if ($deviceMode === 'mobile') {
			return `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`;
		} else if ($deviceMode === 'tablet') {
			return `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes`;
		} else if ($deviceMode === 'responsive') {
			return `width=device-width, initial-scale=1.0`;
		} else {
			return `width=${config.width}, initial-scale=1.0`;
		}
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
					<div class="ml-4">import &#123; onMount &#125; from 'svelte';</div>
					<div class="ml-4">let message = 'Hello, World!';</div>
					<div>&lt;/script&gt;</div>
					<br>
					<div>&lt;main&gt;</div>
					<div class="ml-4">&lt;h1&gt;&#123;message&#125;&lt;/h1&gt;</div>
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
					{:else if $deviceMode === 'desktop'}
						<!-- Desktop Monitor Frame -->
						<div class="absolute -inset-6 bg-gray-900 rounded-t-2xl shadow-2xl">
							<!-- Monitor bezel -->
							<div class="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-2xl border-2 border-gray-700"></div>
							<!-- Screen area -->
							<div class="absolute inset-3 bg-black rounded-lg shadow-inner"></div>
							<!-- Monitor stand base -->
							<div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-700 rounded-full"></div>
							<!-- Monitor stand neck -->
							<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gray-700 rounded-b-lg"></div>
							<!-- Power LED -->
							<div class="absolute bottom-2 right-4 w-2 h-2 bg-green-400 rounded-full opacity-80"></div>
							<!-- Brand logo area -->
							<div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full opacity-50"></div>
						</div>
					{/if}
					
					<!-- DPI Info Badge -->
					<!-- <div class="absolute top-2 right-2 z-20 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
						{deviceConfig.dpi} DPI • {deviceConfig.pixelRatio}x • {deviceConfig.width}×{deviceConfig.height}
					</div> -->

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
								title="App Preview - Viewport: {viewportMeta} | DPI: {deviceConfig.dpi}"
								sandbox="allow-scripts allow-same-origin allow-forms"
								style="{deviceSpecificStyle}; background: white;"
								loading="lazy"
							></iframe>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
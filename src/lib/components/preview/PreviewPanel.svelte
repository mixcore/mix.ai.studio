<!--
TODO: For full two-way URL sync with cross-origin iframes, add this script to the <head> of your iframe app:

<script>
(function() {
  function sendUrl() {
	window.parent.postMessage({ type: 'mixcore:navigate', url: window.location.href }, '*');
  }
  window.addEventListener('hashchange', sendUrl);
  window.addEventListener('popstate', sendUrl);
  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;
  history.pushState = function() { origPushState.apply(this, arguments); sendUrl(); };
  history.replaceState = function() { origReplaceState.apply(this, arguments); sendUrl(); };
  sendUrl();
})();
</script>
-->
<script lang="ts">
import { RefreshCw } from 'lucide-svelte';
import { previewUrl, previewLoading, showCodeView, deviceMode, templateUpdateTrigger } from '$lib/stores';
import { previewIframeUrl } from '$lib/stores/previewIframeUrl';
import { cn } from '$lib/utils';
import { createEventDispatcher } from 'svelte';
import type { PageContent } from '$lib/models';

// Props
export let pages: PageContent[] = [];
export let activePage: PageContent | null = null;

const dispatch = createEventDispatcher();

// Get the API URL from environment variables
const MIXCORE_API_URL = import.meta.env.VITE_MIXCORE_API_URL || 'https://mixcore.net';

// Map to hold cleanup functions per iframe element to avoid touching cross-origin frames
const iframeCleanup = new WeakMap<HTMLIFrameElement, () => void>();

// Keep previewIframeUrl in sync with previewUrl by default
// $: if ($previewUrl && !$previewIframeUrl) previewIframeUrl.set($previewUrl);

// Reactive statement to update preview URL when activePage changes
$: if (activePage) {
  let newPreviewUrl = '';
  if (activePage.detailUrl) {
    newPreviewUrl = `${MIXCORE_API_URL}${activePage.detailUrl}`;
  } else if (activePage.seoName) {
    newPreviewUrl = `${MIXCORE_API_URL}/${activePage.seoName}`;
  } else {
    newPreviewUrl = `${MIXCORE_API_URL}/page/${activePage.id}`;
  }
  
  console.log('🔄 Auto-updating preview URL for active page:', newPreviewUrl);
  previewUrl.set(newPreviewUrl);
  previewIframeUrl.set(newPreviewUrl);
  
  // Also update iframe src if it's already loaded
  if (iframeElement && iframeElement.src !== newPreviewUrl) {
    console.log('🔄 Updating iframe src for active page change');
    iframeElement.src = newPreviewUrl;
  }
}

// Function to handle page selection
function handlePageSelect(page: PageContent) {
  console.log('🔗 PreviewPanel: Page selected, dispatching to parent:', page.title || page.seoName);
  // Don't modify local activePage - let parent handle it and pass back via props
  // Update preview URL based on the selected page's detailUrl, seoName, or id
  let newPreviewUrl = '';
  if (page.detailUrl) {
    newPreviewUrl = `${MIXCORE_API_URL}${page.detailUrl}`;
  } else if (page.seoName) {
    newPreviewUrl = `${MIXCORE_API_URL}/${page.seoName}`;
  } else {
    newPreviewUrl = `${MIXCORE_API_URL}/page/${page.id}`;
  }
  
  console.log('🔗 Setting preview URL:', newPreviewUrl);
  previewUrl.set(newPreviewUrl);
  previewIframeUrl.set(newPreviewUrl);
  
  // Force iframe refresh to the new URL
  if (iframeElement) {
    console.log('🔄 Forcing iframe to load new page URL');
    iframeElement.src = newPreviewUrl;
  }
  dispatch('pageSelect', page);
}

// Refresh iframe when template updates are detected
let iframeElement: HTMLIFrameElement;
$: if ($templateUpdateTrigger > 0 && iframeElement) {
	console.log('🔄 Refreshing preview iframe due to template update');
	// Force iframe refresh by reloading its content
	const currentSrc = iframeElement.src;
	if (currentSrc) {
		// Add timestamp to force refresh and avoid cache
		const url = new URL(currentSrc);
		url.searchParams.set('_refresh', Date.now().toString());
		iframeElement.src = url.toString();
	}
}


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
			// Use 100% for responsive mode. Guard access to window for SSR.
			const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
			return {
				width: '100%',
				height: '100%',
				pixelRatio,
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

<div class="flex flex-col h-full bg-muted/30 ${pages.length}">
	<!-- Pages Navigation Header -->
	{#if pages.length > 0}
		<div class="p-3 border-b border-base-300 bg-base-100">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">Preview:</span>
				<select
					class="select select-sm select-bordered flex-1"
					value={activePage?.id || ''}
					on:change={(e) => {
						const target = e.target as HTMLSelectElement;
						const selectedValue = target.value;
						console.log('🔍 Select change - raw value:', selectedValue);
						
						// Convert to number, handling both string and number cases
						const selectedId = selectedValue ? parseInt(selectedValue.toString(), 10) : null;
						console.log('🔍 Select change - parsed ID:', selectedId);
						
						if (selectedId && !isNaN(selectedId)) {
							const selectedPage = pages.find(p => p.id === selectedId);
							console.log('🔍 Select change - found page:', selectedPage);
							if (selectedPage) {
								console.log('📄 Page selected:', selectedPage.title || selectedPage.seoName);
								handlePageSelect(selectedPage);
							} else {
								console.warn('⚠️ Page not found with ID:', selectedId);
							}
						} else {
							console.warn('⚠️ Invalid page ID selected:', selectedValue);
						}
					}}
				>
					{#each pages as page}
						<option value={page.id}>
							{page.title || page.seoName || `Page ${page.id}`}
						</option>
					{/each}
				</select>
			</div>
		</div>
	{/if}

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
	bind:this={iframeElement}
	id="preview-iframe"
	src={$previewIframeUrl || $previewUrl}
	class="w-full h-full border-0 rounded-lg"
	title="App Preview - Viewport: {viewportMeta} | DPI: {deviceConfig.dpi}"
	sandbox="allow-scripts allow-same-origin allow-forms"
	style="{deviceSpecificStyle}; background: white;"
	loading="lazy"
	on:load={() => {
		// When iframe loads, update the store with its current URL
		const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null;
		if (!iframe) return;
		const win = iframe.contentWindow;
		if (!win) return;
		const updateUrl = () => {
			let newUrl = '';
			try {
				if (iframe.contentWindow) {
					newUrl = iframe.contentWindow.location.href;
				} else {
					newUrl = iframe.src;
				}
			} catch (e) {
				// Cross-origin: fallback to src
				newUrl = iframe.src;
			}
			if ($previewIframeUrl !== newUrl) {
				previewIframeUrl.set(newUrl);
			}
		};
		updateUrl();
		// Remove previous cleanup attached to this iframe (kept in parent only)
		const previousCleanup = iframeCleanup.get(iframe);
		if (previousCleanup) {
			try { previousCleanup(); } catch (e) { /* ignore */ }
			iframeCleanup.delete(iframe);
		}
		// Try to add listeners to iframe window only if same-origin
		let sameOrigin = true;
		try {
			// Accessing location will throw for cross-origin iframes
			void win.location.href;
		} catch (e) {
			sameOrigin = false;
		}
		const hashListener = () => updateUrl();
		const popListener = () => updateUrl();
		if (sameOrigin) {
			try {
				win.addEventListener('hashchange', hashListener);
				win.addEventListener('popstate', popListener);
				const cleanup = () => {
					try {
						win.removeEventListener('hashchange', hashListener);
						win.removeEventListener('popstate', popListener);
					} catch (e) { /* ignore */ }
				};
				iframeCleanup.set(iframe, cleanup);
			} catch (e) {
				// If attaching listeners fails, rely on postMessage fallback
			}
		} else {
			// Cross-origin iframe: rely on postMessage from iframe for navigation updates
		}
		// Listen for postMessage from iframe for SPA navigation
		// Always remove previous message listener before adding a new one
		if ((window as any).__mixcore_urlbar_global_cleanup_message) {
			(window as any).__mixcore_urlbar_global_cleanup_message();
		}
		const messageListener = (event: MessageEvent) => {
			if (event.source === win && event.data && event.data.type === 'mixcore:navigate') {
				if (typeof event.data.url === 'string') {
					previewIframeUrl.set(event.data.url);
				}
			}
		};
		window.addEventListener('message', messageListener);
		// Clean up message listener globally
		(window as any).__mixcore_urlbar_global_cleanup_message = () => {
			window.removeEventListener('message', messageListener);
			delete (window as any).__mixcore_urlbar_global_cleanup_message;
		};
	}}
></iframe>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
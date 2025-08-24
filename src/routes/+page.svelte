<script lang="ts">
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import ResizableLayout from '$lib/components/layout/ResizableLayout.svelte';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import PreviewPanel from '$lib/components/preview/PreviewPanel.svelte';
	import MixDatabasePanel from '$lib/components/database/MixDatabasePanel.svelte';
	import AgentFlowPanel from '$lib/components/agent/AgentFlowPanel.svelte';
	import VscodePanel from '$lib/components/vscode/VscodePanel.svelte';
	import FloatingChatToggle from '$lib/components/navigation/FloatingChatToggle.svelte';
	import { onMount } from 'svelte';
	import { user, previewUrl, userActions, mixcoreConnected, isAuthenticated, hasProjects, viewMode } from '$lib/stores';
	import WelcomeScreen from '$lib/components/welcome/WelcomeScreen.svelte';
	import AuthModal from '$lib/components/auth/AuthModal.svelte';
	import { files as mockFiles } from '$lib/vsc-mock/files';
	import { PageService } from '$lib/services/page-service';
	import { AuthService } from '$lib/services/auth.service';
	import type { PageContent } from '$lib/models';
	
	let showWelcome = true;
	let showAuthModal = false;
	let authMode: 'login' | 'register' = 'login';
	let pages: PageContent[] = [];
	let activePage: PageContent | null = null;
	let pageService: PageService;
	let authService: AuthService;
	
	// Function to load pages
	async function loadPages() {
		console.log('loadPages called - authenticated:', $isAuthenticated, 'pageService:', !!pageService);
		console.log('Current authentication state:', $user);
		if (!pageService || !$isAuthenticated) {
			console.log('Skipping loadPages - not authenticated or no pageService');
			return;
		}
		
		try {
			console.log('Fetching pages from API...');
			const pageResult = await pageService.getList({
				pageIndex: 0,
				pageSize: 100 // Get a reasonable number of pages
			});
			
			console.log('Pages received:', pageResult);
			console.log('Pages result type:', typeof pageResult);
			console.log('Pages result items:', pageResult?.items);
			
			if (pageResult && Array.isArray(pageResult.items)) {
				pages = pageResult.items;
				console.log('Pages set:', pages.length, 'pages');
				console.log('First page structure:', JSON.stringify(pages[0], null, 2));
				
				// Always set the first page as active by default
				if (pages.length > 0) {
					const firstPage = pages[0];
					activePage = firstPage;
					console.log('Active page set to first page:', firstPage?.title || firstPage?.seoName);
					
					// Trigger page selection to update preview URL
					handlePageSelect(firstPage);
				}
			} else {
				console.log('No pages returned from API');
			}
		} catch (error) {
			console.error('Failed to load pages:', error);
		}
	}
	
	onMount(async () => {
		// Initialize services
		authService = new AuthService();
		pageService = new PageService(authService);
		console.log('Services initialized');
		
		// Set preview URL to demo page instead of base URL
		const baseUrl = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT || 'https://mixcore.net';
		previewUrl.set(`${baseUrl}`);

		try {
			console.log('Initializing userActions...');
			const initialized = await userActions.initialize();
			if (!initialized) {
				console.warn('Mixcore service failed to initialize - running in offline mode');
				mixcoreConnected.set(false);
				showAuthModal = true; // Show auth modal if not connected
			} else {
				console.log('Mixcore service initialized successfully');
				// Load pages after successful initialization
				await loadPages();
			}
		} catch (error) {
			console.error('Failed to initialize Mixcore:', error);
			mixcoreConnected.set(false);
			// user is a readable store derived from authService, so we don't need to set it manually
			if (error instanceof Error && error.message.includes('HTTP Error')) {
				console.warn('Mixcore endpoint unavailable - check network connection or endpoint configuration');
			}
		}
		
		// Also try to load pages if already authenticated (fallback)
		if ($isAuthenticated) {
			console.log('Already authenticated on mount - loading pages...');
			await loadPages();
		} else {
			console.log('Not authenticated, will load pages after authentication');
		}
	});
	
	
	// The welcome screen should only be visible when the user is not authenticated.
	// This reactive statement makes the UI declarative and predictable.
	// If Mixcore is not connected, we can still show the app but with limited functionality
	$: showWelcome = !$isAuthenticated && !import.meta.env.VITE_DEMO_MODE;
	
	// Reload pages when authentication status changes
	$: if ($isAuthenticated && pageService) {
		console.log('Authentication status changed - authenticated, loading pages...');
		loadPages();
	}
	
	// Reactive statement to ensure first page is selected when pages are loaded
	$: if (pages.length > 0 && !activePage) {
		console.log('🔄 REACTIVE: Pages available and no activePage set');
		console.log('🔄 REACTIVE: pages.length:', pages.length);
		console.log('🔄 REACTIVE: activePage current value:', activePage);
		console.log('📄 Auto-selecting first page as default...');
		const firstPage = pages[0];
		console.log('📄 First page data:', JSON.stringify(firstPage, null, 2));
		
		// Validate the first page before setting it
		if (firstPage && (firstPage.id || firstPage.seoName)) {
			console.log('✅ First page is valid, setting as activePage');
			activePage = firstPage;
			console.log('📄 activePage after assignment:', activePage);
			handlePageSelect(firstPage);
		} else {
			console.error('❌ First page is invalid:', firstPage);
		}
	}

	// Monitor activePage changes
	$: console.log('👁️ REACTIVE MONITOR: activePage changed to:', activePage);
	
	// Monitor pages array changes
	$: console.log('📚 REACTIVE MONITOR: pages array changed, length:', pages.length);
	
	// Function to handle page selection
	function handlePageSelect(event: CustomEvent<PageContent>) {
		var page = event.detail;
		console.log('📄 Handling page selection in +page.svelte:', page?.title || page?.seoName || 'No title/seoName');
		console.log('📄 Page object details:', JSON.stringify(page, null, 2));
		// Validate the page object before setting it
		if (!page || (!page.id && !page.seoName)) {
			console.error('❌ Invalid page object received:', page);
			return;
		}
		
		console.log('✅ Valid page object, setting as activePage');
		activePage = page;
		
		// Update preview URL using detailUrl if available, otherwise fallback to seoName
		const apiUrl = import.meta.env.VITE_MIXCORE_API_URL;
		if (page.detailUrl) {
			const newPreviewUrl = `${apiUrl}${page.detailUrl}`;
			console.log('🔗 Setting preview URL from detailUrl:', newPreviewUrl);
			previewUrl.set(newPreviewUrl);
		} else if (page.seoName) {
			const newPreviewUrl = `${apiUrl}/${page.seoName}`;
			console.log('🔗 Setting preview URL from seoName:', newPreviewUrl);
			previewUrl.set(newPreviewUrl);
		}
	}
	
	// Reactive statement to ensure first page is selected when pages are loaded
	$: if (pages.length > 0 && !activePage) {
		console.log('� REACTIVE: Pages available and no activePage set');
		console.log('🔄 REACTIVE: pages.length:', pages.length);
		console.log('🔄 REACTIVE: activePage current value:', activePage);
		console.log('�📄 Auto-selecting first page as default...');
		const firstPage = pages[0];
		console.log('📄 First page data:', JSON.stringify(firstPage, null, 2));
		activePage = firstPage;
		console.log('📄 activePage after assignment:', activePage);
		handlePageSelect(firstPage);
	}

	// Monitor activePage changes
	$: console.log('👁️ REACTIVE MONITOR: activePage changed to:', activePage);
	
	// Monitor pages array changes
	$: console.log('📚 REACTIVE MONITOR: pages array changed, length:', pages.length);
	
	
	function handleWelcomeLogin() {
		authMode = 'login';
		showAuthModal = true;
	}
	
	function handleWelcomeGetStarted() {
		// The WelcomeScreen is only visible when !$isAuthenticated,
		// so we can directly open the login modal.
		handleWelcomeLogin();
	}
	
	function closeAuthModal() {
		showAuthModal = false;
	}
	
	function handleAuthSuccess() {
		// The modal now closes itself on success.
		// This function can be used for other post-login actions, like showing a toast.
		showAuthModal = false;
		showWelcome = false;
		// Explicitly load pages after successful authentication
		if (pageService) {
			console.log('Auth success - loading pages...');
			loadPages();
		}
	}

</script>

{#if showWelcome}
	<!-- Welcome Screen -->
	<WelcomeScreen
		on:login={handleWelcomeLogin}
		on:getStarted={handleWelcomeGetStarted}
	/>
{:else}
	<!-- Main Application -->
	<div class="h-screen flex flex-col">
		<!-- Navigation -->
		<Navigation projectName="mixcore.ai" />
		
		<!-- Main Content -->
		<div class="flex-1 overflow-hidden {pages.length}">
			<ResizableLayout>
				<ChatPanel slot="left" {pages} {activePage} on:pageSelect={handlePageSelect} />
				<div slot="right" class="h-full flex flex-col">
					{#if $viewMode === 'vscode'}
						<VscodePanel files={mockFiles} />
					{:else if $viewMode === 'preview'}
						<PreviewPanel {pages} {activePage} on:pageSelect={handlePageSelect} />
					{:else if $viewMode === 'database'}
						<MixDatabasePanel />
					{:else}
						<AgentFlowPanel />
					{/if}
				</div>
			</ResizableLayout>
		</div>

		<!-- Floating Chat Toggle (appears when chat is hidden) -->
		<FloatingChatToggle />
	</div>
{/if}

<!-- Authentication Modal -->
<AuthModal
	isOpen={showAuthModal}
	mode={authMode}
	on:close={closeAuthModal}
	on:success={handleAuthSuccess}
/>
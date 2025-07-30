<script lang="ts">
	import { ArrowRight, Sparkles, Bot, Database, CodeXml } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		getStarted: void;
		login: void;
	}>();
</script>

<div class="flex flex-col items-center justify-center min-h-screen px-4 text-center antialiased bg-base-100">
	<div class="max-w-3xl mx-auto">
		<!-- Logo/Brand -->
		<div class="flex items-center justify-center relative mb-6">
			<div class="relative">
				<div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
					<div class="w-6 h-6 bg-white rounded-sm"></div>
				</div>
			</div>
			<div class="ml-4 text-3xl font-bold tracking-tight">
				mixcore<span class="text-primary">.</span>ai
			</div>
		</div>

		<!-- Main Heading -->
		<h1 class="my-6 text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
			Build Apps with Your AI Assistant
		</h1>

		<!-- Subtitle -->
		<p class="mb-12 max-w-2xl mx-auto text-lg md:text-xl text-base-content/80">
			Your personal AI engineer for building and managing applications. Describe what you want to build, and let your assistant handle the rest.
		</p>

		<!-- CTA Button -->
		<button
			class="btn btn-primary btn-lg h-14 px-8 rounded-full font-bold text-lg z-10 group hover:scale-105 transition-transform duration-200 shadow-lg"
			on:click={() => dispatch('login')}
		>
			<Sparkles class="w-5 h-5 mr-3" />
			Get Started for Free
			<ArrowRight class="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
		</button>

		<!-- Features Section -->
		<div class="mt-20 grid md:grid-cols-3 gap-8 text-left">
			<div class="p-6 bg-base-200 rounded-lg">
				<Bot class="w-8 h-8 text-primary mb-4" />
				<h3 class="text-lg font-semibold mb-2">AI-Powered Development</h3>
				<p class="text-base-content/70">Describe your app in plain English and watch it come to life. Your AI assistant handles the coding, from frontend to backend.</p>
			</div>
			<div class="p-6 bg-base-200 rounded-lg">
				<Database class="w-8 h-8 text-primary mb-4" />
				<h3 class="text-lg font-semibold mb-2">Integrated Database</h3>
				<p class="text-base-content/70">Manage your application's data with an integrated database. View, edit, and manage your data without leaving the studio.</p>
			</div>
			<div class="p-6 bg-base-200 rounded-lg">
				<CodeXml class="w-8 h-8 text-primary mb-4" />
				<h3 class="text-lg font-semibold mb-2">Live Code Editor</h3>
				<p class="text-base-content/70">Take control when you need to. The built-in VSCode editor lets you fine-tune your application's code at any time.</p>
			</div>
		</div>
	</div>

	<!-- Background Glow -->
	<div class="absolute bottom-0 z-0 w-[40rem] h-72 bg-gradient-to-t from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl"></div>
</div>
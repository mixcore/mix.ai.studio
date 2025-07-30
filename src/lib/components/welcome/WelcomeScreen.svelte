<script lang="ts">
	import { ArrowRight, Sparkles } from 'lucide-svelte';
	import { isAuthenticated } from '$lib/stores';

	let { onLogin, onGetStarted } = $props();
</script>

<div class="flex max-h-[100vh] min-h-[100vh] flex-col items-center justify-center overflow-hidden px-7 text-center antialiased">
	<!-- Logo/Brand -->
	<div class="flex items-center relative mt-0.5 laptop:mt-0 pointer-events-none mb-6">
		<div class="relative">
			<div class="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
				<div class="w-4 h-4 bg-white rounded-sm"></div>
			</div>
		</div>
		<div class="ml-3 text-2xl font-bold tracking-tight">
			mixcore<span class="text-primary">.</span>ai
		</div>
	</div>

	<!-- Main Heading -->
	<h1 class="my-6 text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
		Let's build something amazing!
	</h1>

	<!-- Subtitle -->
	<p class="mb-9 max-w-[35rem] text-lg md:text-xl text-base-content/70">
		Start creating with AI-powered development tools. 
		Turn your ideas into reality with intelligent assistance.
		<br> The future of development awaits! <span class="inline-block">✨</span>
	</p>

	<!-- CTA Button -->
	{#if $isAuthenticated}
		<button
			class="btn btn-primary h-12 px-6 rounded-2xl font-bold text-base z-10 w-full max-w-[18.75rem] group hover:scale-105 transition-transform duration-200"
			on:click={() => onGetStarted?.()}
		>
			<Sparkles class="w-4 h-4 mr-2" />
			Start Building
			<ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
		</button>
	{:else}
		<button
			class="btn btn-primary h-12 px-6 rounded-2xl font-bold text-base z-10 w-full max-w-[18.75rem] group hover:scale-105 transition-transform duration-200"
			on:click|preventDefault={() => dispatch('login')}
		>
			Get Started
			<ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
		</button>
	{/if}

	<!-- Background Glow -->
	<div class="absolute bottom-0 z-0 w-[33rem] h-64 bg-gradient-to-t from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl"></div>
</div>

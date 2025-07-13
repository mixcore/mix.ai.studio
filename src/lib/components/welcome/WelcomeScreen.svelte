<script lang="ts">
	import { Bot, Zap, Shield, Database, ArrowRight } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { isAuthenticated } from '$lib/stores';
	
	const dispatch = createEventDispatcher<{
		getStarted: void;
		login: void;
	}>();
	
	const features = [
		{
			icon: Bot,
			title: 'AI-Powered Development',
			description: 'Build applications with intelligent AI assistance and automated code generation.'
		},
		{
			icon: Zap,
			title: 'Real-time Collaboration',
			description: 'Work together with your team in real-time with live preview and instant updates.'
		},
		{
			icon: Database,
			title: 'Mixcore CMS Integration',
			description: 'Seamlessly integrate with Mixcore CMS for content management and data storage.'
		},
		{
			icon: Shield,
			title: 'Secure & Reliable',
			description: 'Enterprise-grade security with reliable cloud infrastructure and data protection.'
		}
	];
</script>

<div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
	<div class="max-w-6xl mx-auto">
		<!-- Hero Section -->
		<div class="text-center mb-16">
			<div class="flex items-center justify-center mb-8">
				<div class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
					<div class="w-8 h-8 bg-white rounded-md"></div>
				</div>
			</div>
			
			<h1 class="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
				MIXCORE AI STUDIO
			</h1>
			
			<p class="text-xl md:text-2xl text-base-content/70 mb-8 max-w-3xl mx-auto">
				The next-generation AI development platform powered by Mixcore CMS. 
				Build, collaborate, and deploy applications with intelligent assistance.
			</p>
			
			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				{#if $isAuthenticated}
					<button
						class="btn btn-primary btn-lg"
						on:click={() => dispatch('getStarted')}
					>
						<Bot class="w-5 h-5 mr-2" />
						Get Started
						<ArrowRight class="w-5 h-5 ml-2" />
					</button>
				{:else}
					<button
						class="btn btn-primary btn-lg"
						on:click={() => dispatch('login')}
					>
						<Bot class="w-5 h-5 mr-2" />
						Sign In to Get Started
						<ArrowRight class="w-5 h-5 ml-2" />
					</button>
					
					<button
						class="btn btn-outline btn-lg"
						on:click={() => dispatch('getStarted')}
					>
						Try Demo
					</button>
				{/if}
			</div>
		</div>
		
		<!-- Features Grid -->
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
			{#each features as feature}
				<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
					<div class="card-body items-center text-center p-6">
						<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
							<svelte:component this={feature.icon} class="w-6 h-6 text-primary" />
						</div>
						<h3 class="card-title text-lg mb-2">{feature.title}</h3>
						<p class="text-base-content/70 text-sm">{feature.description}</p>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Stats Section -->
		<!-- <div class="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 w-full">
			<div class="stat">
				<div class="stat-title">Projects Created</div>
				<div class="stat-value text-primary">1,000+</div>
				<div class="stat-desc">Across all users</div>
			</div>
			
			<div class="stat">
				<div class="stat-title">AI Completions</div>
				<div class="stat-value text-secondary">50K+</div>
				<div class="stat-desc">Code generations this month</div>
			</div>
			
			<div class="stat">
				<div class="stat-title">Active Users</div>
				<div class="stat-value">500+</div>
				<div class="stat-desc">Building amazing apps</div>
			</div>
			
			<div class="stat">
				<div class="stat-title">Uptime</div>
				<div class="stat-value text-accent">99.9%</div>
				<div class="stat-desc">Reliable infrastructure</div>
			</div>
		</div> -->
	</div>
</div>
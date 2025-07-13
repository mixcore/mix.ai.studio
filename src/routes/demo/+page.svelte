<script lang="ts">
	import { onMount } from 'svelte';
	
	let message = 'Hello, World!';
	let count = 0;
	
	onMount(() => {
		console.log('Demo app loaded');
	});
</script>

<svelte:head>
	<title>Demo App</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
	<div class="max-w-4xl mx-auto">
		<header class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">{message}</h1>
			<p class="text-lg text-gray-600">Welcome to your AI-generated application!</p>
		</header>

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Counter Card -->
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">Interactive Counter</h2>
				<div class="text-center">
					<div class="text-6xl font-bold text-blue-600 mb-4">{count}</div>
					<div class="space-x-4">
						<button 
							class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							on:click={() => count++}
						>
							Increment
						</button>
						<button 
							class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
							on:click={() => count = 0}
						>
							Reset
						</button>
					</div>
				</div>
			</div>

			<!-- Features Card -->
			<div class="bg-white rounded-xl shadow-lg p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
				<ul class="space-y-3">
					<li class="flex items-center">
						<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
						<span class="text-gray-700">Responsive Design</span>
					</li>
					<li class="flex items-center">
						<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
						<span class="text-gray-700">Interactive Components</span>
					</li>
					<li class="flex items-center">
						<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
						<span class="text-gray-700">Modern Styling</span>
					</li>
					<li class="flex items-center">
						<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
						<span class="text-gray-700">AI-Generated Code</span>
					</li>
				</ul>
			</div>

			<!-- Form Card -->
			<div class="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">Contact Form</h2>
				<form class="grid md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
						<input 
							type="text" 
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Your name"
						>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
						<input 
							type="email" 
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="your@email.com"
						>
					</div>
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
						<textarea 
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows="4"
							placeholder="Your message..."
						></textarea>
					</div>
					<div class="md:col-span-2">
						<button 
							type="submit"
							class="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
						>
							Send Message
						</button>
					</div>
				</form>
			</div>
		</div>

		<footer class="text-center mt-12 text-gray-500">
			<p>Built with ❤️ using SvelteKit and AI assistance</p>
		</footer>
	</div>
</main>
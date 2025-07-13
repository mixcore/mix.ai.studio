<script lang="ts">
	import { Palette, ChevronDown } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let currentTheme = 'dark';

	// Available daisyUI themes
	const themes = [
		{ name: 'dark', label: 'Dark', description: 'Default dark theme' },
		{ name: 'light', label: 'Light', description: 'Clean light theme' },
		{ name: 'cupcake', label: 'Cupcake', description: 'Sweet pink theme' },
		{ name: 'bumblebee', label: 'Bumblebee', description: 'Yellow accent theme' },
		{ name: 'emerald', label: 'Emerald', description: 'Green accent theme' },
		{ name: 'corporate', label: 'Corporate', description: 'Professional blue theme' },
		{ name: 'synthwave', label: 'Synthwave', description: 'Retro neon theme' },
		{ name: 'retro', label: 'Retro', description: 'Vintage warm theme' },
		{ name: 'cyberpunk', label: 'Cyberpunk', description: 'Futuristic yellow theme' },
		{ name: 'valentine', label: 'Valentine', description: 'Romantic pink theme' },
		{ name: 'halloween', label: 'Halloween', description: 'Spooky orange theme' },
		{ name: 'garden', label: 'Garden', description: 'Natural green theme' },
		{ name: 'forest', label: 'Forest', description: 'Deep green theme' },
		{ name: 'aqua', label: 'Aqua', description: 'Ocean blue theme' },
		{ name: 'lofi', label: 'Lo-Fi', description: 'Calm beige theme' },
		{ name: 'pastel', label: 'Pastel', description: 'Soft pastel theme' },
		{ name: 'fantasy', label: 'Fantasy', description: 'Magical purple theme' },
		{ name: 'wireframe', label: 'Wireframe', description: 'Minimal black & white' },
		{ name: 'black', label: 'Black', description: 'Pure black theme' },
		{ name: 'luxury', label: 'Luxury', description: 'Gold accent theme' },
		{ name: 'dracula', label: 'Dracula', description: 'Popular purple theme' },
		{ name: 'cmyk', label: 'CMYK', description: 'Print colors theme' },
		{ name: 'autumn', label: 'Autumn', description: 'Warm orange theme' },
		{ name: 'business', label: 'Business', description: 'Professional gray theme' },
		{ name: 'acid', label: 'Acid', description: 'Bright lime theme' },
		{ name: 'lemonade', label: 'Lemonade', description: 'Fresh yellow theme' },
		{ name: 'night', label: 'Night', description: 'Deep blue theme' },
		{ name: 'coffee', label: 'Coffee', description: 'Brown coffee theme' },
		{ name: 'winter', label: 'Winter', description: 'Cool blue theme' },
		{ name: 'dim', label: 'Dim', description: 'Muted dark theme' },
		{ name: 'nord', label: 'Nord', description: 'Arctic blue theme' },
		{ name: 'sunset', label: 'Sunset', description: 'Warm gradient theme' }
	];

	function setTheme(themeName: string) {
		const html = document.documentElement;
		html.setAttribute('data-theme', themeName);
		currentTheme = themeName;
		
		// Store preference
		localStorage.setItem('preferred-theme', themeName);
		
		// Close dropdown by removing focus
		document.activeElement?.blur();
	}

	onMount(() => {
		// Check for stored preference or default to black
		const storedTheme = localStorage.getItem('preferred-theme');
		const html = document.documentElement;
		
		if (storedTheme) {
			currentTheme = storedTheme;
			html.setAttribute('data-theme', storedTheme);
		} else {
			currentTheme = 'black';
			html.setAttribute('data-theme', 'black');
		}
	});
</script>

<div class="dropdown dropdown-end">
	<div 
		tabindex="0" 
		role="button" 
		class="btn btn-ghost btn-sm"
		title="Change theme"
	>
		<Palette class="w-4 h-4" />
		<ChevronDown class="w-3 h-3" />
	</div>
	
	<ul 
		tabindex="0" 
		class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto border border-base-300"
	>
		<li class="menu-title">
			<span class="text-sm font-medium">Select Theme</span>
		</li>
		
		{#each themes as theme}
			<li>
				<button
					class="flex flex-col items-start p-3 w-full text-left"
					class:bg-primary={currentTheme === theme.name}
					class:text-primary-content={currentTheme === theme.name}
					on:click={() => setTheme(theme.name)}
				>
					<div class="flex items-center justify-between w-full">
						<span class="font-medium">{theme.label}</span>
						{#if currentTheme === theme.name}
							<div class="badge badge-primary badge-sm">Active</div>
						{/if}
					</div>
					<span class="text-xs opacity-70 mt-1">{theme.description}</span>
					
					<!-- Theme Preview -->
					<div class="flex gap-1 mt-2" data-theme={theme.name}>
						<div class="w-3 h-3 rounded-full bg-primary"></div>
						<div class="w-3 h-3 rounded-full bg-secondary"></div>
						<div class="w-3 h-3 rounded-full bg-accent"></div>
						<div class="w-3 h-3 rounded-full bg-neutral"></div>
					</div>
				</button>
			</li>
		{/each}
	</ul>
</div>
<script lang="ts">
	import { User, Settings, LogOut } from 'lucide-svelte';
	import { user } from '$lib/stores';
</script>

<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
		<div class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
			{$user?.name?.[0] || 'U'}
		</div>
	</div>
	<ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
		<li class="menu-title">
			<span class="text-sm font-medium">{$user?.name || 'User'}</span>
			<span class="text-xs opacity-60">{$user?.email || 'user@example.com'}</span>
		</li>
		<li><a><User class="w-4 h-4" />Profile</a></li>
		<li><a><Settings class="w-4 h-4" />Settings</a></li>
		<li><a class="text-error"><LogOut class="w-4 h-4" />Sign out</a></li>
	</ul>
</div>
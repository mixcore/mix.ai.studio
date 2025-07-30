import { redirect } from '@sveltejs/kit';
import { isAuthenticated } from '$lib/stores';
import { get } from 'svelte/store';

export const load = async ({ url }) => {
    // Server-side auth check
    if (url.pathname !== '/welcome' && !get(isAuthenticated) && !import.meta.env.VITE_DEMO_MODE) {
        throw redirect(307, '/welcome');
    } else if (url.pathname === '/welcome' && get(isAuthenticated)) {
        throw redirect(307, '/');
    }

    return {};
};

import { redirect } from '@sveltejs/kit';
import { isAuthenticated } from '$lib/stores';
import { get } from 'svelte/store';

export const load = async () => {
    if (get(isAuthenticated)) {
        throw redirect(307, '/');
    }
    return {};
};

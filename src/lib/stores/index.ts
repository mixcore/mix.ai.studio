import { writable } from 'svelte/store';
import type { User, Project, ChatMessage, Workspace } from '$lib/types';

export const user = writable<User | null>(null);
export const currentProject = writable<Project | null>(null);
export const workspace = writable<Workspace | null>(null);

export const chatMessages = writable<ChatMessage[]>([]);
export const chatLoading = writable(false);
export const chatMode = writable<'default' | 'chat-only' | 'agent'>('default');
export const chatInput = writable('');

export const previewUrl = writable('');
export const previewLoading = writable(false);
export const showCodeView = writable(false);

export const showSettingsModal = writable(false);
export const showInviteModal = writable(false);
export const showPublishModal = writable(false);
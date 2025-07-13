export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

export interface Project {
	id: string;
	name: string;
	visibility: 'public' | 'private' | 'workspace';
	collaborators: User[];
	github?: GitHubConnection;
	supabase?: SupabaseConnection;
	createdAt: Date;
	updatedAt: Date;
}

export interface GitHubConnection {
	repository: string;
	branch: string;
	connected: boolean;
}

export interface SupabaseConnection {
	projectId: string;
	connected: boolean;
}

export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
	attachments?: string[];
}

export interface Workspace {
	id: string;
	name: string;
	members: User[];
}
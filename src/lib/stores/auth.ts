import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types/models';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let accessToken: string | null = null;

export function getAccessToken() {
	return accessToken;
}

export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, ($u) => $u !== null);

const sharedOpts: RequestInit = { credentials: 'include' };

export async function initAuth() {
	try {
		const res = await fetch(`${API_BASE}/auth/tokens`, {
			method: 'POST',
			credentials: 'include'
		});
		if (!res.ok) {
			accessToken = null;
			currentUser.set(null);
			return;
		}
		const body = await res.json();
		accessToken = body.data.access_token;
		await fetchUser();
	} catch {
		accessToken = null;
		currentUser.set(null);
	}
}

export async function fetchUser() {
	if (!accessToken) return;
	try {
		const res = await fetch(`${API_BASE}/auth/user`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			...sharedOpts
		});
		if (!res.ok) throw new Error('fetch user failed');
		const body = await res.json();
		currentUser.set(body.data);
	} catch {
		accessToken = null;
		currentUser.set(null);
	}
}

export async function login(username: string, password: string) {
	const res = await fetch(`${API_BASE}/auth/sessions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		...sharedOpts
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Login failed' } }));
		throw new Error(err.error?.message || 'Login failed');
	}
	const body = await res.json();
	accessToken = body.data.access_token;
	currentUser.set(body.data.user);
}

export async function register(invite_code: string, username: string, email: string, password: string) {
	const res = await fetch(`${API_BASE}/auth/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ invite_code, username, email, password }),
		...sharedOpts
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Registration failed' } }));
		throw new Error(err.error?.message || 'Registration failed');
	}
	const body = await res.json();
	accessToken = body.data.access_token;
	currentUser.set(body.data.user);
}

export async function logout() {
	try {
		await fetch(`${API_BASE}/auth/sessions`, {
			method: 'DELETE',
			...sharedOpts
		});
	} catch { /* ignore */ }
	accessToken = null;
	currentUser.set(null);
}

export async function apiFetch(path: string, options: RequestInit = {}) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	}

	if (!options.method || options.method === 'POST') {
		headers['Idempotency-Key'] = crypto.randomUUID();
	}

	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		credentials: 'include',
		headers
	});

	if (res.status === 401) {
		const refreshRes = await fetch(`${API_BASE}/auth/tokens`, {
			method: 'POST',
			credentials: 'include'
		});
		if (refreshRes.ok) {
			const body = await refreshRes.json();
			accessToken = body.data.access_token;
			const retryHeaders: Record<string, string> = {
				...headers,
				Authorization: `Bearer ${accessToken}`
			};
			if (!options.method || options.method === 'POST') {
				retryHeaders['Idempotency-Key'] = crypto.randomUUID();
			}
			return fetch(`${API_BASE}${path}`, {
				...options,
				credentials: 'include',
				headers: retryHeaders
			});
		}
		accessToken = null;
		currentUser.set(null);
	}

	return res;
}

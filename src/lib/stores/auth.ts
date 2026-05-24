import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types/models';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let accessToken: string | null = null;

export function getAccessToken() {
	return accessToken;
}

export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, ($u) => $u !== null);

const REFRESH_KEY = 'message_refresh_token';

function getStoredRefresh(): string | null {
	try {
		return localStorage.getItem(REFRESH_KEY);
	} catch {
		return null;
	}
}

function setStoredRefresh(token: string) {
	try {
		localStorage.setItem(REFRESH_KEY, token);
	} catch { /* noop */ }
}

function clearStoredRefresh() {
	try {
		localStorage.removeItem(REFRESH_KEY);
	} catch { /* noop */ }
}

export async function initAuth() {
	const stored = getStoredRefresh();
	if (!stored) return;

	try {
		const res = await fetch(`${API_BASE}/auth/tokens`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refresh_token: stored })
		});
		if (!res.ok) throw new Error('refresh failed');
		const body = await res.json();
		accessToken = body.data.access_token;
		setStoredRefresh(body.data.refresh_token);
		await fetchUser();
	} catch {
		clearStoredRefresh();
		accessToken = null;
	}
}

export async function fetchUser() {
	if (!accessToken) return;
	const res = await fetch(`${API_BASE}/auth/user`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error('fetch user failed');
	const body = await res.json();
	currentUser.set(body.data);
}

export async function login(username: string, password: string) {
	const res = await fetch(`${API_BASE}/auth/sessions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Login failed' } }));
		throw new Error(err.error?.message || 'Login failed');
	}
	const body = await res.json();
	accessToken = body.data.access_token;
	setStoredRefresh(body.data.refresh_token);
	await fetchUser();
}

export async function register(username: string, email: string, password: string) {
	const res = await fetch(`${API_BASE}/auth/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email, password })
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Registration failed' } }));
		throw new Error(err.error?.message || 'Registration failed');
	}
	const body = await res.json();
	accessToken = body.data.access_token;
	setStoredRefresh(body.data.refresh_token);
	await fetchUser();
}

export async function logout() {
	try {
		const stored = getStoredRefresh();
		if (stored && accessToken) {
			await fetch(`${API_BASE}/auth/sessions`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({ refresh_token: stored })
			});
		}
	} catch { /* ignore */ }
	accessToken = null;
	clearStoredRefresh();
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

	const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

	if (res.status === 401 && getStoredRefresh()) {
		const stored = getStoredRefresh()!;
		const refreshRes = await fetch(`${API_BASE}/auth/tokens`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refresh_token: stored })
		});
		if (refreshRes.ok) {
			const body = await refreshRes.json();
			accessToken = body.data.access_token;
			setStoredRefresh(body.data.refresh_token);
			const retryHeaders: Record<string, string> = {
				...headers,
				Authorization: `Bearer ${accessToken}`,
			};
			if (!options.method || options.method === 'POST') {
				retryHeaders['Idempotency-Key'] = crypto.randomUUID();
			}
			const retry = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders });
			return retry;
		}
		clearStoredRefresh();
		accessToken = null;
		currentUser.set(null);
	}

	return res;
}

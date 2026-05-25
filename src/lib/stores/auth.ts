import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types/models';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'auth_token';

let accessToken: string | null = null;

export function getAccessToken() {
	return accessToken;
}

export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, ($u) => $u !== null);

const sharedOpts: RequestInit = { credentials: 'include' };

function setToken(token: string | null) {
	accessToken = token;
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	} else {
		localStorage.removeItem(TOKEN_KEY);
	}
}

function clearAuth() {
	setToken(null);
	currentUser.set(null);
}

export async function initAuth() {
	const cachedToken = localStorage.getItem(TOKEN_KEY);
	if (cachedToken) {
		setToken(cachedToken);
		await fetchUser();
		if (accessToken) return;
	}

	try {
		const res = await fetch(`${API_BASE}/auth/tokens`, {
			method: 'POST',
			credentials: 'include'
		});
		if (!res.ok) {
			clearAuth();
			return;
		}
		const body = await res.json();
		setToken(body.data.access_token);
		await fetchUser();
	} catch {
		clearAuth();
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
		clearAuth();
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
	setToken(body.data.access_token);
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
	setToken(body.data.access_token);
	currentUser.set(body.data.user);
}

export async function logout() {
	try {
		await fetch(`${API_BASE}/auth/sessions`, {
			method: 'DELETE',
			...sharedOpts
		});
	} catch { /* ignore */ }
	clearAuth();
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
			setToken(body.data.access_token);
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
		clearAuth();
	}

	return res;
}

export async function requestPasswordReset(email: string) {
	const res = await fetch(`${API_BASE}/auth/password-reset`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	});
	if (!res.ok) return;
	const body = await res.json();
	return body.data?.message as string;
}

export async function confirmPasswordReset(token: string, password: string) {
	const res = await fetch(`${API_BASE}/auth/password-reset/confirm`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, password })
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Reset failed' } }));
		throw new Error(err.error?.message || 'Password reset failed');
	}
	const body = await res.json();
	return body.data?.message as string;
}

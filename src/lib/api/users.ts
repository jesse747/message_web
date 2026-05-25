import { apiFetch } from '$lib/stores/auth';
import type { User } from '$lib/types/models';

export async function fetchCurrentUser() {
	const res = await apiFetch('/auth/user');
	if (!res.ok) throw new Error('Failed to fetch user');
	const body = await res.json();
	return body.data as User;
}

export async function updateUser(id: number, data: Partial<Pick<User, 'display_name'>>) {
	const res = await apiFetch(`/users/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Failed to update' } }));
		throw new Error(err.error?.message || 'Failed to update user');
	}
	const body = await res.json();
	return body.data as User;
}

import { apiFetch } from '$lib/stores/auth';
import type { Person } from '$lib/types/models';

export interface PersonListResponse {
	data: Person[];
	meta: { page: number; limit: number; total: number; pages: number };
}

export interface PersonDetailResponse {
	data: Person & {
		relationships: Array<{ id: number; person_id: number; relationship_type: string }>;
	};
}

export async function fetchPersons(params: {
	q?: string;
	team_id?: number;
	membership_status?: string;
	page?: number;
	limit?: number;
} = {}) {
	const search = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined) search.set(k, String(v));
	}
	const qs = search.toString();
	const res = await apiFetch(`/persons${qs ? '?' + qs : ''}`);
	if (!res.ok) throw new Error('Failed to fetch persons');
	return (await res.json()) as PersonListResponse;
}

export async function fetchPerson(id: number) {
	const res = await apiFetch(`/persons/${id}`);
	if (!res.ok) throw new Error('Failed to fetch person');
	return (await res.json()) as PersonDetailResponse;
}

export async function createPerson(data: Partial<Person> & { first_name: string; last_name: string }) {
	const res = await apiFetch('/persons', {
		method: 'POST',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Failed to create' } }));
		throw new Error(err.error?.message || 'Failed to create person');
	}
	return (await res.json()) as { data: Person };
}

export async function updatePerson(id: number, data: Partial<Person>) {
	const res = await apiFetch(`/persons/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: { message: 'Failed to update' } }));
		throw new Error(err.error?.message || 'Failed to update person');
	}
	return (await res.json()) as { data: Person };
}

export async function deletePerson(id: number) {
	const res = await apiFetch(`/persons/${id}`, { method: 'DELETE' });
	if (!res.ok && res.status !== 204) {
		throw new Error('Failed to delete person');
	}
}

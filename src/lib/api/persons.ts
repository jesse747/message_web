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

function formatError(err: Record<string, unknown>): string {
	const msg = (err?.error as { message?: string })?.message;
	const details = (err?.error as { details?: Record<string, string[]> })?.details;
	if (details) {
		const fieldMsgs = Object.entries(details)
			.filter(([, v]) => v?.length)
			.map(([k, v]) => `${k}: ${v![0]}`)
			.join('; ');
		if (fieldMsgs) return fieldMsgs;
	}
	return (msg as string) || 'Request failed';
}

export async function createPerson(data: Partial<Person> & { first_name: string; last_name: string }) {
	const res = await apiFetch('/persons', {
		method: 'POST',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(formatError(err));
	}
	return (await res.json()) as { data: Person };
}

export async function updatePerson(id: number, data: Partial<Person>) {
	const res = await apiFetch(`/persons/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(formatError(err));
	}
	return (await res.json()) as { data: Person };
}

export async function deletePerson(id: number) {
	const res = await apiFetch(`/persons/${id}`, { method: 'DELETE' });
	if (!res.ok && res.status !== 204) {
		throw new Error('Failed to delete person');
	}
}

export async function fetchUnlinkedPersons(): Promise<Person[]> {
	const res = await apiFetch('/persons?limit=100');
	if (!res.ok) throw new Error('Failed to fetch persons');
	const body = await res.json();
	return ((body.data as Person[]) || []).filter((p) => !p.user_id);
}

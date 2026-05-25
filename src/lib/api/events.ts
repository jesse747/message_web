import { apiFetch } from '$lib/stores/auth';
import type { EventType, PersonEvent } from '$lib/types/models';

export async function fetchEventTypes(all = false): Promise<EventType[]> {
	const qs = all ? '?all=true' : '';
	const res = await apiFetch(`/event-types${qs}`);
	if (!res.ok) throw new Error('Failed to fetch event types');
	const body = await res.json();
	return body.data as EventType[];
}

export async function fetchEvents(personId: number): Promise<PersonEvent[]> {
	const res = await apiFetch(`/persons/${personId}/events?limit=100`);
	if (!res.ok) throw new Error('Failed to fetch events');
	const body = await res.json();
	return body.data as PersonEvent[];
}

export async function createEvent(
	personId: number,
	data: { event_type_id: number; event_date: string; location?: string; notes?: string }
): Promise<PersonEvent> {
	const res = await apiFetch(`/persons/${personId}/events`, {
		method: 'POST',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		const msg = (err?.error as { message?: string })?.message;
		throw new Error(msg || 'Failed to create event');
	}
	const body = await res.json();
	return body.data as PersonEvent;
}

export async function updateEvent(
	personId: number,
	eventId: number,
	data: { event_type_id?: number; event_date?: string; location?: string; notes?: string }
): Promise<PersonEvent> {
	const res = await apiFetch(`/persons/${personId}/events/${eventId}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		const msg = (err?.error as { message?: string })?.message;
		throw new Error(msg || 'Failed to update event');
	}
	const body = await res.json();
	return body.data as PersonEvent;
}

export async function deleteEvent(personId: number, eventId: number): Promise<void> {
	const res = await apiFetch(`/persons/${personId}/events/${eventId}`, {
		method: 'DELETE'
	});
	if (!res.ok && res.status !== 204) {
		throw new Error('Failed to delete event');
	}
}

export async function createEventType(data: { name: string; description?: string }): Promise<EventType> {
	const res = await apiFetch('/event-types', {
		method: 'POST',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		const msg = (err?.error as { message?: string })?.message;
		throw new Error(msg || 'Failed to create event type');
	}
	const body = await res.json();
	return body.data as EventType;
}

export async function updateEventType(
	id: number,
	data: { name?: string; description?: string; is_active?: boolean }
): Promise<EventType> {
	const res = await apiFetch(`/event-types/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		const msg = (err?.error as { message?: string })?.message;
		throw new Error(msg || 'Failed to update event type');
	}
	const body = await res.json();
	return body.data as EventType;
}

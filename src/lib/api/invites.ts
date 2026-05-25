import { apiFetch } from '$lib/stores/auth';
import type { InviteToken } from '$lib/types/models';

export async function fetchInvites(status?: string): Promise<InviteToken[]> {
	const qs = status ? `?status=${status}` : '';
	const res = await apiFetch(`/admin/invites${qs}`);
	if (!res.ok) throw new Error('Failed to fetch invites');
	const body = await res.json();
	return body.data as InviteToken[];
}

export async function createInvite(
	personId: number,
	email: string,
	expiresInDays = 7
): Promise<InviteToken> {
	const res = await apiFetch('/admin/invites', {
		method: 'POST',
		body: JSON.stringify({ person_id: personId, email, expires_in_days: expiresInDays })
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		const msg = (err?.error as { message?: string })?.message;
		throw new Error(msg || 'Failed to create invite');
	}
	const body = await res.json();
	return body.data as InviteToken;
}

export async function revokeInvite(inviteId: number): Promise<void> {
	const res = await apiFetch(`/admin/invites/${inviteId}`, {
		method: 'DELETE'
	});
	if (!res.ok && res.status !== 204) {
		throw new Error('Failed to revoke invite');
	}
}

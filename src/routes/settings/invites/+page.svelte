<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth';
	import { fetchInvites, createInvite, revokeInvite } from '$lib/api/invites';
	import { fetchUnlinkedPersons } from '$lib/api/persons';
	import type { InviteToken, Person } from '$lib/types/models';
	import { Card, Button, Input, Label, Alert, Modal, Badge, Select } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';

	const canManageUsers = $derived($currentUser?.capabilities?.includes('manage_users') ?? false);

	let invites = $state<InviteToken[]>([]);
	let inviteFilter = $state('active');
	let error = $state('');

	let showInviteModal = $state(false);
	let unlinkedPersons = $state<Person[]>([]);
	let invitePersonId = $state<number | null>(null);
	let inviteEmail = $state('');
	let inviteSaving = $state(false);
	let inviteError = $state('');

	onMount(() => {
		if (canManageUsers) loadInvites();
	});

	async function loadInvites() {
		try {
			invites = await fetchInvites(inviteFilter === 'all' ? undefined : inviteFilter);
		} catch { /* ignore */ }
	}

	async function openNewInviteModal() {
		invitePersonId = null;
		inviteEmail = '';
		inviteError = '';
		try {
			unlinkedPersons = await fetchUnlinkedPersons();
		} catch {
			unlinkedPersons = [];
		}
		showInviteModal = true;
	}

	async function handleSendInvite() {
		inviteError = '';
		if (!invitePersonId) {
			inviteError = 'Person is required';
			return;
		}
		if (!inviteEmail.trim()) {
			inviteError = 'Email is required';
			return;
		}
		inviteSaving = true;
		try {
			await createInvite(invitePersonId, inviteEmail.trim());
			showInviteModal = false;
			await loadInvites();
		} catch (e: unknown) {
			inviteError = e instanceof Error ? e.message : 'Failed to send invite';
		} finally {
			inviteSaving = false;
		}
	}

	async function handleRevoke(inviteId: number) {
		try {
			await revokeInvite(inviteId);
			invites = invites.map((i) => (i.id === inviteId ? { ...i, is_active: false } : i));
		} catch {
			error = 'Failed to revoke invite';
		}
	}

	function formatDate(iso: string) {
		return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="mx-auto max-w-3xl">
	<a
		href="/settings"
		class="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400"
	>
		<ArrowLeftOutline class="h-4 w-4" />
		Settings
	</a>
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Invites</h1>

	{#if !canManageUsers}
		<Card class="p-6" size="xl">
			<p class="text-gray-500 dark:text-gray-400">You need the Manage Users capability to manage invites.</p>
		</Card>
	{:else}
		<Card class="p-6" size="xl">
			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Manage registration invitations for persons without user accounts.
				</p>
				<Button size="sm" onclick={openNewInviteModal}>New Invite</Button>
			</div>

			<div class="mt-4 flex gap-2">
				{#each [{ label: 'Active', value: 'active' }, { label: 'Used', value: 'used' }, { label: 'Expired', value: 'expired' }, { label: 'All', value: 'all' }] as f}
					<button
						onclick={() => { inviteFilter = f.value; loadInvites(); }}
						class="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
						class:bg-primary-100={inviteFilter === f.value}
						class:text-primary-700={inviteFilter === f.value}
						class:bg-gray-100={inviteFilter !== f.value}
						class:text-gray-600={inviteFilter !== f.value}
						class:dark:bg-primary-900={inviteFilter === f.value}
						class:dark:text-primary-300={inviteFilter === f.value}
						class:dark:bg-gray-700={inviteFilter !== f.value}
						class:dark:text-gray-300={inviteFilter !== f.value}
					>
						{f.label}
					</button>
				{/each}
			</div>

			{#if invites.length === 0}
				<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">No invites found.</p>
			{:else}
				<div class="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
					{#each invites as inv}
						<div class="flex items-start justify-between gap-4 py-3">
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<span class="font-medium text-gray-900 dark:text-white">{inv.email}</span>
									{#if inv.is_used}
										<Badge color="gray">Used</Badge>
									{:else if inv.is_expired}
										<Badge color="red">Expired</Badge>
									{:else if inv.is_active}
										<Badge color="green">Active</Badge>
									{/if}
								</div>
								<div class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
									<span>Code: {inv.code.slice(0, 16)}&hellip;</span>
									{#if inv.is_used && inv.used_at}
										<span>Used {formatDate(inv.used_at)}</span>
									{:else}
										<span>Expires {formatDate(inv.expires_at)}</span>
									{/if}
								</div>
							</div>
							{#if inv.is_active && !inv.is_used}
								<Button size="xs" color="red" outline onclick={() => handleRevoke(inv.id)}>Revoke</Button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	{/if}
</div>

<Modal bind:open={showInviteModal} title="New Invite" size="md">
	<div class="space-y-4">
		<div>
			<Label for="invite_person" class="mb-1 block">Person</Label>
			<Select
				id="invite_person"
				items={unlinkedPersons.map((p) => ({ name: `${p.first_name} ${p.last_name}`, value: p.id }))}
				bind:value={invitePersonId}
				placeholder="Select person"
			/>
		</div>
		<div>
			<Label for="invite_email" class="mb-1 block">Email</Label>
			<Input id="invite_email" type="email" bind:value={inviteEmail} placeholder="Email address" />
		</div>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			The invite link will be emailed to this address. They will use it to register their account.
		</p>
		{#if inviteError}
			<Alert color="red">{inviteError}</Alert>
		{/if}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => (showInviteModal = false)}>Cancel</Button>
			<Button onclick={handleSendInvite} loading={inviteSaving}>Send Invite</Button>
		</div>
	</div>
</Modal>

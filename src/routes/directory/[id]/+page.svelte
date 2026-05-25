<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchPerson, deletePerson } from '$lib/api/persons';
	import {
		fetchEventTypes,
		fetchEvents,
		createEvent,
		updateEvent,
		deleteEvent
	} from '$lib/api/events';
	import { fetchInvites, createInvite } from '$lib/api/invites';
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Person, PersonEvent, EventType, InviteToken } from '$lib/types/models';
	import {
		Button,
		Spinner,
		Alert,
		Modal,
		Card,
		Badge,
		Select,
		Input,
		Textarea,
		Label,
		Helper
	} from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';

	let person = $state<Person | null>(null);
	let loading = $state(true);
	let error = $state('');
	let showDeleteModal = $state(false);

	let eventTypes = $state<EventType[]>([]);
	let events = $state<PersonEvent[]>([]);

	let showCreateEventModal = $state(false);
	let showEditEventModal = $state(false);
	let showDeleteEventModal = $state(false);

	let eventTypeId = $state<number | null>(null);
	let eventDate = $state('');
	let eventLocation = $state('');
	let eventNotes = $state('');
	let editingEventId = $state<number | null>(null);
	let deletingEventId = $state<number | null>(null);
	let eventError = $state('');
	let eventSaving = $state(false);
	let eventFieldErrors = $state<Record<string, string>>({});

	let pendingInvite = $state<InviteToken | null>(null);
	let showInviteModal = $state(false);
	let inviteEmail = $state('');
	let inviteSaving = $state(false);
	let inviteError = $state('');

	const id = $derived(Number($page.params.id));
	const canEdit = $derived($currentUser?.capabilities?.includes('edit_directory') ?? false);
	const canManageUsers = $derived($currentUser?.capabilities?.includes('manage_users') ?? false);
	const canDelete = $derived($currentUser?.role === 'admin');

	onMount(async () => {
		await loadPerson();
		loadEventTypes();
		loadEvents();
		loadInvite();
	});

	async function loadPerson() {
		loading = true;
		error = '';
		try {
			const res = await fetchPerson(id);
			person = res.data;
			if (res.data.events) events = res.data.events;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			loading = false;
		}
	}

	async function loadEventTypes() {
		try {
			eventTypes = await fetchEventTypes();
		} catch { /* ignore */ }
	}

	async function loadEvents() {
		try {
			events = await fetchEvents(id);
		} catch { /* ignore */ }
	}

	function resetEventForm() {
		eventTypeId = null;
		eventDate = '';
		eventLocation = '';
		eventNotes = '';
		eventError = '';
		eventFieldErrors = {};
	}

	function openCreateEventModal() {
		resetEventForm();
		showCreateEventModal = true;
	}

	function openEditEventModal(ev: PersonEvent) {
		resetEventForm();
		editingEventId = ev.id;
		eventTypeId = ev.event_type_id;
		eventDate = ev.event_date;
		eventLocation = ev.location ?? '';
		eventNotes = ev.notes ?? '';
		showEditEventModal = true;
	}

	function openDeleteEventModal(eventId: number) {
		deletingEventId = eventId;
		showDeleteEventModal = true;
	}

	function validateEventForm() {
		eventFieldErrors = {};
		if (!eventTypeId) eventFieldErrors['event_type_id'] = 'Event type is required';
		if (!eventDate.trim()) eventFieldErrors['event_date'] = 'Date is required';
		return Object.keys(eventFieldErrors).length === 0;
	}

	async function handleCreateEvent() {
		eventError = '';
		if (!validateEventForm()) return;
		eventSaving = true;
		try {
			const ev = await createEvent(id, {
				event_type_id: eventTypeId!,
				event_date: eventDate,
				location: eventLocation.trim() || undefined,
				notes: eventNotes.trim() || undefined
			});
			events = [ev, ...events];
			showCreateEventModal = false;
		} catch (e: unknown) {
			eventError = e instanceof Error ? e.message : 'Failed to create event';
		} finally {
			eventSaving = false;
		}
	}

	async function handleUpdateEvent() {
		eventError = '';
		if (!validateEventForm() || editingEventId === null) return;
		eventSaving = true;
		try {
			const ev = await updateEvent(id, editingEventId, {
				event_type_id: eventTypeId ?? undefined,
				event_date: eventDate,
				location: eventLocation.trim() || undefined,
				notes: eventNotes.trim() || undefined
			});
			events = events.map((e) => (e.id === ev.id ? ev : e));
			showEditEventModal = false;
		} catch (e: unknown) {
			eventError = e instanceof Error ? e.message : 'Failed to update event';
		} finally {
			eventSaving = false;
		}
	}

	async function handleDeleteEvent() {
		if (deletingEventId === null) return;
		showDeleteEventModal = false;
		try {
			await deleteEvent(id, deletingEventId);
			events = events.filter((e) => e.id !== deletingEventId);
		} catch {
			eventError = 'Failed to delete event';
		}
	}

	async function loadInvite() {
		if (!canManageUsers) return;
		try {
			const invites = await fetchInvites('active');
			pendingInvite = invites.find((i) => i.person_id === id && i.is_valid) ?? null;
		} catch { /* ignore */ }
	}

	function openInviteModal() {
		inviteEmail = person?.email_personal ?? '';
		inviteError = '';
		showInviteModal = true;
	}

	async function handleSendInvite() {
		inviteError = '';
		if (!inviteEmail.trim()) {
			inviteError = 'Email is required';
			return;
		}
		inviteSaving = true;
		try {
			const inv = await createInvite(id, inviteEmail.trim());
			pendingInvite = inv;
			showInviteModal = false;
		} catch (e: unknown) {
			inviteError = e instanceof Error ? e.message : 'Failed to send invite';
		} finally {
			inviteSaving = false;
		}
	}

	async function confirmDeletePerson() {
		showDeleteModal = false;
		try {
			await deletePerson(id);
			goto('/directory');
		} catch {
			error = 'Failed to delete';
		}
	}

	function formatName(p: Person) {
		return `${p.first_name} ${p.last_name}`;
	}

	function formatDate(iso?: string) {
		if (!iso) return '';
		return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="mx-auto max-w-3xl">
	<a
		href="/directory"
		class="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400"
	>
		<ArrowLeftOutline class="h-4 w-4" />
		Back to Directory
	</a>

	{#if loading}
		<div class="flex justify-center py-16">
			<Spinner size="8" />
		</div>
	{:else if error}
		<Alert color="red" class="mb-4">{error}</Alert>
		<Button onclick={loadPerson} size="sm">Retry</Button>
	{:else if person}
		<Card class="p-6" size="xl">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{formatName(person)}</h1>
				<div class="flex gap-2">
					{#if canEdit}
						<Button href="/directory/new?edit={person.id}">Edit</Button>
					{/if}
					{#if !person.user_id && canManageUsers}
						<Button color="green" onclick={openInviteModal}>Invite to Register</Button>
					{/if}
					{#if canDelete}
						<Button color="red" onclick={() => (showDeleteModal = true)}>Delete</Button>
					{/if}
				</div>
			</div>

			{#if canManageUsers && pendingInvite}
				<Alert color="blue" class="mb-4">
					An invite was sent to <strong>{pendingInvite.email}</strong> on {formatDate(pendingInvite.created_at)}. Expires {formatDate(pendingInvite.expires_at)}.
				</Alert>
			{/if}

			<div class="grid grid-cols-2 gap-4 text-sm">
				{#if canEdit && person.date_of_birth}
					<div>
						<p class="text-gray-500 dark:text-gray-400">Date of Birth</p>
						<p class="font-medium text-gray-900 dark:text-white">{formatDate(person.date_of_birth)}</p>
					</div>
				{/if}
				{#if person.address_street || person.address_city || person.address_region || person.address_postal_code || person.address_country}
					<div class="col-span-2">
						<p class="text-gray-500 dark:text-gray-400">Address</p>
						<div class="font-medium text-gray-900 dark:text-white">
							{#if person.address_street}<p>{person.address_street}</p>{/if}
							<p>
								{[person.address_city, person.address_region, person.address_postal_code].filter(Boolean).join(', ') || ''}
							</p>
							{#if person.address_country}<p>{person.address_country}</p>{/if}
						</div>
					</div>
				{:else if person.address}
					<div class="col-span-2">
						<p class="text-gray-500 dark:text-gray-400">Address</p>
						<p class="font-medium text-gray-900 dark:text-white">{person.address}</p>
					</div>
				{/if}
				{#if person.email_personal}
					<div>
						<p class="text-gray-500 dark:text-gray-400">Email</p>
						<p class="font-medium text-gray-900 dark:text-white">{person.email_personal}</p>
					</div>
				{/if}
				{#if person.email_work}
					<div>
						<p class="text-gray-500 dark:text-gray-400">Work Email</p>
						<p class="font-medium text-gray-900 dark:text-white">{person.email_work}</p>
					</div>
				{/if}
				{#if person.phone_mobile}
					<div>
						<p class="text-gray-500 dark:text-gray-400">Mobile</p>
						<p class="font-medium text-gray-900 dark:text-white">{person.phone_mobile}</p>
					</div>
				{/if}
				{#if person.phone_home}
					<div>
						<p class="text-gray-500 dark:text-gray-400">Home Phone</p>
						<p class="font-medium text-gray-900 dark:text-white">{person.phone_home}</p>
					</div>
				{/if}
				{#if person.phone_work}
					<div>
						<p class="text-gray-500 dark:text-gray-400">Work Phone</p>
						<p class="font-medium text-gray-900 dark:text-white">{person.phone_work}</p>
					</div>
				{/if}
				{#if canEdit && (person.emergency_contact_name || person.emergency_contact_phone)}
					<div class="col-span-2">
						<p class="text-gray-500 dark:text-gray-400">Emergency Contact</p>
						<p class="font-medium text-gray-900 dark:text-white">
							{person.emergency_contact_name}
							{#if person.emergency_contact_name && person.emergency_contact_phone} — {/if}
							{person.emergency_contact_phone}
						</p>
					</div>
				{/if}
				{#if canEdit}
					{#if person.membership_status}
						<div>
							<p class="text-gray-500 dark:text-gray-400">Status</p>
							<p class="font-medium text-gray-900 dark:text-white">{person.membership_status}</p>
						</div>
					{/if}
					{#if person.membership_type}
						<div>
							<p class="text-gray-500 dark:text-gray-400">Type</p>
							<p class="font-medium text-gray-900 dark:text-white">{person.membership_type}</p>
						</div>
					{/if}
					{#if person.membership_number}
						<div>
							<p class="text-gray-500 dark:text-gray-400">Member #</p>
							<p class="font-medium text-gray-900 dark:text-white">{person.membership_number}</p>
						</div>
					{/if}
					{#if person.membership_notes}
						<div class="col-span-2">
							<p class="text-gray-500 dark:text-gray-400">Membership Notes</p>
							<p class="font-medium text-gray-900 dark:text-white">{person.membership_notes}</p>
						</div>
					{/if}
					{#if person.notes}
						<div class="col-span-2">
							<p class="text-gray-500 dark:text-gray-400">Notes</p>
							<p class="font-medium text-gray-900 dark:text-white">{person.notes}</p>
						</div>
					{/if}
				{/if}
			</div>

			{#if events.length > 0 && canEdit}
				<hr class="my-6 border-gray-200 dark:border-gray-700" />

				<div class="flex items-center justify-between">
					<h2 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Events
					</h2>
					{#if canEdit}
						<Button size="xs" onclick={openCreateEventModal}>Add Event</Button>
					{/if}
				</div>

				{#if events.length > 0}
					<div class="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
						{#each events as ev}
							<div class="flex items-start justify-between gap-4 py-3">
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<Badge>{ev.event_type}</Badge>
										<span class="text-sm text-gray-500 dark:text-gray-400">
											{formatDate(ev.event_date)}
										</span>
									</div>
									{#if ev.location}
										<p class="mt-1 text-sm text-gray-700 dark:text-gray-300">{ev.location}</p>
									{/if}
									{#if ev.notes}
										<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{ev.notes}</p>
									{/if}
								</div>
								{#if canEdit}
									<div class="flex shrink-0 gap-1">
										<Button size="xs" outline onclick={() => openEditEventModal(ev)}>Edit</Button>
										<Button size="xs" color="red" outline onclick={() => openDeleteEventModal(ev.id)}>Del</Button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<p class="mt-3 text-sm text-gray-500 dark:text-gray-400">No events recorded yet.</p>
				{/if}
			{/if}
		</Card>
	{/if}
</div>

<!-- Delete Person Modal -->
<Modal bind:open={showDeleteModal} title="Delete Person" size="sm">
	<p class="text-gray-600 dark:text-gray-400">Are you sure you want to delete this person? This action cannot be undone.</p>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => (showDeleteModal = false)}>Cancel</Button>
			<Button color="red" onclick={confirmDeletePerson}>Delete</Button>
		</div>
	{/snippet}
</Modal>

<!-- Create / Edit Event Modal -->
<Modal bind:open={showCreateEventModal} title="Add Event" size="md">
	<div class="space-y-4">
		<div>
			<Label for="event_type_id" class="mb-1 block">Event Type</Label>
			<Select
				id="event_type_id"
				items={eventTypes.map((t) => ({ name: t.name, value: t.id }))}
				bind:value={eventTypeId}
				placeholder="Select type"
			/>
			{#if eventFieldErrors['event_type_id']}
				<Helper color="red">{eventFieldErrors['event_type_id']}</Helper>
			{/if}
		</div>
		<div>
			<Label for="event_date" class="mb-1 block">Date</Label>
			<Input id="event_date" type="date" bind:value={eventDate} />
			{#if eventFieldErrors['event_date']}
				<Helper color="red">{eventFieldErrors['event_date']}</Helper>
			{/if}
		</div>
		<div>
			<Label for="event_location" class="mb-1 block">Location</Label>
			<Input id="event_location" type="text" bind:value={eventLocation} placeholder="Location" />
		</div>
		<div>
			<Label for="event_notes" class="mb-1 block">Notes</Label>
			<Textarea id="event_notes" bind:value={eventNotes} placeholder="Notes" rows={2} class="w-full" />
		</div>
		{#if eventError}
			<Alert color="red">{eventError}</Alert>
		{/if}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => (showCreateEventModal = false)}>Cancel</Button>
			<Button onclick={handleCreateEvent} loading={eventSaving}>Save</Button>
		</div>
	</div>
</Modal>

<!-- Edit Event Modal -->
<Modal bind:open={showEditEventModal} title="Edit Event" size="md">
	<div class="space-y-4">
		<div>
			<Label for="edit_event_type_id" class="mb-1 block">Event Type</Label>
			<Select
				id="edit_event_type_id"
				items={eventTypes.map((t) => ({ name: t.name, value: t.id }))}
				bind:value={eventTypeId}
				placeholder="Select type"
			/>
			{#if eventFieldErrors['event_type_id']}
				<Helper color="red">{eventFieldErrors['event_type_id']}</Helper>
			{/if}
		</div>
		<div>
			<Label for="edit_event_date" class="mb-1 block">Date</Label>
			<Input id="edit_event_date" type="date" bind:value={eventDate} />
			{#if eventFieldErrors['event_date']}
				<Helper color="red">{eventFieldErrors['event_date']}</Helper>
			{/if}
		</div>
		<div>
			<Label for="edit_event_location" class="mb-1 block">Location</Label>
			<Input id="edit_event_location" type="text" bind:value={eventLocation} placeholder="Location" />
		</div>
		<div>
			<Label for="edit_event_notes" class="mb-1 block">Notes</Label>
			<Textarea id="edit_event_notes" bind:value={eventNotes} placeholder="Notes" rows={2} class="w-full" />
		</div>
		{#if eventError}
			<Alert color="red">{eventError}</Alert>
		{/if}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => (showEditEventModal = false)}>Cancel</Button>
			<Button onclick={handleUpdateEvent} loading={eventSaving}>Save</Button>
		</div>
	</div>
</Modal>

<!-- Delete Event Modal -->
<Modal bind:open={showDeleteEventModal} title="Delete Event" size="sm">
	<p class="text-gray-600 dark:text-gray-400">Delete this event? This action cannot be undone.</p>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => (showDeleteEventModal = false)}>Cancel</Button>
			<Button color="red" onclick={handleDeleteEvent}>Delete</Button>
		</div>
	{/snippet}
</Modal>

<!-- Invite to Register Modal -->
<Modal bind:open={showInviteModal} title="Invite to Register" size="md">
	<div class="space-y-4">
		<div>
			<Label class="mb-1 block">Person</Label>
			<p class="text-sm font-medium text-gray-900 dark:text-white">{person?.first_name} {person?.last_name}</p>
		</div>
		<div>
			<Label for="invite_email" class="mb-1 block">Email</Label>
			<Input id="invite_email" type="email" bind:value={inviteEmail} placeholder="Email address for the invite" />
		</div>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			The invite link will be emailed to this address. The person will use it to create their account.
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

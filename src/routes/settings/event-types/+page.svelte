<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchEventTypes, createEventType, updateEventType } from '$lib/api/events';
	import { currentUser } from '$lib/stores/auth';
	import type { EventType } from '$lib/types/models';
	import { Card, Button, Input, Textarea, Label, Alert, Modal, Badge, Spinner } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';

	const canEditDirectory = $derived($currentUser?.capabilities?.includes('edit_directory') ?? false);

	let eventTypes = $state<EventType[]>([]);
	let loading = $state(true);
	let error = $state('');

	let showFormModal = $state(false);
	let editingType = $state<EventType | null>(null);
	let typeName = $state('');
	let typeDescription = $state('');
	let saving = $state(false);
	let formError = $state('');

	onMount(load);

	async function load() {
		loading = true;
		error = '';
		try {
			eventTypes = await fetchEventTypes(true);
		} catch {
			error = 'Failed to load event types';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingType = null;
		typeName = '';
		typeDescription = '';
		formError = '';
		showFormModal = true;
	}

	function openEditModal(t: EventType) {
		editingType = t;
		typeName = t.name;
		typeDescription = t.description ?? '';
		formError = '';
		showFormModal = true;
	}

	async function handleSave() {
		formError = '';
		if (!typeName.trim()) {
			formError = 'Name is required';
			return;
		}
		saving = true;
		try {
			if (editingType) {
				const updated = await updateEventType(editingType.id, {
					name: typeName.trim(),
					description: typeDescription.trim() || undefined
				});
				eventTypes = eventTypes.map((t) => (t.id === updated.id ? updated : t));
			} else {
				const created = await createEventType({
					name: typeName.trim(),
					description: typeDescription.trim() || undefined
				});
				eventTypes = [...eventTypes, created];
			}
			showFormModal = false;
		} catch (e: unknown) {
			formError = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}

	async function toggleActive(t: EventType) {
		try {
			const updated = await updateEventType(t.id, { is_active: !t.is_active });
			eventTypes = eventTypes.map((et) => (et.id === updated.id ? updated : et));
		} catch {
			error = 'Failed to update event type';
		}
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
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Event Types</h1>

	{#if !canEditDirectory}
		<Card class="p-6" size="xl">
			<p class="text-gray-500 dark:text-gray-400">You need the Edit Directory capability to manage event types.</p>
		</Card>
	{:else}
		<Card class="p-6" size="xl">
			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Manage timeline event categories — Baptism, Membership, Transfer, and more.
				</p>
				<Button size="sm" onclick={openCreateModal}>Add Type</Button>
			</div>

			{#if loading}
				<div class="flex justify-center py-8">
					<Spinner size="6" />
				</div>
			{:else if error}
				<Alert color="red" class="mt-4">{error}</Alert>
			{:else if eventTypes.length === 0}
				<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">No event types defined.</p>
			{:else}
				<div class="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
					{#each eventTypes as t}
						<div class="flex items-center justify-between gap-4 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="font-medium text-gray-900 dark:text-white">{t.name}</span>
									{#if !t.is_active}
										<Badge color="gray">Inactive</Badge>
									{/if}
								</div>
								{#if t.description}
									<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-1">
								<Button size="xs" outline onclick={() => openEditModal(t)}>Edit</Button>
								<Button size="xs" color={t.is_active ? 'red' : 'green'} outline onclick={() => toggleActive(t)}>
									{t.is_active ? 'Deactivate' : 'Activate'}
								</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	{/if}
</div>

<Modal bind:open={showFormModal} title={editingType ? 'Edit Event Type' : 'Add Event Type'} size="md">
	<div class="space-y-4">
		<div>
			<Label for="type_name" class="mb-1 block">Name</Label>
			<Input id="type_name" type="text" bind:value={typeName} placeholder="Event type name" />
		</div>
		<div>
			<Label for="type_description" class="mb-1 block">Description</Label>
			<Textarea
				id="type_description"
				bind:value={typeDescription}
				placeholder="Brief description"
				rows={2}
				class="w-full"
			/>
		</div>
		{#if formError}
			<Alert color="red">{formError}</Alert>
		{/if}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => (showFormModal = false)}>Cancel</Button>
			<Button onclick={handleSave} loading={saving}>Save</Button>
		</div>
	</div>
</Modal>

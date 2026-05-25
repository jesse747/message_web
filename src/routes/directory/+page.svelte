<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchPersons, deletePerson } from '$lib/api/persons';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/auth';
	import type { Person } from '$lib/types/models';
	import { Button, Input, Spinner, Alert, Badge, Modal } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	let persons = $state<Person[]>([]);
	let loading = $state(true);
	let error = $state('');
	let search = $state('');
	let searchTimer: ReturnType<typeof setTimeout>;
	let showDeleteModal = $state(false);
	let deleteTargetId = $state<number | null>(null);

	const canEdit = $derived($currentUser?.capabilities?.includes('edit_directory') ?? false);
	const canDelete = $derived($currentUser?.role === 'admin');

	function debouncedLoad() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(load, 300);
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const res = await fetchPersons({ q: search || undefined });
			persons = res.data;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	function formatName(p: Person) {
		return `${p.first_name} ${p.last_name}`;
	}

	function openDeleteModal(id: number, e: MouseEvent) {
		e.stopPropagation();
		deleteTargetId = id;
		showDeleteModal = true;
	}

	async function confirmDelete() {
		if (deleteTargetId === null) return;
		showDeleteModal = false;
		try {
			await deletePerson(deleteTargetId);
			persons = persons.filter((p) => p.id !== deleteTargetId);
		} catch {
			error = 'Failed to delete';
		}
	}
</script>

<div class="mx-auto max-w-3xl">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Directory</h1>
				{#if canEdit}
					<Button href="/directory/new">Add Person</Button>
				{/if}
	</div>

	<div class="mb-4">
		<Input type="search" bind:value={search} placeholder="Search..." oninput={debouncedLoad} class="pl-9">
			{#snippet left()}
				<SearchOutline class="h-4 w-4 text-gray-400" />
			{/snippet}
		</Input>
	</div>

	{#if loading}
		<div class="flex justify-center py-16">
			<Spinner size="8" />
		</div>
	{:else if error}
		<Alert color="red" class="mb-4">{error}</Alert>
		<Button onclick={load} size="sm">Retry</Button>
	{:else if persons.length === 0}
		<p class="py-8 text-center text-gray-500 dark:text-gray-400">No persons found</p>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
			{#each persons as person (person.id)}
				<div
					role="button"
					tabindex="0"
					onclick={() => goto(`/directory/${person.id}`)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/directory/${person.id}`); }
					}}
					class="flex w-full cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					<div>
						<span class="font-medium text-gray-900 dark:text-white">{formatName(person)}</span>
						{#if person.membership_status}
							<Badge class="ml-2">{person.membership_status}</Badge>
						{/if}
					</div>
					{#if canDelete}
						<Button color="red" size="xs" outline onclick={(e: MouseEvent) => openDeleteModal(person.id, e)}>
							Delete
						</Button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal bind:open={showDeleteModal} title="Delete Person" size="sm">
	<p class="text-gray-600">Are you sure you want to delete this person? This action cannot be undone.</p>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button color="alternative" onclick={() => showDeleteModal = false}>Cancel</Button>
			<Button color="red" onclick={confirmDelete}>Delete</Button>
		</div>
	{/snippet}
</Modal>

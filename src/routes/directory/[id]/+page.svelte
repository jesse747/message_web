<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchPerson, deletePerson } from '$lib/api/persons';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Person } from '$lib/types/models';

	let person = $state<Person | null>(null);
	let loading = $state(true);
	let error = $state('');

	const id = $derived(Number($page.params.id));

	onMount(load);

	async function load() {
		loading = true;
		error = '';
		try {
			const res = await fetchPerson(id);
			person = res.data;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Delete this person?')) return;
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
		return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<div class="mx-auto max-w-2xl">
	{#if loading}
		<LoadingState />
	{:else if error}
		<ErrorState message={error} onRetry={load} />
	{:else if person}
		<div class="rounded-xl bg-white p-6 shadow">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-900">{formatName(person)}</h1>
				<div class="flex gap-2">
					<a href="/directory/new?edit={person.id}" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Edit</a>
					<button onclick={handleDelete} class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 text-sm">
				{#if person.date_of_birth}
					<div><p class="text-gray-500">Date of Birth</p><p class="font-medium text-gray-900">{formatDate(person.date_of_birth)}</p></div>
				{/if}
				{#if person.membership_status}
					<div><p class="text-gray-500">Status</p><p class="font-medium text-gray-900">{person.membership_status}</p></div>
				{/if}
				{#if person.membership_type}
					<div><p class="text-gray-500">Type</p><p class="font-medium text-gray-900">{person.membership_type}</p></div>
				{/if}
				{#if person.email_personal}
					<div><p class="text-gray-500">Email</p><p class="font-medium text-gray-900">{person.email_personal}</p></div>
				{/if}
				{#if person.email_work}
					<div><p class="text-gray-500">Work Email</p><p class="font-medium text-gray-900">{person.email_work}</p></div>
				{/if}
				{#if person.phone_mobile}
					<div><p class="text-gray-500">Mobile</p><p class="font-medium text-gray-900">{person.phone_mobile}</p></div>
				{/if}
				{#if person.phone_home}
					<div><p class="text-gray-500">Home Phone</p><p class="font-medium text-gray-900">{person.phone_home}</p></div>
				{/if}
				{#if person.address}
					<div class="col-span-2"><p class="text-gray-500">Address</p><p class="font-medium text-gray-900">{person.address}</p></div>
				{/if}
				{#if person.date_joined}
					<div><p class="text-gray-500">Date Joined</p><p class="font-medium text-gray-900">{formatDate(person.date_joined)}</p></div>
				{/if}
				{#if person.baptism_date}
					<div><p class="text-gray-500">Baptism Date</p><p class="font-medium text-gray-900">{formatDate(person.baptism_date)}</p></div>
				{/if}
				{#if person.notes}
					<div class="col-span-2"><p class="text-gray-500">Notes</p><p class="font-medium text-gray-900">{person.notes}</p></div>
				{/if}
			</div>
		</div>
	{/if}
</div>

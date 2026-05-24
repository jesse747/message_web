<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchPersons, deletePerson } from '$lib/api/persons';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { goto } from '$app/navigation';
	import type { Person } from '$lib/types/models';

	let persons = $state<Person[]>([]);
	let loading = $state(true);
	let error = $state('');
	let search = $state('');

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

	async function handleDelete(id: number, e: Event) {
		e.stopPropagation();
		if (!confirm('Delete this person?')) return;
		try {
			await deletePerson(id);
			persons = persons.filter((p) => p.id !== id);
		} catch {
			error = 'Failed to delete';
		}
	}
</script>

<div class="mx-auto max-w-3xl">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Directory</h1>
		<a href="/directory/new" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
			Add Person
		</a>
	</div>

	<div class="mb-4">
		<SearchBar value={search} onChange={(v) => { search = v; load(); }} />
	</div>

	{#if loading}
		<LoadingState />
	{:else if error}
		<ErrorState message={error} onRetry={load} />
	{:else if persons.length === 0}
		<p class="py-8 text-center text-gray-500">No persons found</p>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow">
			{#each persons as person (person.id)}
				<div
					onclick={() => goto(`/directory/${person.id}`)}
					class="flex cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50"
				>
					<div>
						<span class="font-medium text-gray-900">{formatName(person)}</span>
						{#if person.membership_status}
							<span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{person.membership_status}</span>
						{/if}
					</div>
					<button
						onclick={(e) => handleDelete(person.id, e)}
						class="text-sm text-red-600 hover:text-red-800"
					>
						Delete
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

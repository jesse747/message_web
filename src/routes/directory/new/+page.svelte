<script lang="ts">
	import { onMount } from 'svelte';
	import { createPerson, fetchPerson, updatePerson } from '$lib/api/persons';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Person } from '$lib/types/models';

	const editId = $derived($page.url.searchParams.get('edit') ? Number($page.url.searchParams.get('edit')) : null);

	let firstName = $state('');
	let lastName = $state('');
	let emailPersonal = $state('');
	let emailWork = $state('');
	let phoneMobile = $state('');
	let phoneHome = $state('');
	let address = $state('');
	let dateOfBirth = $state('');
	let membershipStatus = $state('');
	let error = $state('');
	let saving = $state(false);

	onMount(async () => {
		if (editId) {
			try {
				const res = await fetchPerson(editId);
				const p = res.data;
				firstName = p.first_name;
				lastName = p.last_name;
				emailPersonal = p.email_personal ?? '';
				emailWork = p.email_work ?? '';
				phoneMobile = p.phone_mobile ?? '';
				phoneHome = p.phone_home ?? '';
				address = p.address ?? '';
				dateOfBirth = p.date_of_birth ?? '';
				membershipStatus = p.membership_status ?? '';
			} catch {
				error = 'Failed to load person';
			}
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		if (!firstName.trim() || !lastName.trim()) {
			error = 'First and last name are required';
			return;
		}
		saving = true;
		try {
			const payload = {
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email_personal: emailPersonal.trim() || undefined,
				email_work: emailWork.trim() || undefined,
				phone_mobile: phoneMobile.trim() || undefined,
				phone_home: phoneHome.trim() || undefined,
				address: address.trim() || undefined,
				date_of_birth: dateOfBirth.trim() || undefined,
				membership_status: membershipStatus.trim() || undefined,
			};
			if (editId) {
				await updatePerson(editId, payload);
			} else {
				await createPerson(payload as Person & { first_name: string; last_name: string });
			}
			goto('/directory');
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-xl">
	<h1 class="mb-6 text-2xl font-bold text-gray-900">{editId ? 'Edit Person' : 'Add Person'}</h1>

	<form onsubmit={handleSubmit} class="space-y-4 rounded-xl bg-white p-6 shadow">
		<input type="text" placeholder="First Name *" bind:value={firstName}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="text" placeholder="Last Name *" bind:value={lastName}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="email" placeholder="Email (personal)" bind:value={emailPersonal}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="email" placeholder="Email (work)" bind:value={emailWork}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="tel" placeholder="Mobile phone" bind:value={phoneMobile}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="tel" placeholder="Home phone" bind:value={phoneHome}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="text" placeholder="Address" bind:value={address}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="text" placeholder="Date of birth (YYYY-MM-DD)" bind:value={dateOfBirth}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
		<input type="text" placeholder="Membership status" bind:value={membershipStatus}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<button type="submit" disabled={saving}
			class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
			{saving ? 'Saving...' : editId ? 'Update Person' : 'Create Person'}
		</button>
	</form>
</div>

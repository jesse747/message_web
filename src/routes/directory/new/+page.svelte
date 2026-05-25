<script lang="ts">
	import { onMount } from 'svelte';
	import { createPerson, fetchPerson, updatePerson } from '$lib/api/persons';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/auth';
	import type { Person } from '$lib/types/models';
	import {
		Card,
		Label,
		Input,
		Button,
		Alert,
		Helper,
		Select,
		Textarea,
		Spinner
	} from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';

	const canEdit = $derived($currentUser?.capabilities?.includes('edit_directory') ?? false);

	const editId = $derived(
		$page.url.searchParams.get('edit') ? Number($page.url.searchParams.get('edit')) : null
	);

	let firstName = $state('');
	let lastName = $state('');
	let dateOfBirth = $state('');
	let addressStreet = $state('');
	let addressCity = $state('');
	let addressRegion = $state('');
	let addressPostalCode = $state('');
	let addressCountry = $state('');
	let emailPersonal = $state('');
	let emailWork = $state('');
	let phoneMobile = $state('');
	let phoneHome = $state('');
	let phoneWork = $state('');
	let emergencyContactName = $state('');
	let emergencyContactPhone = $state('');
	let membershipStatus = $state('');
	let membershipType = $state('');
	let membershipNumber = $state('');
	let notes = $state('');
	let membershipNotes = $state('');

	let error = $state('');
	let saving = $state(false);
	let loadingPerson = $state(false);
	let fieldErrors = $state<Record<string, string>>({});

	const membershipStatusOptions = [
		{ name: 'Member', value: 'member' },
		{ name: 'Visitor', value: 'visitor' },
		{ name: 'Inactive', value: 'inactive' },
		{ name: 'Former', value: 'former' }
	];

	const membershipTypeOptions = [
		{ name: 'Regular', value: 'regular' },
		{ name: 'Associate', value: 'associate' },
		{ name: 'Honorary', value: 'honorary' }
	];

	onMount(async () => {
		if (editId) {
			loadingPerson = true;
			try {
				const res = await fetchPerson(editId);
				const p = res.data;
				firstName = p.first_name;
				lastName = p.last_name;
				dateOfBirth = p.date_of_birth ?? '';
				addressStreet = p.address_street ?? '';
				addressCity = p.address_city ?? '';
				addressRegion = p.address_region ?? '';
				addressPostalCode = p.address_postal_code ?? '';
				addressCountry = p.address_country ?? '';
				emailPersonal = p.email_personal ?? '';
				emailWork = p.email_work ?? '';
				phoneMobile = p.phone_mobile ?? '';
				phoneHome = p.phone_home ?? '';
				phoneWork = p.phone_work ?? '';
				emergencyContactName = p.emergency_contact_name ?? '';
				emergencyContactPhone = p.emergency_contact_phone ?? '';
				membershipStatus = p.membership_status ?? '';
				membershipType = p.membership_type ?? '';
				membershipNumber = p.membership_number ?? '';
				notes = p.notes ?? '';
				membershipNotes = p.membership_notes ?? '';
			} catch {
				error = 'Failed to load person';
			} finally {
				loadingPerson = false;
			}
		}
	});

	function isValidEmail(email: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	function isValidDate(date: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
		const parsed = new Date(date + 'T00:00:00');
		return !isNaN(parsed.getTime());
	}

	function isValidPhone(phone: string) {
		return /^[\d\s\-\(\)\+\.]*$/.test(phone);
	}

	function validate() {
		fieldErrors = {};

		if (!firstName.trim()) fieldErrors['first_name'] = 'First name is required';
		if (!lastName.trim()) fieldErrors['last_name'] = 'Last name is required';
		if (emailPersonal.trim() && !isValidEmail(emailPersonal.trim()))
			fieldErrors['email_personal'] = 'Enter a valid email address';
		if (emailWork.trim() && !isValidEmail(emailWork.trim()))
			fieldErrors['email_work'] = 'Enter a valid email address';
		if (phoneMobile.trim() && !isValidPhone(phoneMobile.trim()))
			fieldErrors['phone_mobile'] = 'Invalid phone number';
		if (phoneHome.trim() && !isValidPhone(phoneHome.trim()))
			fieldErrors['phone_home'] = 'Invalid phone number';
		if (phoneWork.trim() && !isValidPhone(phoneWork.trim()))
			fieldErrors['phone_work'] = 'Invalid phone number';
		if (emergencyContactPhone.trim() && !isValidPhone(emergencyContactPhone.trim()))
			fieldErrors['emergency_contact_phone'] = 'Invalid phone number';
		if (dateOfBirth.trim() && !isValidDate(dateOfBirth.trim()))
			fieldErrors['date_of_birth'] = 'Enter a valid date';

		return Object.keys(fieldErrors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!validate()) return;

		const addressParts = [addressStreet, addressCity, addressRegion, addressPostalCode, addressCountry]
				.map((p) => p.trim())
				.filter(Boolean);

		saving = true;
		try {
			const payload = {
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				date_of_birth: dateOfBirth || undefined,
				address_street: addressStreet.trim() || undefined,
				address_city: addressCity.trim() || undefined,
				address_region: addressRegion.trim() || undefined,
				address_postal_code: addressPostalCode.trim() || undefined,
				address_country: addressCountry.trim() || undefined,
				address: addressParts.join(', ') || undefined,
				email_personal: emailPersonal.trim() || undefined,
				email_work: emailWork.trim() || undefined,
				phone_mobile: phoneMobile.trim() || undefined,
				phone_home: phoneHome.trim() || undefined,
				phone_work: phoneWork.trim() || undefined,
				emergency_contact_name: emergencyContactName.trim() || undefined,
				emergency_contact_phone: emergencyContactPhone.trim() || undefined,
				membership_status: membershipStatus || undefined,
				membership_type: membershipType || undefined,
				membership_number: membershipNumber.trim() || undefined,
				notes: notes.trim() || undefined,
				membership_notes: membershipNotes.trim() || undefined
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

<div class="mx-auto max-w-3xl">
	<a
		href="/directory"
		class="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400"
	>
		<ArrowLeftOutline class="h-4 w-4" />
		Back to Directory
	</a>
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
		{editId ? 'Edit Person' : 'Add Person'}
	</h1>

	{#if loadingPerson}
		<div class="flex justify-center py-16">
			<Spinner size="8" />
		</div>
	{:else if !canEdit}
		<Card class="p-6 text-center" size="xl">
			<p class="text-gray-500 dark:text-gray-400">You do not have permission to add or edit persons.</p>
		</Card>
	{:else}
		<Card class="p-6" size="xl">
			<form onsubmit={handleSubmit} class="space-y-8">
				<!-- Personal -->
				<section>
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Personal
					</h2>
					<div class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="first_name" class="mb-1 block">First Name *</Label>
								<Input id="first_name" type="text" bind:value={firstName} placeholder="First name" />
								{#if fieldErrors['first_name']}
									<Helper color="red">{fieldErrors['first_name']}</Helper>
								{/if}
							</div>
							<div>
								<Label for="last_name" class="mb-1 block">Last Name *</Label>
								<Input id="last_name" type="text" bind:value={lastName} placeholder="Last name" />
								{#if fieldErrors['last_name']}
									<Helper color="red">{fieldErrors['last_name']}</Helper>
								{/if}
							</div>
				</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="date_of_birth" class="mb-1 block">Date of birth</Label>
								<Input id="date_of_birth" type="date" bind:value={dateOfBirth} />
								{#if fieldErrors['date_of_birth']}
									<Helper color="red">{fieldErrors['date_of_birth']}</Helper>
								{/if}
							</div>
							<div></div>
						</div>
					</div>
				</section>

				<hr class="border-gray-200 dark:border-gray-700" />

				<!-- Address -->
				<section>
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Address
					</h2>
					<div class="space-y-4">
						<div>
							<Label for="address_street" class="mb-1 block">Street</Label>
							<Input id="address_street" type="text" bind:value={addressStreet} placeholder="Street" />
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="address_city" class="mb-1 block">City</Label>
								<Input id="address_city" type="text" bind:value={addressCity} placeholder="City" />
							</div>
							<div>
								<Label for="address_region" class="mb-1 block">Region</Label>
								<Input id="address_region" type="text" bind:value={addressRegion} placeholder="Region" />
							</div>
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="address_postal_code" class="mb-1 block">Postal code</Label>
								<Input id="address_postal_code" type="text" bind:value={addressPostalCode} placeholder="Postal code" />
							</div>
							<div>
								<Label for="address_country" class="mb-1 block">Country</Label>
								<Input id="address_country" type="text" bind:value={addressCountry} placeholder="Country" />
							</div>
						</div>
					</div>
				</section>

				<hr class="border-gray-200 dark:border-gray-700" />

				<!-- Contact -->
				<section>
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Contact
					</h2>
					<div class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="email_personal" class="mb-1 block">Email (personal)</Label>
								<Input id="email_personal" type="email" bind:value={emailPersonal} placeholder="Personal email" />
								{#if fieldErrors['email_personal']}
									<Helper color="red">{fieldErrors['email_personal']}</Helper>
								{/if}
							</div>
							<div>
								<Label for="email_work" class="mb-1 block">Email (work)</Label>
								<Input id="email_work" type="email" bind:value={emailWork} placeholder="Work email" />
								{#if fieldErrors['email_work']}
									<Helper color="red">{fieldErrors['email_work']}</Helper>
								{/if}
							</div>
						</div>
						<div class="grid gap-4 sm:grid-cols-3">
							<div>
								<Label for="phone_mobile" class="mb-1 block">Mobile phone</Label>
								<Input id="phone_mobile" type="tel" bind:value={phoneMobile} placeholder="Mobile phone" />
								{#if fieldErrors['phone_mobile']}
									<Helper color="red">{fieldErrors['phone_mobile']}</Helper>
								{/if}
							</div>
							<div>
								<Label for="phone_home" class="mb-1 block">Home phone</Label>
								<Input id="phone_home" type="tel" bind:value={phoneHome} placeholder="Home phone" />
								{#if fieldErrors['phone_home']}
									<Helper color="red">{fieldErrors['phone_home']}</Helper>
								{/if}
							</div>
							<div>
								<Label for="phone_work" class="mb-1 block">Work phone</Label>
								<Input id="phone_work" type="tel" bind:value={phoneWork} placeholder="Work phone" />
								{#if fieldErrors['phone_work']}
									<Helper color="red">{fieldErrors['phone_work']}</Helper>
								{/if}
							</div>
						</div>
					</div>
				</section>

				<hr class="border-gray-200 dark:border-gray-700" />

				<!-- Emergency Contact -->
				<section>
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Emergency Contact
					</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<Label for="emergency_contact_name" class="mb-1 block">Name</Label>
							<Input id="emergency_contact_name" type="text" bind:value={emergencyContactName} placeholder="Emergency contact name" />
						</div>
						<div>
							<Label for="emergency_contact_phone" class="mb-1 block">Phone</Label>
							<Input id="emergency_contact_phone" type="tel" bind:value={emergencyContactPhone} placeholder="Emergency contact phone" />
							{#if fieldErrors['emergency_contact_phone']}
								<Helper color="red">{fieldErrors['emergency_contact_phone']}</Helper>
							{/if}
						</div>
					</div>
				</section>

				<hr class="border-gray-200 dark:border-gray-700" />

				<!-- Membership -->
				<section>
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Membership
					</h2>
					<div class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<Label for="membership_status" class="mb-1 block">Status</Label>
								<Select id="membership_status" items={membershipStatusOptions} bind:value={membershipStatus} placeholder="Select status" />
							</div>
							<div>
								<Label for="membership_type" class="mb-1 block">Type</Label>
								<Select id="membership_type" items={membershipTypeOptions} bind:value={membershipType} placeholder="Select type" />
							</div>
						</div>
						<div>
							<Label for="membership_number" class="mb-1 block">Member #</Label>
							<Input id="membership_number" type="text" bind:value={membershipNumber} placeholder="Membership number" />
						</div>
					</div>
				</section>

				<hr class="border-gray-200 dark:border-gray-700" />

				<!-- Notes -->
				<section>
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Notes
					</h2>
					<div class="space-y-4">
						<div>
							<Label for="notes" class="mb-1 block">General notes</Label>
							<Textarea id="notes" bind:value={notes} placeholder="General notes" rows={4} class="w-full" />
						</div>
						<div>
							<Label for="membership_notes" class="mb-1 block">Membership notes</Label>
							<Textarea id="membership_notes" bind:value={membershipNotes} placeholder="Membership-specific notes" rows={4} class="w-full" />
						</div>
					</div>
				</section>

				{#if error}
					<Alert color="red">{error}</Alert>
				{/if}

				<Button type="submit" class="w-full" loading={saving}>
					{saving ? 'Saving...' : editId ? 'Update Person' : 'Create Person'}
				</Button>
			</form>
		</Card>
	{/if}
</div>

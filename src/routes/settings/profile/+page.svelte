<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores/auth';
	import { fetchCurrentUser, updateUser } from '$lib/api/users';
	import { highlightColor, setHighlightColor, COLOR_OPTIONS, type HighlightColor } from '$lib/stores/preferences';
	import type { User } from '$lib/types/models';
	import { Card, Label, Input, Button, Alert } from 'flowbite-svelte';

	let user = $state<User | null>(null);
	let displayName = $state('');
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(async () => {
		try {
			const fresh = await fetchCurrentUser();
			user = fresh;
			displayName = fresh.display_name;
		} catch {
			error = 'Failed to load user info';
		}
	});

	async function handleSave(e: Event) {
		e.preventDefault();
		error = '';
		success = '';
		if (!displayName.trim()) {
			error = 'Display name is required';
			return;
		}
		if (!user) return;
		saving = true;
		try {
			const updated = await updateUser(user.id, { display_name: displayName.trim() });
			currentUser.set(updated);
			user = updated;
			success = 'Display name updated';
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}

	function handleColorChange(color: HighlightColor) {
		setHighlightColor(color);
	}

	function formatCapability(cap: string) {
		return cap
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">My Settings</h1>

	<Card class="p-6" size="xl">
		<form onsubmit={handleSave} class="space-y-6">
			<section>
				<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
					Profile
				</h2>
				<div class="space-y-4">
					<div>
						<Label for="display_name" class="mb-1 block">Display Name</Label>
						<Input id="display_name" type="text" bind:value={displayName} placeholder="Display name" />
					</div>
				</div>
			</section>

			<hr class="border-gray-200 dark:border-gray-700" />

			<section>
				<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
					Account
				</h2>
				<div class="grid gap-4 sm:grid-cols-2 text-sm">
					<div>
						<p class="text-gray-500 dark:text-gray-400">Username</p>
						<p class="font-medium text-gray-900 dark:text-white">{user?.username ?? '—'}</p>
					</div>
					<div>
						<p class="text-gray-500 dark:text-gray-400">Email</p>
						<p class="font-medium text-gray-900 dark:text-white">{user?.email ?? '—'}</p>
					</div>
					<div>
						<p class="text-gray-500 dark:text-gray-400">Role</p>
						<p class="font-medium text-gray-900 dark:text-white">
							{user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
						</p>
					</div>
				</div>
			</section>

			<hr class="border-gray-200 dark:border-gray-700" />

			<section>
				<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
					Highlight Color
				</h2>
				<div class="flex flex-wrap gap-2">
					{#each COLOR_OPTIONS as opt}
						<button
							type="button"
							onclick={() => handleColorChange(opt.value)}
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
							class:border-gray-300={$highlightColor !== opt.value}
							style="border-color: {$highlightColor === opt.value ? opt.hex : ''}"
							aria-label={opt.name}
						>
							<span class="h-5 w-5 rounded-full" style="background-color: {opt.hex}"></span>
						</button>
					{/each}
				</div>
			</section>

			<hr class="border-gray-200 dark:border-gray-700" />

			<section>
				<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
					Capabilities
				</h2>
				<div class="flex flex-wrap gap-2">
					{#if user?.capabilities?.length}
						{#each user.capabilities as cap}
							<span
								class="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
							>
								{formatCapability(cap)}
							</span>
						{/each}
					{:else}
						<p class="text-sm text-gray-500 dark:text-gray-400">None</p>
					{/if}
				</div>
			</section>

			{#if error}
				<Alert color="red">{error}</Alert>
			{/if}

			{#if success}
				<Alert color="green">{success}</Alert>
			{/if}

			<Button type="submit" loading={saving}>
				{saving ? 'Saving...' : 'Save Changes'}
			</Button>
		</form>
	</Card>
</div>

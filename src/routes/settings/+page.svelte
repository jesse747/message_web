<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { Card } from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';

	const canEditDirectory = $derived($currentUser?.capabilities?.includes('edit_directory') ?? false);
	const canManageUsers = $derived($currentUser?.capabilities?.includes('manage_users') ?? false);
	const hasAnyAdminCapability = $derived(canEditDirectory || canManageUsers);

	const sections = $derived(
		[
			{ label: 'Event Types', desc: 'Manage timeline event categories', href: '/settings/event-types', show: canEditDirectory },
			{ label: 'Invites', desc: 'Manage registration invitations', href: '/settings/invites', show: canManageUsers }
		].filter((s) => s.show)
	);
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

	{#if !hasAnyAdminCapability}
		<Card class="p-6" size="xl">
			<p class="text-gray-500 dark:text-gray-400">Admin access required to manage settings.</p>
		</Card>
	{:else if sections.length === 0}
		<Card class="p-6" size="xl">
			<p class="text-gray-500 dark:text-gray-400">No admin sections available for your account.</p>
		</Card>
	{:else}
		<Card class="p-6" size="xl">
			<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
				Administration
			</h2>
			<nav class="-mx-6 divide-y divide-gray-100 dark:divide-gray-700">
				{#each sections as section}
					<button
						onclick={() => goto(section.href)}
						class="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-white">{section.label}</p>
							<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{section.desc}</p>
						</div>
						<ArrowRightOutline class="h-4 w-4 shrink-0 text-gray-400" />
					</button>
				{/each}
			</nav>
		</Card>
	{/if}
</div>

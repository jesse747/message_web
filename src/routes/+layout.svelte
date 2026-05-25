<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { currentUser, isAuthenticated, initAuth, logout } from '$lib/stores/auth';
	import { darkMode, initTheme, toggleTheme } from '$lib/stores/theme';
	import { initHighlightColor } from '$lib/stores/preferences';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Spinner, Dropdown, DropdownHeader, DropdownItem } from 'flowbite-svelte';
	import {
		UsersSolid,
		UsersGroupSolid,
		FolderSolid,
		CogOutline,
		ArrowLeftToBracketOutline,
		BarsOutline,
		CloseOutline,
		MoonSolid,
		SunSolid
	} from 'flowbite-svelte-icons';

	let { children } = $props();

	const navItems = [
		{ href: '/directory', label: 'Directory', Icon: UsersSolid },
		{ href: '/teams', label: 'Teams', Icon: UsersGroupSolid },
		{ href: '/groups', label: 'Groups', Icon: FolderSolid }
	];

	const ADMIN_CAPABILITIES = ['edit_directory', 'manage_users', 'manage_organization', 'manage_groups', 'manage_teams', 'manage_events', 'manage_flocks', 'manage_rosters', 'manage_files', 'manage_announcements'];

	const adminItems = $derived(
		ADMIN_CAPABILITIES.some((cap) => $currentUser?.capabilities?.includes(cap))
			? [{ href: '/settings', label: 'Settings', Icon: CogOutline }]
			: []
	);

	const allItems = $derived([...navItems, ...adminItems]);

	let loading = $state(true);
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);

	onMount(async () => {
		initTheme();
		initHighlightColor();
		await initAuth();
		loading = false;
	});

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleLogout() {
		userMenuOpen = false;
		logout();
	}

	function goSettings() {
		userMenuOpen = false;
		goto('/settings/profile');
	}

	function isActive(path: string) {
		return $page.url.pathname.startsWith(path);
	}

	function activeClass(path: string) {
		return isActive(path)
			? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
			: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700';
	}

	$effect(() => {
		if (loading) return;
		const auth = $isAuthenticated;
		const path = $page.url.pathname;

		if (!auth && path !== '/login' && path !== '/register' && path !== '/forgot-password' && path !== '/reset-password') {
			goto('/login');
		} else if (auth && (path === '/login' || path === '/register' || path === '/')) {
			goto('/directory');
		}
	});
</script>

{#if loading}
	<div class="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
		<Spinner size="10" />
	</div>
{:else if $isAuthenticated}
	<div class="flex flex-col h-screen">
		<!-- Top bar (full width, all breakpoints) -->
		<header
			class="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-3">
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden"
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<CloseOutline class="h-6 w-6" />
					{:else}
						<BarsOutline class="h-6 w-6" />
					{/if}
				</button>
			<a href="/directory" class="flex items-center gap-2 text-xl font-bold text-blue-700 dark:text-blue-400">
					<img src="/favicon.svg" alt="" class="h-6 w-6" />
					Message
				</a>
			</div>

			<div class="flex items-center gap-1">
				<button
					onclick={toggleTheme}
					class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					aria-label="Toggle theme"
				>
					{#if $darkMode}
						<SunSolid class="h-5 w-5" />
					{:else}
						<MoonSolid class="h-5 w-5" />
					{/if}
				</button>

				<button
				onclick={() => (userMenuOpen = !userMenuOpen)}
				class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
				aria-label="User menu"
			>
				<span
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
				>
					{$currentUser?.display_name?.charAt(0) || '?'}
				</span>
			</button>
			<Dropdown bind:isOpen={userMenuOpen} placement="bottom-end" offset={4}>
				<DropdownHeader>
					<div class="flex items-center gap-3">
						<span
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
						>
							{$currentUser?.display_name?.charAt(0) || '?'}
						</span>
						<span class="font-semibold text-gray-900 dark:text-white">
							{$currentUser?.display_name}
						</span>
					</div>
				</DropdownHeader>
				<DropdownItem onclick={goSettings}>
					<span class="flex items-center gap-2 whitespace-nowrap">
						<CogOutline class="h-4 w-4" />
						My Settings
					</span>
				</DropdownItem>
				<DropdownItem onclick={handleLogout}>
					<span class="flex items-center gap-2 whitespace-nowrap">
						<ArrowLeftToBracketOutline class="h-4 w-4" />
						Sign out
					</span>
				</DropdownItem>
			</Dropdown>
			</div>
		</header>

		<!-- Mobile nav dropdown -->
		{#if mobileMenuOpen}
			<div class="fixed inset-0 z-40 md:hidden" onclick={closeMobileMenu} role="presentation"></div>
			<div class="fixed left-0 right-0 top-14 z-50 border-b bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 md:hidden">
				<nav class="flex flex-col gap-1 px-3 py-2">
					{#each allItems as item}
						<a
							href={item.href}
							onclick={closeMobileMenu}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeClass(item.href)}"
						>
							<item.Icon class="h-5 w-5" />
							{item.label}
						</a>
					{/each}
				</nav>
			</div>
		{/if}

		<div class="flex flex-1 overflow-hidden">
			<!-- Desktop sidebar (below top bar, nav links only) -->
			<aside class="hidden w-56 flex-shrink-0 border-r bg-white dark:border-gray-700 dark:bg-gray-800 md:flex md:flex-col">
				<nav class="flex flex-col gap-1 p-3">
					{#each allItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeClass(item.href)}"
						>
							<item.Icon class="h-5 w-5" />
							{item.label}
						</a>
					{/each}
				</nav>
			</aside>

			<!-- Main content -->
			<main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
				<div class="p-6">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{:else}
	<button
		onclick={toggleTheme}
		class="fixed right-4 top-4 z-50 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
		aria-label="Toggle theme"
	>
		{#if $darkMode}
			<SunSolid class="h-5 w-5" />
		{:else}
			<MoonSolid class="h-5 w-5" />
		{/if}
	</button>
	{@render children()}
{/if}

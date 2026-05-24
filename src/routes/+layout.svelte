<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { currentUser, isAuthenticated, initAuth, logout } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const navItems = [
		{ href: '/directory', label: 'Directory', icon: 'people' },
		{ href: '/teams', label: 'Teams', icon: 'team' },
		{ href: '/groups', label: 'Groups', icon: 'people' },
	];

	function navIcon(name: string) {
		if (name === 'team')
			return '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>';
		return '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>';
	}

	const logoutSvg = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>';

	let loading = $state(true);
	let mobileMenuOpen = $state(false);

	onMount(async () => {
		await initAuth();
		loading = false;
	});

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function isActive(path: string) {
		return $page.url.pathname.startsWith(path);
	}

	function activeClass(path: string) {
		return isActive(path)
			? 'bg-blue-50 text-blue-700'
			: 'text-gray-700 hover:bg-gray-100';
	}

	$effect(() => {
		if (loading) return;
		const auth = $isAuthenticated;
		const path = $page.url.pathname;

		if (!auth && path !== '/login' && path !== '/register') {
			goto('/login');
		} else if (auth && (path === '/login' || path === '/register' || path === '/')) {
			goto('/directory');
		}
	});
</script>

{#if loading}
	<div class="flex h-screen items-center justify-center">
		<div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
	</div>
{:else if $isAuthenticated}
	<div class="flex h-screen">
		<!-- Mobile header (hidden on md+) -->
		<header class="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
			<div class="flex items-center gap-2">
				<button
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					class="p-1 text-gray-600 hover:text-gray-900"
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" /></svg>
					{:else}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
					{/if}
				</button>
				<a href="/directory" class="text-xl font-bold text-blue-700">Message</a>
			</div>
		</header>

		<!-- Mobile dropdown (hidden on md+) -->
		{#if mobileMenuOpen}
			<div class="fixed inset-0 z-40 md:hidden" onclick={closeMobileMenu}></div>
			<div class="fixed left-0 right-0 top-[57px] z-50 border-b bg-white shadow-lg md:hidden">
				<nav class="flex flex-col gap-1 px-3 py-2">
					{#each navItems as item}
						<a href={item.href} onclick={closeMobileMenu} class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeClass(item.href)}">
							{@html navIcon(item.icon)}
							{item.label}
						</a>
					{/each}
					<hr class="my-1 border-gray-200">
					<span class="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
						{$currentUser?.display_name}
					</span>
					<button onclick={() => { closeMobileMenu(); logout(); }} class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
						{@html logoutSvg}
						Sign out
					</button>
				</nav>
			</div>
		{/if}

		<!-- Desktop sidebar (hidden on <md) -->
		<aside class="hidden w-56 flex-shrink-0 flex-col border-r bg-white md:flex">
			<a href="/directory" class="px-6 py-5 text-xl font-bold text-blue-700">Message</a>

			<nav class="flex flex-col gap-1 px-3">
				{#each navItems as item}
					<a href={item.href} class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeClass(item.href)}">
						{@html navIcon(item.icon)}
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="mt-auto border-t px-3 py-4">
				<div class="flex items-center gap-3 px-3 pb-3 text-sm text-gray-500">
					<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
					<span class="truncate">{$currentUser?.display_name}</span>
				</div>
				<button onclick={logout} class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
					{@html logoutSvg}
					Sign out
				</button>
			</div>
		</aside>

		<!-- Main content area -->
		<main class="flex-1 overflow-y-auto bg-gray-50 pt-[57px] md:pt-0">
			<div class="p-6">
				{@render children()}
			</div>
		</main>
	</div>
{:else}
	{@render children()}
{/if}

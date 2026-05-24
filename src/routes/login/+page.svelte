<script lang="ts">
	import { login } from '$lib/stores/auth';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		error = '';
		loading = true;
		try {
			await login(username, password);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
		<h1 class="mb-6 text-center text-3xl font-bold text-blue-700">Message</h1>

		<div class="mb-4">
			<label for="username" class="mb-1 block text-sm font-medium text-gray-700">Username</label>
			<input
				id="username"
				type="text"
				bind:value={username}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
				autocomplete="username"
			/>
		</div>

		<div class="mb-4">
			<label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
				autocomplete="current-password"
			/>
		</div>

		{#if error}
			<p class="mb-4 text-center text-sm text-red-600">{error}</p>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
		>
			{loading ? 'Signing in...' : 'Sign In'}
		</button>

		<p class="mt-4 text-center text-sm text-gray-500">
			<a href="/register" class="text-blue-600 hover:underline">Create account</a>
		</p>
	</form>
</div>

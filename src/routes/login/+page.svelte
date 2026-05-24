<script lang="ts">
	import { login } from '$lib/stores/auth';
	import { Card, Label, Input, Button, Alert } from 'flowbite-svelte';
	import { UserCircleSolid, LockSolid } from 'flowbite-svelte-icons';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		error = '';
		if (!username.trim() || !password) {
			error = 'Please enter your username and password.';
			return;
		}
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
	<Card class="w-full max-w-md p-8">
		<h1 class="mb-6 text-center text-3xl font-bold text-blue-700">Message</h1>

		<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="space-y-4">
			<div>
				<Label for="username" class="mb-1 block">Username</Label>
				<Input id="username" type="text" bind:value={username} placeholder="Username or email" autocomplete="username" class="pl-10">
					{#snippet left()}
						<UserCircleSolid class="h-5 w-5 text-gray-400" />
					{/snippet}
				</Input>
			</div>

			<div>
				<Label for="password" class="mb-1 block">Password</Label>
				<Input id="password" type="password" bind:value={password} placeholder="Password" autocomplete="current-password" class="pl-10">
					{#snippet left()}
						<LockSolid class="h-5 w-5 text-gray-400" />
					{/snippet}
				</Input>
			</div>

			{#if error}
				<Alert color="red">{error}</Alert>
			{/if}

			<Button type="submit" class="w-full" {loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</form>

		<p class="mt-4 text-center text-sm text-gray-500">
			<a href="/register" class="text-blue-600 hover:underline">Create account</a>
		</p>
	</Card>
</div>

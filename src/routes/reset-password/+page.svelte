<script lang="ts">
	import { confirmPasswordReset } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Card, Label, Input, Button, Alert } from 'flowbite-svelte';
	import { LockSolid } from 'flowbite-svelte-icons';

	const token = $derived($page.url.searchParams.get('token') || '');

	let password = $state('');
	let loading = $state(false);
	let success = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		if (password.length < 6) {
			error = 'Password must be at least 6 characters.';
			return;
		}
		loading = true;
		try {
			await confirmPasswordReset(token, password);
			success = true;
			setTimeout(() => goto('/login'), 2000);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Reset failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
	<Card class="w-full max-w-md p-8">
		<h1 class="mb-6 text-center text-3xl font-bold text-blue-700">Set New Password</h1>

		{#if !token}
			<Alert color="red" class="mb-4">
				Invalid or missing reset token.
			</Alert>
			<a href="/login" class="block text-center text-sm text-primary-600 hover:underline dark:text-primary-400">
				&larr; Back to sign in
			</a>
		{:else if success}
			<Alert color="green" class="mb-4">
				Password has been reset successfully. Redirecting to sign in...
			</Alert>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<Label for="password" class="mb-1 block">New Password</Label>
					<Input id="password" type="password" bind:value={password} placeholder="At least 6 characters" autocomplete="new-password" class="pl-10">
						{#snippet left()}
							<LockSolid class="h-5 w-5 text-gray-400" />
						{/snippet}
					</Input>
				</div>

				{#if error}
					<Alert color="red">{error}</Alert>
				{/if}

				<Button type="submit" class="w-full" {loading}>
					{loading ? 'Resetting...' : 'Reset Password'}
				</Button>
			</form>
		{/if}
	</Card>
</div>

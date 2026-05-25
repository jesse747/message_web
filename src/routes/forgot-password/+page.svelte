<script lang="ts">
	import { requestPasswordReset } from '$lib/stores/auth';
	import { Card, Label, Input, Button, Alert } from 'flowbite-svelte';
	import { EnvelopeSolid } from 'flowbite-svelte-icons';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		if (!email.trim()) {
			error = 'Please enter your email address.';
			return;
		}
		loading = true;
		try {
			await requestPasswordReset(email);
			sent = true;
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
	<Card class="w-full max-w-md p-8">
		<h1 class="mb-2 text-center text-3xl font-bold text-blue-700">Message</h1>
		<p class="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
			Enter your email to receive a password reset link.
		</p>

		{#if sent}
			<Alert color="green" class="mb-4">
				If the email is registered, a reset link has been sent.
			</Alert>
			<a href="/login" class="block text-center text-sm text-primary-600 hover:underline dark:text-primary-400">
				&larr; Back to sign in
			</a>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<Label for="email" class="mb-1 block">Email</Label>
					<Input id="email" type="email" bind:value={email} placeholder="Your email address" autocomplete="email" class="pl-10">
						{#snippet left()}
							<EnvelopeSolid class="h-5 w-5 text-gray-400" />
						{/snippet}
					</Input>
				</div>

				{#if error}
					<Alert color="red">{error}</Alert>
				{/if}

				<Button type="submit" class="w-full" {loading}>
					{loading ? 'Sending...' : 'Send Reset Link'}
				</Button>
			</form>

			<p class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
				<a href="/login" class="text-primary-600 hover:underline dark:text-primary-400">&larr; Back to sign in</a>
			</p>
		{/if}
	</Card>
</div>

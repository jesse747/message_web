<script lang="ts">
	import { register } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { Card, Label, Input, Button, Alert } from 'flowbite-svelte';
	import { UserCircleSolid, EnvelopeSolid, LockSolid } from 'flowbite-svelte-icons';

	let invite_code = $state($page.url.searchParams.get('code') || '');
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister() {
		error = '';
		if (!username.trim() || !email.trim() || !password) {
			error = 'Please fill in all fields.';
			return;
		}
		if (password.length < 6) {
			error = 'Password must be at least 6 characters.';
			return;
		}
		loading = true;
		try {
			await register(invite_code, username, email, password);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	{#if !invite_code}
		<Card class="w-full max-w-md p-8 text-center">
			<h1 class="mb-4 text-2xl font-bold text-blue-700">Message</h1>
			<Alert color="yellow" class="mb-4">
				No invite code provided. Please use the link from your invitation email.
			</Alert>
			<a href="/login" class="text-blue-600 hover:underline">Back to sign in</a>
		</Card>
	{:else}
		<Card class="w-full max-w-md p-8">
			<h1 class="mb-6 text-center text-3xl font-bold text-blue-700">Create Account</h1>

			<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="space-y-4">
				<div>
					<Label for="invite_code" class="mb-1 block">Invite Code</Label>
					<Input id="invite_code" type="text" bind:value={invite_code} readonly class="bg-gray-100 pl-10 text-gray-600">
						{#snippet left()}
							<EnvelopeSolid class="h-5 w-5 text-gray-400" />
						{/snippet}
					</Input>
				</div>

				<div>
					<Label for="username" class="mb-1 block">Username</Label>
					<Input id="username" type="text" bind:value={username} placeholder="Choose a username" autocomplete="username" class="pl-10">
						{#snippet left()}
							<UserCircleSolid class="h-5 w-5 text-gray-400" />
						{/snippet}
					</Input>
				</div>

				<div>
					<Label for="email" class="mb-1 block">Email</Label>
					<Input id="email" type="email" bind:value={email} placeholder="Your email address" autocomplete="email" class="pl-10">
						{#snippet left()}
							<EnvelopeSolid class="h-5 w-5 text-gray-400" />
						{/snippet}
					</Input>
				</div>

				<div>
					<Label for="password" class="mb-1 block">Password</Label>
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
					{loading ? 'Creating account...' : 'Create Account'}
				</Button>
			</form>

			<p class="mt-4 text-center text-sm text-gray-500">
				<a href="/login" class="text-blue-600 hover:underline">Already have an account?</a>
			</p>
		</Card>
	{/if}
</div>

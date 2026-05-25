<script lang="ts">
	import { Button, Alert } from 'flowbite-svelte';

	let { error, status } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
	<div class="w-full max-w-md text-center">
		<h1 class="mb-2 text-4xl font-bold text-gray-900 dark:text-white">{status}</h1>
		<Alert color="red" class="mb-4">
			{error.message || 'An unexpected error occurred'}
		</Alert>
		<Button href="/directory">Go to Directory</Button>
	</div>
</div>

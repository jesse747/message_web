<script lang="ts">
	let { message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void } = $props();
</script>

<div class="flex flex-col items-center gap-3 py-16">
	<p class="text-red-600">{message}</p>
	{#if onRetry}
		<button onclick={onRetry} class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			Retry
		</button>
	{/if}
</div>

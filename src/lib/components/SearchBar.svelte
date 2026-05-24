<script lang="ts">
	let { value = '', onChange }: { value?: string; onChange: (v: string) => void } = $props();
</script>

<input
	type="search"
	placeholder="Search..."
	value={value}
	oninput={(e) => onChange((e.target as HTMLInputElement).value)}
	class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
/>

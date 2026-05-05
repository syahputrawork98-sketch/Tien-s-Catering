<script>
	let { categories = [], activeCategory = "Semua" } = $props();
</script>

<div class="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
	{#each ["Semua", ...categories] as category}
		<button
			class="flex-shrink-0 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 {activeCategory === category ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-zinc-500 border border-zinc-100 hover:border-brand-primary/30 hover:text-brand-primary'}"
		>
			{category}
		</button>
	{/each}
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>

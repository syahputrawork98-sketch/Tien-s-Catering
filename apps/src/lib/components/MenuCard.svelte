<script lang="ts">
	import { cart } from '$lib/stores/cartStore.svelte';
	let { 
		id = "", 
		name = "Nama Menu", 
		price = 0, 
		category = "Umum", 
		image = "", 
		stock = 0, 
		deliveryDate = "" 
	} = $props<{
		id?: string;
		name?: string;
		price?: number | string;
		category?: string;
		image?: string | null;
		stock?: number;
		deliveryDate?: string;
	}>();

	function formatPrice(val: number | string) {
		const parsedVal = typeof val === 'string' ? parseFloat(val) : val;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(parsedVal);
	}
</script>

<div class="group relative bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-primary/10 transition-all duration-300 {stock === 0 ? 'opacity-80' : ''}">
	<!-- Image Container -->
	<div class="relative h-48 w-full overflow-hidden">
		{#if image}
			<img src={image} alt={name} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 {stock === 0 ? 'grayscale' : ''}" />
		{:else}
			<div class="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300 italic text-sm">
				No Image
			</div>
		{/if}
		
		<!-- Category Tag -->
		<div class="absolute top-4 left-4">
			<span class="bg-white/90 backdrop-blur-sm text-brand-charcoal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
				{category}
			</span>
		</div>

		{#if stock === 0}
			<div class="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
				<span class="bg-white text-brand-charcoal px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transform -rotate-12 border-2 border-brand-charcoal">
					Habis Terjual
				</span>
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="p-5">
		<div class="flex justify-between items-start mb-2">
			<h3 class="text-lg font-bold text-brand-charcoal line-clamp-1">{name}</h3>
		</div>
		
		<div class="flex items-center gap-2 mb-4 text-xs">
			{#if stock > 0}
				<span class="flex items-center {stock < 5 ? 'text-orange-500 font-bold animate-pulse' : 'text-zinc-400'}">
					<svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
					{#if stock < 5}
						Sisa: {stock} porsi
					{:else}
						Stok: {stock} porsi
					{/if}
				</span>
			{:else}
				<span class="flex items-center text-red-500 font-bold">
					<svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Stok Habis
				</span>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-auto pt-2">
			<div class="text-brand-primary font-extrabold text-xl">
				{formatPrice(price)}
			</div>
			
			<button 
				disabled={stock === 0}
				onclick={() => cart.addItem({ id, name, price, image, category }, deliveryDate)}
				class="w-10 h-10 {stock === 0 ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-charcoal'} rounded-2xl flex items-center justify-center transition-all group-active:scale-95"
			>
				{#if stock > 0}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>

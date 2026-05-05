<script lang="ts">
	import { cart } from '$lib/stores/cartStore.svelte';
	import { fade, fly } from 'svelte/transition';

	let { isOpen = false, item = null, deliveryDate = "", onClose = () => {} } = $props<{
		isOpen: boolean;
		item: any;
		deliveryDate?: string;
		onClose: () => void;
	}>();

	let quantity = $state(1);

	function formatPrice(val: number | string) {
		const parsedVal = typeof val === 'string' ? parseFloat(val) : val;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(parsedVal);
	}

	function handleAddToCart() {
		if (!item) return;
		for (let i = 0; i < quantity; i++) {
			cart.addItem({
				id: item.id,
				name: item.name,
				price: item.price,
				image: item.image,
				category: item.category
			}, deliveryDate);
		}
		onClose();
		cart.toggleDrawer();
	}
</script>

{#if isOpen && item}
	<!-- Overlay -->
	<div 
		class="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-md"
		transition:fade
		onclick={onClose}
	>
		<!-- Panel -->
		<div 
			class="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative flex flex-col md:flex-row"
			transition:fly={{ y: 50, duration: 500 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Close Button -->
			<button 
				type="button"
				aria-label="Tutup detail menu"
				onclick={onClose}
				class="absolute top-6 right-6 w-12 h-12 bg-white/90 hover:bg-white text-brand-charcoal rounded-full flex items-center justify-center shadow-2xl transition-all z-[160] hover:rotate-90 active:scale-90"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Detail Image -->
			<div class="h-64 md:h-auto md:w-1/2 bg-zinc-100 shrink-0">
				<img src={item.image || '/images/placeholder-menu.jpg'} alt={item.name} class="w-full h-full object-cover" />
			</div>

			<!-- Detail Content -->
			<div class="p-10 flex flex-col justify-between">
				<div>
					<div class="flex items-center gap-3 mb-6">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
							{item.category}
						</span>
						{#if item.stock > 0}
							<span class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
								Stok Tersedia
							</span>
						{/if}
					</div>
					
					<h2 class="text-3xl font-black text-brand-charcoal mb-4 tracking-tighter uppercase">{item.name}</h2>
					<p class="text-zinc-500 text-sm leading-relaxed mb-8">
						{item.description || "Nikmati perpaduan rasa autentik dari bahan-bahan pilihan berkualitas tinggi. Dimasak segar setiap hari untuk menjaga cita rasa katering yang maksimal."}
					</p>

					<div class="space-y-2 mb-10">
						<div class="flex items-center gap-2 text-zinc-400">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<span class="text-xs font-bold uppercase tracking-widest">Menu Harian: {deliveryDate || "Hari Ini"}</span>
						</div>
					</div>
				</div>

				<div class="space-y-6 pt-8 border-t border-zinc-100">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Total Harga</p>
							<p class="text-3xl font-black text-brand-primary tracking-tight">
								{formatPrice(item.price * quantity)}
							</p>
						</div>

						<!-- Quantity Selector -->
						<div class="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden p-1 shadow-inner">
							<button 
								onclick={() => quantity = Math.max(1, quantity - 1)}
								class="w-10 h-10 flex items-center justify-center hover:bg-white text-zinc-400 hover:text-brand-charcoal transition-all font-bold text-xl rounded-xl"
							>-</button>
							<span class="w-12 text-center text-sm font-black text-brand-charcoal">{quantity}</span>
							<button 
								onclick={() => quantity++}
								class="w-10 h-10 flex items-center justify-center hover:bg-white text-zinc-400 hover:text-brand-charcoal transition-all font-bold text-xl rounded-xl"
							>+</button>
						</div>
					</div>

					<button 
						onclick={handleAddToCart}
						disabled={item.stock === 0}
						class="w-full bg-brand-charcoal text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Tambahkan Ke Keranjang
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<script lang="ts">
	import { cart, type CartItem } from '$lib/stores/cartStore.svelte';
	import { fade, fly } from 'svelte/transition';

	let stockFeedback = $state<Record<string, string>>({});

	function formatPrice(val: number | string) {
		const price = typeof val === 'string' ? parseFloat(val) : val;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function getItemKey(item: Pick<CartItem, 'id' | 'deliveryDate'>) {
		return `${item.id}::${item.deliveryDate}`;
	}

	function getStockLimit(item: Pick<CartItem, 'availableStock'>) {
		const parsed = Number(item.availableStock);
		if (!Number.isFinite(parsed)) return undefined;
		return Math.max(0, Math.floor(parsed));
	}

	function clearStockFeedback(item: Pick<CartItem, 'id' | 'deliveryDate'>) {
		const key = getItemKey(item);
		if (!stockFeedback[key]) return;

		const next = { ...stockFeedback };
		delete next[key];
		stockFeedback = next;
	}

	function setStockFeedback(item: Pick<CartItem, 'id' | 'deliveryDate'>, message: string) {
		stockFeedback = { ...stockFeedback, [getItemKey(item)]: message };
	}

	function canIncrease(item: CartItem) {
		const limit = getStockLimit(item);
		if (limit === undefined) return true;
		return item.quantity < limit;
	}

	function getStockHint(item: CartItem) {
		const key = getItemKey(item);
		if (stockFeedback[key]) return stockFeedback[key];

		const limit = getStockLimit(item);
		if (limit === undefined) return '';
		if (item.quantity > limit) {
			return `Jumlah melebihi stok, kurangi ke maksimal ${limit} porsi`;
		}
		if (item.quantity >= limit) {
			return `Maksimal ${limit} porsi tersedia`;
		}
		return '';
	}

	function handleIncrease(item: CartItem) {
		const result = cart.updateQuantity(item.id, item.deliveryDate, 1);
		if (result === 'stock_limit_reached') {
			const limit = getStockLimit(item);
			setStockFeedback(
				item,
				limit === undefined ? 'Stok maksimal tercapai' : `Maksimal ${limit} porsi tersedia`
			);
			return;
		}

		clearStockFeedback(item);
	}

	function handleDecrease(item: CartItem) {
		cart.updateQuantity(item.id, item.deliveryDate, -1);
		clearStockFeedback(item);
	}

	function handleRemove(item: CartItem) {
		cart.removeItem(item.id, item.deliveryDate);
		clearStockFeedback(item);
	}
</script>

{#if cart.isDrawerOpen}
	<!-- Backdrop -->
	<div 
		role="button"
		tabindex="0"
		aria-label="Tutup laci keranjang"
		class="fixed inset-0 bg-brand-charcoal/20 backdrop-blur-sm z-[120]" 
		transition:fade 
		onclick={() => cart.toggleDrawer()}
		onkeydown={(e) => e.key === 'Enter' && cart.toggleDrawer()}
	></div>

	<!-- Drawer -->
	<div 
		class="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[130] flex flex-col"
		transition:fly={{ x: 400, duration: 400 }}
	>
		<!-- Header -->
		<div class="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
			<h2 class="text-xl font-black text-brand-charcoal">Keranjang Saya</h2>
			<button 
				type="button"
				aria-label="Tutup keranjang"
				onclick={() => cart.toggleDrawer()}
				class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- List -->
		<div class="flex-1 overflow-y-auto px-6 py-6 transition-all">
			{#if cart.items.length === 0}
				<div class="h-full flex flex-col items-center justify-center text-center text-zinc-400">
					<div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
						<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" />
						</svg>
					</div>
					<p class="font-medium">Keranjang masih kosong</p>
					<p class="text-xs">Yuk, pilih menu lezat Anda!</p>
				</div>
			{:else}
				<div class="space-y-6">
					{#each cart.items as item}
						<div class="flex gap-4 group">
							<div class="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
								<img src={item.image} alt={item.name} class="w-full h-full object-cover" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex justify-between items-start gap-2">
									<h3 class="text-sm font-bold text-brand-charcoal line-clamp-2">{item.name}</h3>
									<button 
										type="button"
										aria-label="Hapus menu dari keranjang"
										onclick={() => handleRemove(item)}
										class="text-zinc-300 hover:text-red-500 transition-colors"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
								<p class="text-[10px] text-brand-primary font-bold uppercase mb-2">{item.category}</p>
								
								<div class="flex items-center justify-between">
									<p class="text-sm font-extrabold text-brand-charcoal">{formatPrice(item.price)}</p>
									
									<div class="flex items-center bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden shadow-sm">
										<button 
											type="button"
											aria-label="Kurangi jumlah porsi"
											onclick={() => handleDecrease(item)}
											class="w-8 h-8 flex items-center justify-center hover:bg-white text-zinc-500 transition-colors"
										>
											-
										</button>
										<span class="w-8 text-center text-xs font-bold">{item.quantity}</span>
										<button 
											type="button"
											aria-label="Tambah jumlah porsi"
											disabled={!canIncrease(item)}
											onclick={() => handleIncrease(item)}
											class="w-8 h-8 flex items-center justify-center hover:bg-white text-zinc-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
										>
											+
										</button>
									</div>
								</div>

								{#if getStockHint(item)}
									<p class="text-[10px] mt-2 font-bold text-orange-500">
										{getStockHint(item)}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		{#if cart.items.length > 0}
			<div class="p-6 border-t border-zinc-100 bg-zinc-50/50">
				<div class="flex items-center justify-between mb-6">
					<span class="text-zinc-500 font-medium">Subtotal</span>
					<span class="text-2xl font-black text-brand-charcoal">{formatPrice(cart.totalPrice)}</span>
				</div>
				<a href="/checkout" class="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/20">
					Proses Ke Pembayaran
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</a>
				<p class="text-[10px] text-center text-zinc-400 mt-4">Harga sudah termasuk pajak & layanan katering.</p>
			</div>
		{/if}
	</div>
{/if}

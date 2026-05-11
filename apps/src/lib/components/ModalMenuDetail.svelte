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
	let stockWarning = $state('');

	function formatPrice(val: number | string) {
		const parsedVal = typeof val === 'string' ? parseFloat(val) : val;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(parsedVal);
	}

	function normalizeStock(val: unknown) {
		const parsedVal = Number(val);
		if (!Number.isFinite(parsedVal)) return 0;
		return Math.max(0, Math.floor(parsedVal));
	}

	function normalizePrice(val: unknown) {
		const parsedVal = Number(val);
		return Number.isFinite(parsedVal) ? parsedVal : 0;
	}

	const itemStock = $derived(item ? normalizeStock(item.stock) : 0);
	const currentCartQty = $derived(
		item ? (cart.items.find((i) => i.id === item.id && i.deliveryDate === deliveryDate)?.quantity ?? 0) : 0
	);
	const remainingStock = $derived(Math.max(0, itemStock - currentCartQty));
	const maxSelectableQuantity = $derived(Math.max(0, remainingStock));

	$effect(() => {
		if (!isOpen || !item) {
			stockWarning = '';
			return;
		}

		stockWarning = '';
	});

	$effect(() => {
		if (!isOpen || !item) return;

		if (maxSelectableQuantity <= 0) {
			quantity = 0;
			return;
		}

		if (quantity <= 0) {
			quantity = 1;
			return;
		}

		if (quantity > maxSelectableQuantity) {
			quantity = maxSelectableQuantity;
		}
	});

	function handleAddToCart() {
		if (!item) return;
		if (maxSelectableQuantity <= 0 || quantity <= 0) {
			stockWarning = 'Stok untuk menu ini sudah habis di keranjang Anda.';
			return;
		}

		let addedCount = 0;
		const stockInfo = normalizeStock(item.stock);

		for (let i = 0; i < quantity; i++) {
			const result = cart.addItem({
				id: item.id,
				name: item.name,
				price: normalizePrice(item.price),
				image: item.image || '/images/placeholder-menu.jpg',
				category: item.category,
				stock: stockInfo
			}, deliveryDate);

			if (result === 'added') {
				addedCount += 1;
				continue;
			}

			if (result === 'stock_limit_reached') {
				stockWarning = `Maksimal ${stockInfo} porsi untuk menu ini.`;
			} else {
				stockWarning = 'Stok menu ini sedang tidak tersedia.';
			}
			break;
		}

		if (addedCount > 0) {
			stockWarning = '';
			onClose();
		}
	}
</script>

{#if isOpen && item}
	<!-- Overlay -->
	<div 
		class="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-md"
		transition:fade
		onclick={onClose}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClose();
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Tutup modal"
	>
		<!-- Panel -->
		<div 
			class="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative flex flex-col md:flex-row"
			transition:fly={{ y: 50, duration: 500 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="modal-title"
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
						{#if itemStock > 0}
							<span class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
								Sisa {remainingStock} Porsi
							</span>
						{/if}
					</div>
					
					<h2 id="modal-title" class="text-3xl font-black text-brand-charcoal mb-4 tracking-tighter uppercase italic">{item.name}</h2>
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
								type="button"
								aria-label="Kurangi jumlah"
								disabled={quantity <= 1 || maxSelectableQuantity <= 0}
								onclick={() => quantity = Math.max(1, quantity - 1)}
								class="w-10 h-10 flex items-center justify-center hover:bg-white text-zinc-400 hover:text-brand-charcoal transition-all font-bold text-xl rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
							>-</button>
							<span class="w-12 text-center text-sm font-black text-brand-charcoal">{quantity}</span>
							<button 
								type="button"
								aria-label="Tambah jumlah"
								disabled={maxSelectableQuantity <= 0 || quantity >= maxSelectableQuantity}
								onclick={() => quantity = Math.min(maxSelectableQuantity, quantity + 1)}
								class="w-10 h-10 flex items-center justify-center hover:bg-white text-zinc-400 hover:text-brand-charcoal transition-all font-bold text-xl rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
							>+</button>
						</div>
					</div>

					{#if maxSelectableQuantity <= 0}
						<p class="text-[11px] font-bold text-red-500 italic">
							Stok tidak tersedia untuk ditambahkan dari modal ini.
						</p>
					{:else}
						<p class="text-[11px] font-bold text-zinc-500 italic">
							Maksimal tambah dari modal: {maxSelectableQuantity} porsi.
						</p>
					{/if}

					{#if stockWarning}
						<p class="text-[11px] font-bold text-orange-600 italic">{stockWarning}</p>
					{/if}

					<button 
						onclick={handleAddToCart}
						disabled={itemStock === 0 || maxSelectableQuantity <= 0}
						class="w-full bg-brand-charcoal text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Tambahkan Ke Keranjang
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

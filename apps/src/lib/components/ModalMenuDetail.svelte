<script lang="ts">
	let { isOpen = false, item = null, onClose = () => {} } = $props<{
		isOpen: boolean;
		item: any;
		onClose: () => void;
	}>();
</script>

{#if isOpen && item}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-sm">
		<div class="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
			<!-- Close Button -->
			<button 
				type="button"
				aria-label="Tutup detail menu"
				onclick={onClose}
				class="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
			>
				<svg class="w-6 h-6 text-brand-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Detail Image -->
			<div class="h-64 w-full bg-zinc-100">
				<img src={item.image} alt={item.name} class="w-full h-full object-cover" />
			</div>

			<!-- Detail Content -->
			<div class="p-8">
				<div class="flex items-center gap-2 mb-2">
					<span class="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
						{item.category}
					</span>
				</div>
				<h2 class="text-2xl font-extrabold text-brand-charcoal mb-4">{item.name}</h2>
				<p class="text-zinc-500 text-sm leading-relaxed mb-8">
					Nikmati perpaduan rasa autentik dari bahan-bahan pilihan berkualitas tinggi. Dimasak segar setiap hari untuk menjaga cita rasa katering yang maksimal.
				</p>

				<div class="flex items-center justify-between pt-6 border-t border-zinc-100">
					<div>
						<p class="text-xs text-zinc-400 font-medium mb-1">Harga Per Porsi</p>
						<p class="text-2xl font-black text-brand-primary">
							{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
						</p>
					</div>
					<button class="btn-primary py-4 px-8">Tambahkan ke Keranjang</button>
				</div>
			</div>
		</div>
	</div>
{/if}

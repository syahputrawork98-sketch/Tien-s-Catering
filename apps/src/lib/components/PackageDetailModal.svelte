<script lang="ts">
	import { cart } from '$lib/stores/cartStore.svelte';
	import { fade, fly } from 'svelte/transition';

	let { isOpen = false, pkg = null, onClose = () => {} } = $props<{
		isOpen: boolean;
		pkg: any;
		onClose: () => void;
	}>();

	function formatPrice(val: number | string) {
		const parsedVal = typeof val === 'string' ? parseFloat(val) : val;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(parsedVal);
	}

	function handleSelectPackage() {
		alert(`Menyiapkan penawaran untuk paket: ${pkg.name}. Tim kami akan menghubungi Anda.`);
		onClose();
	}
</script>

{#if isOpen && pkg}
	<!-- Overlay -->
	<div 
		class="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-md"
		transition:fade
		onclick={onClose}
	>
		<!-- Panel -->
		<div 
			class="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative flex flex-col md:flex-row"
			transition:fly={{ y: 50, duration: 500 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Close Button -->
			<button 
				type="button"
				aria-label="Tutup detail paket"
				onclick={onClose}
				class="absolute top-6 right-6 w-12 h-12 bg-white/90 hover:bg-white text-brand-charcoal rounded-full flex items-center justify-center shadow-2xl transition-all z-[160] hover:rotate-90 active:scale-90"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Detail Sidebar (Image/Info) -->
			<div class="md:w-2/5 bg-brand-charcoal p-10 text-white flex flex-col justify-between overflow-hidden relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] -mr-32 -mt-32"></div>
                
                <div class="relative z-10">
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-4 block">Premium Service</span>
                    <h2 class="text-4xl font-black mb-6 tracking-tighter uppercase leading-none">{pkg.name}</h2>
                    <p class="text-zinc-400 text-sm leading-relaxed mb-8">
                        {pkg.description}
                    </p>
                </div>

                <div class="relative z-10 space-y-4">
                    <div class="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p class="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Mulai Dari</p>
                        <p class="text-2xl font-black text-brand-primary">{formatPrice(pkg.basePrice)}</p>
                    </div>
                </div>
			</div>

			<!-- Detail Content -->
			<div class="p-10 md:w-3/5 overflow-y-auto max-h-[80vh] no-scrollbar">
                <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 pb-4 border-b border-zinc-100">Apa yang Anda dapatkan?</h3>
                
                <div class="space-y-6 mb-12">
                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-charcoal">Menu Utama Pilihan</p>
                            <p class="text-xs text-zinc-500">Pilihan 5-8 menu utama mulai dari hidangan Nusantara hingga Internasional.</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-charcoal">Layanan Pramusaji</p>
                            <p class="text-xs text-zinc-500">Tim pramusaji profesional siap melayani tamu Anda selama acara berlangsung.</p>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-charcoal">Peralatan Lengkap</p>
                            <p class="text-xs text-zinc-500">Termasuk alat makan, buffet set premium, dan meja display yang elegan.</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-10">
                    <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Min. Order</p>
                        <p class="font-bold text-brand-charcoal">50 Porsi</p>
                    </div>
                    <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Area Layanan</p>
                        <p class="font-bold text-brand-charcoal">Banjarmasin & Sekitarnya</p>
                    </div>
                </div>

                <div class="flex flex-col gap-4">
                    <button 
                        onclick={handleSelectPackage}
                        class="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all"
                    >
                        Pilih Paket Ini
                    </button>
                    <button 
                        onclick={() => alert("Menghubungkan ke WhatsApp Konsultan kami...")}
                        class="w-full bg-zinc-50 text-brand-charcoal py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-zinc-100 hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Konsultasi via WhatsApp
                    </button>
                </div>
			</div>
		</div>
	</div>
{/if}

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>

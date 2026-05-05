<script lang="ts">
	import MenuCard from "$lib/components/MenuCard.svelte";
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import ModalMenuDetail from "$lib/components/ModalMenuDetail.svelte";
	import { fade } from "svelte/transition";
	
	let { data } = $props();

	const selectedDate = $derived(data.selectedDate);

	let selectedItem = $state<any>(null);
	let isModalOpen = $state(false);

	function openDetail(item: any) {
		selectedItem = item;
		isModalOpen = true;
	}
</script>

<svelte:head>
	<title>Katalog Menu Live | Tien's Catering</title>
	<meta name="description" content="Lihat menu harian kami yang segar dan lezat. Pesan sekarang untuk pengiriman hari ini atau besok." />
</svelte:head>

<PublicNavbar />

<main class="pt-32 pb-24 bg-white">
	<div class="container mx-auto px-6">
		<!-- Header -->
		<div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
			<div>
				<h1 class="text-5xl font-black text-brand-charcoal tracking-tight">Katalog Menu Live</h1>
				<p class="text-zinc-500 mt-4 text-lg max-w-2xl">
                    Pilih tanggal pengiriman dan jelajahi menu pilihan terbaik kami. 
                    <span class="text-brand-primary font-bold">Stok diperbarui setiap saat oleh tim dapur.</span>
                </p>
			</div>
			
			<div class="flex items-center gap-3 text-xs font-black text-zinc-400 bg-zinc-50 px-6 py-3 rounded-full border border-zinc-100 shadow-inner">
				<span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
				DATA STOK REAL-TIME
			</div>
		</div>

		<!-- Premium Date Scroller -->
		<div class="mb-16">
			<div class="flex items-center gap-5 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 snap-x">
				{#each data.dateItems as item}
					<a 
						href="?date={item.date}"
						class="flex-none snap-start group"
					>
						<div class="w-24 h-32 rounded-[3rem] flex flex-col items-center justify-center transition-all duration-500 border-2 
							{selectedDate === item.date 
								? 'bg-brand-charcoal text-white border-brand-charcoal shadow-2xl shadow-brand-charcoal/30 -translate-y-2' 
								: 'bg-white text-zinc-400 border-zinc-100 hover:border-brand-primary/40 hover:text-brand-charcoal shadow-sm'}"
						>
							<span class="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{item.label}</span>
							<span class="text-4xl font-black leading-none">{item.dayNum}</span>
							<span class="text-[10px] font-bold mt-2 uppercase tracking-wide">{item.fullLabel.split(' ')[1]}</span>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Menu Grid -->
		{#key selectedDate}
			<div 
				in:fade={{ duration: 400 }}
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
			>
				{#each data.menus as item}
					<div class="relative group">
						<MenuCard 
							id={item.id}
							name={item.name} 
							price={item.basePrice} 
							category={item.category} 
							stock={item.stock} 
							image={item.image} 
							deliveryDate={selectedDate}
							onDetail={openDetail}
						/>
						
						<div class="absolute inset-0 z-10 bg-white/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-3xl pointer-events-none">
							<button 
								type="button"
								disabled={item.stock === 0}
								onclick={() => openDetail({...item, price: item.basePrice})} 
								class="pointer-events-auto bg-brand-charcoal text-white px-8 py-3 rounded-2xl text-xs font-black shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 uppercase tracking-widest hover:bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Pesan Sekarang
							</button>
						</div>
					</div>
				{/each}

				{#if data.menus.length === 0}
					<div class="col-span-full py-40 flex flex-col items-center justify-center text-center">
						<div class="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
							<svg class="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 class="text-2xl font-black text-zinc-300 tracking-tight uppercase">Menu Sedang Dimasak</h3>
						<p class="text-zinc-400 text-sm mt-1">Kami sedang menyusun komposisi terbaik untuk hari ini.</p>
					</div>
				{/if}
			</div>
		{/key}
	</div>

	<ModalMenuDetail 
		isOpen={isModalOpen} 
		item={selectedItem} 
		deliveryDate={selectedDate}
		onClose={() => isModalOpen = false} 
	/>
</main>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>

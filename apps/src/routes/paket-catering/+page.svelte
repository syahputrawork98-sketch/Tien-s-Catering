<script lang="ts">
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import PackageDetailModal from "$lib/components/PackageDetailModal.svelte";
	import { fade, fly } from "svelte/transition";
	
	let { data } = $props();

	let selectedPackage = $state<any>(null);
	let isModalOpen = $state(false);

	function openPackageDetail(pkg: any) {
		selectedPackage = pkg;
		isModalOpen = true;
	}
</script>

<svelte:head>
	<title>Paket Catering | Tien's Catering</title>
	<meta name="description" content="Pilihan paket catering lengkap untuk berbagai acara. Nasi Box, Snack Box, hingga Prasmanan Premium." />
</svelte:head>

<PublicNavbar />

<main class="pt-32 pb-24 bg-white">
	<div class="container mx-auto px-6">
		<!-- Header -->
		<div class="max-w-3xl mb-20">
			<span class="text-brand-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">Our Special Services</span>
			<h1 class="text-6xl font-black text-brand-charcoal tracking-tighter mb-6">Paket Catering<br><span class="text-brand-primary italic">Profesional</span></h1>
			<p class="text-zinc-500 text-xl leading-relaxed">
				Kami menyediakan berbagai pilihan paket yang dirancang khusus untuk memenuhi kebutuhan acara Anda, 
				mulai dari rapat kantor harian hingga pesta pernikahan megah.
			</p>
		</div>

		<!-- Packages Grid -->
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
			{#each data.packages as pkg, i}
				<div 
					in:fly={{ y: 20, delay: i * 100 }}
					class="group bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] overflow-hidden hover:border-brand-primary/50 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/5"
				>
					<!-- Image Container -->
					<div class="aspect-[16/10] overflow-hidden relative">
						{#if pkg.image}
							<img 
								src={pkg.image} 
								alt={pkg.name} 
								class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
							/>
						{:else}
							<div class="w-full h-full bg-brand-primary/5 flex items-center justify-center text-5xl">
								🍱
							</div>
						{/if}
						<div class="absolute top-6 left-6 flex gap-2">
							<span class="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-brand-charcoal shadow-sm">
								{pkg.packageCategory || pkg.category}
							</span>
							{#if pkg.minPax}
								<span class="px-3 py-1 bg-brand-primary/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
									Min. {pkg.minPax} Pax
								</span>
							{/if}
						</div>
					</div>

					<div class="p-10">
						<h3 class="text-2xl font-black text-brand-charcoal dark:text-white mb-4 group-hover:text-brand-primary transition-colors">{pkg.name}</h3>
						<p class="text-zinc-500 text-sm leading-relaxed mb-8 line-clamp-2">{pkg.description}</p>
						
						{#if pkg.suitableFor && pkg.suitableFor.length > 0}
							<div class="mb-8 space-y-3">
								<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cocok Untuk:</p>
								<div class="flex flex-wrap gap-2">
									{#each pkg.suitableFor as tag}
										<span class="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{tag}</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if pkg.features && pkg.features.length > 0}
							<div class="mb-8">
								<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Isi Paket Utama:</p>
								<ul class="space-y-2">
									{#each pkg.features as feature}
										<li class="flex items-center gap-3 text-xs font-bold text-zinc-500">
											<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
											</svg>
											{feature}
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<div class="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
							<div>
								<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mulai Dari</p>
								<p class="text-xl font-black text-brand-primary italic">
									{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.basePrice)}
								</p>
							</div>
							<button 
								onclick={() => openPackageDetail(pkg)}
								class="bg-brand-charcoal text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:scale-105 transition-all shadow-xl shadow-brand-charcoal/10"
							>
								Detail Paket
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- CTA Section -->
		<section class="mt-32 bg-brand-charcoal rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden">
			<div class="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/10 blur-[100px]"></div>
			<h2 class="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Butuh Menu Kustom?</h2>
			<p class="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
				Kami memahami setiap acara unik. Diskusikan kebutuhan spesifik Anda dengan tim konsultan katering kami.
			</p>
			<div class="flex flex-col sm:flex-row gap-6 justify-center">
				<a href="/kontak" class="bg-brand-primary text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-brand-primary/30 hover:scale-105 transition-all">
					Hubungi Konsultan Kami
				</a>
				<button onclick={() => alert("Fitur brosur PDF menyusul")} class="px-12 py-5 rounded-2xl border border-white/20 font-black hover:bg-white/10 transition-all">
					Download Katalog PDF
				</button>
			</div>
		</section>
	</div>

	<PackageDetailModal 
		isOpen={isModalOpen} 
		pkg={selectedPackage} 
		onClose={() => isModalOpen = false} 
	/>
</main>

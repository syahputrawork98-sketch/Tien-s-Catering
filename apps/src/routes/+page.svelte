<script lang="ts">
	import MenuCard from "$lib/components/MenuCard.svelte";
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import { fade, fly } from "svelte/transition";
	
	let { data } = $props();

	const selectedDate = $derived(data.selectedDate);
</script>

<svelte:head>
	<title>Gourmet Hub | Solusi Katering Profesional & Berkualitas</title>
	<meta name="description" content="Layanan katering terbaik untuk instansi, kantor, dan acara personal dengan cita rasa gourmet." />
</svelte:head>

<!-- Global Navbar -->
<PublicNavbar />

<main class="relative overflow-hidden bg-white">
	
	<!-- Hero Section -->
	<section class="relative h-screen flex items-center justify-center overflow-hidden">
		<div class="absolute inset-0 z-0">
			<img 
				src="/hero-bg.png" 
				alt="Premium Catering Background" 
				class="w-full h-full object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white"></div>
		</div>

		<div class="container mx-auto px-6 relative z-10 text-center">
			<div in:fly={{ y: 20, duration: 1000 }}>
				<span class="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-brand-primary uppercase bg-brand-primary/10 rounded-full border border-brand-primary/20 backdrop-blur-md">
					#1 Catering Solution Jakarta
				</span>
				<h1 class="text-5xl lg:text-8xl font-black text-white leading-tight mb-6 tracking-tighter">
					Sajian <span class="text-brand-primary italic">Gourmet</span><br>Tanpa Batas.
				</h1>
				<p class="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto font-medium">
					Standar kebersihan hotel bintang 5 dalam genggaman digital Anda. Solusi terbaik untuk instansi, korporat, dan acara spesial.
				</p>
				
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="/register" class="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl shadow-brand-primary/30">
						Mulai Sekarang
					</a>
					<a href="#katalog" class="px-10 py-5 rounded-2xl border border-white/20 text-white font-black hover:bg-white/10 backdrop-blur-sm transition-all focus:ring-2 focus:ring-white/20 outline-none">
						Lihat Menu Live
					</a>
				</div>
			</div>
		</div>

		<!-- Scroll Indicator -->
		<div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
			<span class="text-[10px] font-black uppercase tracking-[0.2em]">Scroll</span>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
			</svg>
		</div>
	</section>

	<!-- Live Menu Catalog Section -->
	<section id="katalog" class="py-32 bg-white relative">
		<div class="container mx-auto px-6">
			<div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
				<div>
					<h2 class="text-5xl font-black text-brand-charcoal tracking-tight">Katalog Menu Live</h2>
					<p class="text-zinc-500 mt-2 text-lg">Pilih tanggal dan saksikan sajian kurasi chef kami hari ini.</p>
				</div>
				
				<div class="flex items-center gap-3 text-xs font-black text-zinc-400 bg-zinc-50 px-6 py-3 rounded-full border border-zinc-100 shadow-inner">
					<span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
					KONSTRUKSI STOK REAL-TIME
				</div>
			</div>

			<!-- Premium Date Scroller -->
			<div class="mb-16">
				<div class="flex items-center gap-5 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 snap-x">
					{#each data.dateItems as item}
						<a 
							href="?date={item.date}#katalog"
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
							/>
							
							<div class="absolute inset-0 z-10 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-3xl pointer-events-none">
								<a 
									href="/login" 
									class="pointer-events-auto bg-brand-charcoal text-white px-8 py-3 rounded-2xl text-xs font-black shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 uppercase tracking-widest"
								>
									Pesan Sekarang
								</a>
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
	</section>

	<!-- Paket Catering Section -->
	<section id="paket" class="py-32 bg-zinc-950 relative overflow-hidden">
		<!-- Background Accents -->
		<div class="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 blur-[150px] -translate-y-1/2"></div>
		
		<div class="container mx-auto px-6 relative z-10">
			<div class="text-center max-w-3xl mx-auto mb-20">
				<span class="text-brand-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">Special Bundles</span>
				<h2 class="text-5xl font-black text-white mb-6 tracking-tighter">Paket Event & Korporat</h2>
				<p class="text-zinc-400 text-lg">Solusi prasmanan dan snackbox untuk ribuan porsi dengan standar kualitas yang konsisten.</p>
			</div>

			<div class="grid md:grid-cols-3 gap-10">
				{#each data.packages as pkg}
					<div class="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 group hover:border-brand-primary/50 transition-all duration-500">
						<div class="w-20 h-20 bg-brand-primary/20 rounded-3xl flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 transition-transform">
							<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 15.546c.053.34.11.662.174.957.248 1.11.873 1.605 2.03 1.837m-2.204-2.794a3.745 3.745 0 01-1.07-1.912l-2.03-1.838m7.304 6.544a4 4 0 01-1.12 1.341l-1.07 1.912m-6.234-6.544l1.07 1.912a4 4 0 011.12-1.341m6.064 6.064a4.452 4.452 0 00.55-.832M3 15.546c-.053.34-.11.662-.174.957-.248 1.11-.873 1.605-2.03 1.837m2.204-2.794a3.745 3.745 0 011.07-1.912l2.03-1.838m-7.304 6.544a4 4 0 011.12 1.341l1.07 1.912m6.234-6.544l-1.07 1.912a4 4 0 01-1.12-1.341m-6.064 6.064a4.452 4.452 0 01-.55-.832" />
							</svg>
						</div>
						<h3 class="text-2xl font-black text-white mb-4">{pkg.name}</h3>
						<p class="text-zinc-500 text-sm leading-relaxed mb-8">{pkg.description || 'Layanan lengkap katering profesional untuk kebutuhan formal Anda.'}</p>
						<div class="flex items-center justify-between">
							<span class="text-white font-black">Mulai {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(pkg.basePrice))}</span>
							<a href="/login" class="text-brand-primary font-black text-xs uppercase tracking-widest hover:underline">Detail Paket</a>
						</div>
					</div>
				{/each}
				
				{#if data.packages.length === 0}
					<div class="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest">
						Paket Sedang Dalam Negosiasi Kurasi
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Tentang Kami Section -->
	<section id="tentang-kami" class="py-32 bg-white relative">
		<div class="container mx-auto px-6">
			<div class="grid lg:grid-cols-2 gap-24 items-center">
				<div class="relative">
					<div class="aspect-square rounded-[4rem] overflow-hidden shadow-2xl relative z-10">
						<img src="/hero-bg.png" alt="Our Kitchen" class="w-full h-full object-cover" />
					</div>
					<div class="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-primary rounded-[3rem] -z-0 flex items-center justify-center p-10 text-white shadow-2xl shadow-brand-primary/40">
						<div class="text-center">
							<p class="text-5xl font-black mb-2">10+</p>
							<p class="text-[10px] font-bold uppercase tracking-widest leading-tight">Instansi Pemkot Telah Terlayani</p>
						</div>
					</div>
				</div>

				<div class="space-y-10">
					<div>
						<span class="text-brand-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">Our Values</span>
						<h2 class="text-5xl font-black text-brand-charcoal tracking-tighter leading-tight">Komitmen Kami Pada<br>Keunggulan Kuliner.</h2>
					</div>
					
					<p class="text-zinc-500 text-lg leading-relaxed font-medium">
						Gourmet Hub lahir dari visi untuk mendemokratisasi kualitas masakan hotel bintang 5 ke lingkungan kerja harian. Kami percaya bahwa makanan yang baik adalah bahan bakar bagi produktivitas dan kebahagiaan di kantor.
					</p>

					<div class="grid grid-cols-2 gap-8">
						<div class="space-y-3">
							<h4 class="text-brand-charcoal font-black text-xl tracking-tight">Hygienic Pro</h4>
							<p class="text-zinc-400 text-sm leading-relaxed">Sertifikasi dapur standar industri dengan pengawasan ketat.</p>
						</div>
						<div class="space-y-3">
							<h4 class="text-brand-charcoal font-black text-xl tracking-tight">Eco Delivery</h4>
							<p class="text-zinc-400 text-sm leading-relaxed">Komitmen mengurangi sampah plastik dalam setiap kemasan kami.</p>
						</div>
					</div>

					<div class="pt-6">
						<a href="/register" class="bg-brand-charcoal text-white px-10 py-5 rounded-2xl font-black hover:bg-zinc-800 transition-all inline-block shadow-xl">
							Gabung Menjadi Partner
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="py-24 bg-white border-t border-zinc-100 relative">
		<div id="kontak" class="absolute -top-10 left-1/2 -translate-x-1/2">
			<a 
				href="https://wa.me/xxx" 
				class="bg-brand-primary text-white flex items-center gap-4 px-10 py-5 rounded-[2rem] shadow-2xl shadow-brand-primary/40 hover:scale-105 transition-all"
			>
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.633 2.316 2.369-.621c.907.515 1.765.801 2.94.801 3.179 0 5.765-2.586 5.765-5.766 0-3.18-2.586-5.703-5.703-5.703zm3.42 8.121c-.149.418-.846.772-1.168.825-.262.043-.604.076-1.74-.388-1.451-.59-2.383-2.072-2.454-2.167-.07-.091-.565-.747-.565-1.439 0-.693.364-1.033.493-1.177.13-.143.284-.179.379-.179l.273.011c.083.003.193-.032.302.228.113.27.387.944.421 1.013.033.069.056.149.011.239-.044.091-.067.147-.135.225-.067.079-.142.176-.204.236-.069.067-.142.14-.061.278.081.139.36.593.774.959.533.473.984.619 1.123.687.14.069.222.057.302-.038.081-.097.347-.406.44-.543.093-.139.186-.118.314-.069.128.05.815.384.956.453.142.069.237.104.272.164.035.059.035.347-.114.765z"/>
				</svg>
				<span class="font-black uppercase tracking-widest text-sm">Chat CS Sekarang</span>
			</a>
		</div>

		<div class="container mx-auto px-6">
			<div class="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 mt-10">
				<div class="flex items-center gap-4">
					<div class="w-16 h-16 bg-brand-charcoal rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl">G</div>
					<div>
						<span class="text-3xl font-black text-brand-charcoal tracking-tighter">Gourmet<span class="text-brand-primary">Hub</span></span>
						<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Premium Catering Excellence</p>
					</div>
				</div>
				<div class="flex gap-12">
					<button onclick={() => alert("Follow us on Instagram: @tienscatering")} class="text-xs font-black text-zinc-400 hover:text-brand-primary uppercase tracking-[0.2em] transition-all">Instagram</button>
					<button onclick={() => alert("Sitemap coming soon")} class="text-xs font-black text-zinc-400 hover:text-brand-primary uppercase tracking-[0.2em] transition-all">Sitemap</button>
					<button onclick={() => alert("Privacy Policy")} class="text-xs font-black text-zinc-400 hover:text-brand-primary uppercase tracking-[0.2em] transition-all">Privacy</button>
				</div>
			</div>
			
			<div class="pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] gap-6 text-center md:text-left">
				<p>© 2026 Gourmet Hub | PT Kuliner Antariksa Nusantara.</p>
				<div class="flex items-center gap-6">
					<span>Banjarmasin, Indonesia</span>
					<span class="bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">Ver 2.1.0</span>
				</div>
			</div>
		</div>
	</footer>
</main>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
</style>

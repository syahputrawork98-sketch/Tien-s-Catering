<script lang="ts">
	import MenuCard from "$lib/components/MenuCard.svelte";
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import { fade, fly } from "svelte/transition";
	
	let { data } = $props();

	const selectedDate = $derived(data.selectedDate);
</script>

<svelte:head>
	<title>Tien's Catering | Solusi Katering Profesional & Berkualitas</title>
	<meta name="description" content="Layanan katering terbaik untuk instansi, kantor, dan acara personal dengan cita rasa autentik." />
</svelte:head>

<!-- Global Navbar -->
<PublicNavbar />

<main class="relative min-h-screen flex flex-col bg-brand-charcoal">
	
	<!-- Full Screen Hero Section -->
	<section class="relative flex-grow flex items-center justify-center overflow-hidden pt-32 md:pt-40">
		<!-- Background Image with Overlay -->
		<div class="absolute inset-0 z-0">
			<img 
				src="/hero-bg.png" 
				alt="Premium Catering Background" 
				class="w-full h-full object-cover opacity-60"
			/>
			<div class="absolute inset-0 bg-gradient-to-b from-brand-charcoal/90 via-brand-charcoal/40 to-brand-charcoal"></div>
		</div>

		<div class="container mx-auto px-6 relative z-10 text-center">
			<div in:fly={{ y: 30, duration: 1200 }}>
				<span class="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.3em] text-brand-primary uppercase bg-brand-primary/10 rounded-full border border-brand-primary/20 backdrop-blur-md">
					Fresh • Reliable • Event Ready
				</span>
				
				<h1 class="text-6xl lg:text-9xl font-black text-white leading-none mb-8 tracking-tighter">
					Tien's<br><span class="text-brand-primary italic">Catering</span>
				</h1>
				
				<p class="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
					Solusi catering praktis untuk acara keluarga, kantor, sekolah, dan instansi. 
                    Kualitas premium dengan cita rasa autentik Nusantara.
				</p>
				
				<div class="flex flex-col sm:flex-row gap-6 justify-center">
					<a href="/paket-catering" class="bg-brand-primary text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-primary/30">
						Paket Catering
					</a>
					<a href="/katalog" class="px-12 py-5 rounded-2xl border border-white/20 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 backdrop-blur-sm transition-all focus:ring-2 focus:ring-white/20 outline-none">
						Lihat Menu
					</a>
				</div>
			</div>
		</div>

		<!-- Scroll Indicator -->
		<div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/20 animate-pulse">
			<span class="text-[9px] font-black uppercase tracking-[0.4em]">Discover More</span>
			<div class="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
		</div>
	</section>

	<!-- Minimal Footer for Home -->
	<footer class="py-12 bg-brand-charcoal border-t border-white/5 relative z-10">
		<div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl">T</div>
				<div>
					<span class="text-xl font-black text-white tracking-tighter">Tien's<span class="text-brand-primary"> Catering</span></span>
					<p class="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Premium Catering Excellence</p>
				</div>
			</div>
			
			<div class="flex flex-wrap justify-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
				<a href="/tentang-kami" class="hover:text-brand-primary transition-colors">Tentang Kami</a>
				<a href="/kontak" class="hover:text-brand-primary transition-colors">Hubungi Kami</a>
				<p>© 2026 PT Kuliner Antariksa Nusantara.</p>
			</div>
		</div>
	</footer>
</main>>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>

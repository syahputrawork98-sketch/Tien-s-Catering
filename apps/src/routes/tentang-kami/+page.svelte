<script lang="ts">
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import { fade, fly } from "svelte/transition";
</script>

<svelte:head>
	<title>Tentang Kami | Tien's Catering</title>
	<meta name="description" content="Kisah di balik Tien's Catering. Komitmen kami untuk menyajikan makanan berkualitas hotel bintang 5 ke lingkungan kerja Anda." />
</svelte:head>

<PublicNavbar />

<main class="pt-32 pb-24 bg-white">
	<div class="container mx-auto px-6">
		<!-- Story Section -->
		<div class="grid lg:grid-cols-2 gap-24 items-center mb-40">
			<div class="space-y-10">
				<div>
					<span class="text-brand-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">Our Story</span>
					<h1 class="text-6xl font-black text-brand-charcoal tracking-tighter leading-tight">Dedikasi Pada<br><span class="text-brand-primary italic">Kualitas Rasa</span></h1>
				</div>
				
				<div class="space-y-6 text-zinc-500 text-lg leading-relaxed font-medium">
					<p>
						Tien's Catering berawal dari sebuah dapur keluarga kecil yang memiliki visi besar: membawa standar kuliner kelas atas ke dalam kotak makan harian Anda. 
					</p>
					<p>
						Kami percaya bahwa makanan bukan sekadar pengisi perut, melainkan apresiasi bagi para pekerja keras. Itulah mengapa setiap butir nasi dan setiap rempah yang kami gunakan dipilih dengan ketelitian standar hotel bintang lima.
					</p>
				</div>

				<div class="flex items-center gap-8 pt-6">
					<div>
						<p class="text-4xl font-black text-brand-charcoal mb-1">10+</p>
						<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Instansi Terlayani</p>
					</div>
					<div class="w-px h-12 bg-zinc-100"></div>
					<div>
						<p class="text-4xl font-black text-brand-charcoal mb-1">50k+</p>
						<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Porsi Terkirim</p>
					</div>
					<div class="w-px h-12 bg-zinc-100"></div>
					<div>
						<p class="text-4xl font-black text-brand-charcoal mb-1">98%</p>
						<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kepuasan Client</p>
					</div>
				</div>
			</div>

			<div class="relative">
				<div class="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10">
					<img src="/hero-bg.png" alt="Our Quality Kitchen" class="w-full h-full object-cover" />
				</div>
				<div class="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-primary rounded-[3rem] -z-0 flex items-center justify-center p-8 text-white shadow-2xl shadow-brand-primary/40 rotate-12">
					<div class="text-center">
						<p class="text-xs font-black uppercase tracking-widest leading-tight">Authentic Taste Certified</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Values Grid -->
		<div class="mb-40">
			<div class="text-center mb-20">
				<h2 class="text-4xl font-black text-brand-charcoal tracking-tight uppercase">Kenapa Memilih Kami?</h2>
				<div class="w-24 h-2 bg-brand-primary mx-auto mt-4 rounded-full"></div>
			</div>

			<div class="grid md:grid-cols-3 gap-12">
				<div class="bg-zinc-50 p-12 rounded-[3rem] border border-zinc-100">
					<div class="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-8">
						<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<h3 class="text-2xl font-black text-brand-charcoal mb-4 tracking-tight">Higienis & Terukur</h3>
					<p class="text-zinc-500 font-medium leading-relaxed">Setiap proses masak diawasi ketat dengan standar kebersihan tinggi dan pengukuran nutrisi yang seimbang.</p>
				</div>

				<div class="bg-zinc-50 p-12 rounded-[3rem] border border-zinc-100">
					<div class="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-8">
						<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-2xl font-black text-brand-charcoal mb-4 tracking-tight">Ketepatan Waktu</h3>
					<p class="text-zinc-500 font-medium leading-relaxed">Sistem logistik cerdas kami memastikan pesanan tiba di lokasi Anda sebelum jam makan dimulai.</p>
				</div>

				<div class="bg-zinc-50 p-12 rounded-[3rem] border border-zinc-100">
					<div class="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-8">
						<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
					</div>
					<h3 class="text-2xl font-black text-brand-charcoal mb-4 tracking-tight">Rasa Rumahan</h3>
					<p class="text-zinc-500 font-medium leading-relaxed">Resep autentik Nusantara yang disajikan dengan teknik modern untuk menjaga rasa "masakan ibu".</p>
				</div>
			</div>
		</div>

		<!-- Service Area -->
		<section class="bg-brand-charcoal rounded-[4rem] p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12">
			<div class="max-w-xl">
				<h2 class="text-4xl font-black mb-6 tracking-tighter italic">Area Layanan Kami</h2>
				<p class="text-zinc-400 font-medium mb-8">Saat ini kami melayani pengiriman di seluruh wilayah Banjarmasin dan sekitarnya (Banjarbaru & Martapura).</p>
				<div class="flex gap-4">
					<a href="/katalog" class="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20">Cek Katalog Menu</a>
					<a href="/kontak" class="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20">Hubungi Kami</a>
				</div>
			</div>
			<div class="w-full md:w-1/3 aspect-square bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center p-12 text-center">
				<div>
					<p class="text-6xl mb-4">📍</p>
					<p class="text-xs font-black uppercase tracking-[0.3em]">Kantor Pusat Banjarmasin</p>
				</div>
			</div>
		</section>
	</div>
</main>

<script lang="ts">
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import { fade, fly } from "svelte/transition";
	import { mockBusinessProfile } from "$lib/mock/business";

	let formState = $state({
		name: '',
		whatsapp: '',
		need: 'nasi-box',
		message: ''
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		alert(`Terima kasih ${formState.name}! Pesan Anda telah kami terima (Simulasi). Kami akan segera menghubungi Anda melalui WhatsApp.`);
	}
</script>

<svelte:head>
	<title>Hubungi Kami | Tien's Catering</title>
	<meta name="description" content="Ada pertanyaan atau butuh penawaran khusus? Hubungi tim Tien's Catering sekarang." />
</svelte:head>

<PublicNavbar />

<main class="pt-32 pb-24 bg-white">
	<div class="container mx-auto px-6">
		<div class="grid lg:grid-cols-2 gap-20">
			<!-- Contact Info & Form -->
			<div class="space-y-12">
				<div>
					<span class="text-brand-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">Get In Touch</span>
					<h1 class="text-6xl font-black text-brand-charcoal tracking-tighter mb-6">Hubungi Kami</h1>
					<p class="text-zinc-500 text-lg font-medium leading-relaxed max-w-xl">
						Siap untuk pengalaman katering terbaik? Tim kami standby untuk menjawab setiap pertanyaan dan kebutuhan acara Anda.
					</p>
				</div>

				<div class="grid sm:grid-cols-2 gap-8">
					<div class="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group hover:border-brand-primary/30 transition-all">
						<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">WhatsApp CS</p>
						<p class="text-xl font-black text-brand-charcoal mb-2">{mockBusinessProfile.whatsappDisplay}</p>
						<a 
							href={mockBusinessProfile.whatsappUrl} 
							target="_blank" 
							rel="noreferrer"
							class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
						>
							Chat Sekarang ↗
						</a>
					</div>
					<div class="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group hover:border-brand-primary/30 transition-all">
						<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Email Support</p>
						<p class="text-xl font-black text-brand-charcoal mb-2">{mockBusinessProfile.email}</p>
						<p class="text-xs text-zinc-400 font-bold uppercase tracking-widest">Penawaran & Kerjasama</p>
					</div>
				</div>

				<form onsubmit={handleSubmit} class="space-y-6 bg-zinc-50 p-10 md:p-12 rounded-[3.5rem] border border-zinc-100">
					<h3 class="text-2xl font-black text-brand-charcoal mb-8 uppercase tracking-tight italic">Form Konsultasi</h3>
					
					<div class="grid sm:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="name" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nama Lengkap</label>
							<input id="name" type="text" bind:value={formState.name} required placeholder="Masukkan nama Anda" class="w-full px-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal" />
						</div>
						<div class="space-y-2">
							<label for="whatsapp" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
							<input id="whatsapp" type="tel" bind:value={formState.whatsapp} required placeholder="0812xxxx" class="w-full px-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal" />
						</div>
					</div>

					<div class="space-y-2">
						<label for="need" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Kebutuhan Acara</label>
						<select id="need" bind:value={formState.need} class="w-full px-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal">
							<option value="nasi-box">Paket Nasi Box</option>
							<option value="snack-box">Paket Snack Box</option>
							<option value="prasmanan">Paket Prasmanan</option>
							<option value="custom">Custom / Lainnya</option>
						</select>
					</div>

					<div class="space-y-2">
						<label for="message" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Pesan Tambahan</label>
						<textarea id="message" bind:value={formState.message} rows="4" placeholder="Jelaskan kebutuhan acara Anda..." class="w-full px-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal resize-none"></textarea>
					</div>

					<button type="submit" class="w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
						Kirim Pesan Sekarang
					</button>
				</form>
			</div>

			<!-- Address & Map -->
			<div class="space-y-10">
				<div class="bg-brand-charcoal rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-brand-charcoal/20">
					<div class="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-3xl"></div>
					<h3 class="text-sm font-black text-brand-primary uppercase tracking-[0.3em] mb-6 block italic">Dapur & Pickup Point</h3>
					<p class="text-2xl font-black mb-4">{mockBusinessProfile.name}</p>
					<p class="text-xl font-bold mb-2">{mockBusinessProfile.shortAddress}</p>
					<p class="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-8 leading-relaxed">
						{mockBusinessProfile.addressNote}<br>
						{mockBusinessProfile.serviceArea}
					</p>
					
					<div class="space-y-4 pt-8 border-t border-white/10">
						<div class="flex items-center gap-4">
							<span class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-primary">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</span>
							<div>
								<p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Jam Operasional</p>
								<p class="text-sm font-bold text-zinc-300">{mockBusinessProfile.operatingHours}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Interactive Map Card -->
				<div class="w-full aspect-square bg-zinc-50 rounded-[4rem] border border-zinc-200 flex flex-col items-center justify-center text-center p-12 group overflow-hidden relative transition-all hover:border-brand-primary/30">
					<div class="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none grid grid-cols-6 grid-rows-6 gap-4 p-8">
						{#each Array(36) as _}
							<div class="bg-brand-charcoal rounded-lg"></div>
						{/each}
					</div>

					<div class="relative z-10 space-y-8">
						<div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl shadow-2xl mx-auto transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
							📍
						</div>
						
						<div>
							<p class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Lokasi Kami</p>
							<h4 class="text-2xl font-black text-brand-charcoal tracking-tighter uppercase">{mockBusinessProfile.name} — Cimahi</h4>
							<p class="text-zinc-500 text-xs font-bold mt-4 px-8 leading-relaxed italic">
								"Titik maps menggunakan patokan Terapi Telapak Tangan yang berada di area yang sama."
							</p>
							<p class="text-zinc-400 text-[10px] mt-4 font-mono">{mockBusinessProfile.latitude}, {mockBusinessProfile.longitude}</p>
						</div>

						<a 
							href={mockBusinessProfile.googleMapsUrl} 
							target="_blank" 
							rel="noreferrer"
							class="inline-block bg-brand-charcoal text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:scale-105 transition-all shadow-xl shadow-brand-charcoal/20"
						>
							Buka di Google Maps
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

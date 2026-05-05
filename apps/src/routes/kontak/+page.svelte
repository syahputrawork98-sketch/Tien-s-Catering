<script lang="ts">
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";
	import { fade, fly } from "svelte/transition";

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
					<div class="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
						<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">WhatsApp CS</p>
						<p class="text-xl font-black text-brand-charcoal mb-2">0812-3456-7890</p>
						<p class="text-xs text-zinc-400 font-bold uppercase tracking-widest">Respons Cepat</p>
					</div>
					<div class="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
						<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Email Support</p>
						<p class="text-xl font-black text-brand-charcoal mb-2">halo@tiens.test</p>
						<p class="text-xs text-zinc-400 font-bold uppercase tracking-widest">Quotation & Penawaran</p>
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

			<!-- Address & Map Placeholder -->
			<div class="space-y-10">
				<div class="bg-brand-charcoal rounded-[4rem] p-12 text-white relative overflow-hidden">
					<div class="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-3xl"></div>
					<h3 class="text-sm font-black text-brand-primary uppercase tracking-[0.3em] mb-6 block italic">Head Office</h3>
					<p class="text-2xl font-black mb-4">Jl. Contoh Catering No. 10,<br>Banjarmasin Tengah, 70111</p>
					<p class="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-8">Kalimantan Selatan, Indonesia</p>
					
					<div class="space-y-4 pt-8 border-t border-white/10">
						<div class="flex items-center gap-4">
							<span class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-primary">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</span>
							<div>
								<p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Jam Operasional</p>
								<p class="text-sm font-bold text-zinc-300">Senin - Sabtu: 07:00 - 17:00</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Mock Google Maps Box -->
				<div class="w-full aspect-square bg-zinc-100 rounded-[4rem] border border-zinc-200 flex flex-col items-center justify-center text-center p-12 group overflow-hidden relative">
					<div class="absolute inset-0 bg-zinc-200/50 flex flex-col items-center justify-center gap-6 p-10 z-10">
						<div class="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl animate-bounce">📍</div>
						<div>
							<h4 class="text-xl font-black text-zinc-400 uppercase tracking-tighter">Google Maps Placeholder</h4>
							<p class="text-zinc-400 text-sm font-bold mt-2 uppercase tracking-widest px-8 leading-relaxed">Peta lokasi kantor pusat kami akan tampil di sini.</p>
						</div>
					</div>
					
					<!-- Decorative Map Patterns -->
					<div class="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-6 grid-rows-6 gap-4 p-8">
						{#each Array(36) as _}
							<div class="bg-zinc-400 rounded-lg"></div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

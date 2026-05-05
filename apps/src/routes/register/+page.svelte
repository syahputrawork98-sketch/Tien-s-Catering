<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	
	let loading = $state(false);
	let name = $state('');
	let phone = $state('');
	let password = $state('');

	function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		setTimeout(() => {
			alert("Auth backend belum tersedia. Registrasi UI berhasil disimulasikan.");
			loading = false;
		}, 1000);
	}
</script>

<svelte:head>
	<title>Daftar User | Tien's Catering Premium</title>
</svelte:head>

<div class="min-h-screen bg-zinc-50 flex items-center justify-center p-6 relative overflow-hidden dark:bg-zinc-950">
	<!-- Abstract Background Decoration -->
	<div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full"></div>
	<div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full"></div>

	<div class="w-full max-w-md relative z-10" in:fly={{ y: 20, duration: 600 }}>
		<!-- Logo & Title -->
		<div class="text-center mb-10">
			<a href="/" class="inline-flex items-center gap-3 mb-6 group">
				<div class="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-primary/20 group-hover:rotate-12 transition-transform">T</div>
				<span class="text-3xl font-black text-brand-charcoal tracking-tighter dark:text-white">Tien's<span class="text-brand-primary font-black"> Catering</span></span>
			</a>
			<h1 class="text-2xl font-black text-brand-charcoal dark:text-white">Bergabung dengan Kami</h1>
			<p class="text-zinc-500 text-sm mt-2">Daftar sekarang untuk menikmati sajian katering harian.</p>
		</div>

		<!-- Registration Card -->
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 p-10 overflow-hidden relative">
			
			<form class="space-y-6" onsubmit={handleRegister}>
				<!-- Progress Label -->
				<div class="flex items-center gap-4 mb-4">
					<span class="text-[10px] font-black text-brand-primary uppercase tracking-widest px-3 py-1 bg-brand-primary/10 rounded-full">Akun Personal</span>
					<div class="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
				</div>

				<div class="space-y-4">
					<div>
						<label for="reg-name" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
						<div class="relative">
							<input 
								id="reg-name"
								type="text" 
								name="name" 
								bind:value={name}
								required 
								placeholder="E.g. Andi Pratama"
								class="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
							/>
							<svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
					</div>

					<div>
						<label for="reg-phone" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Nomor Telepon</label>
						<div class="relative">
							<input 
								id="reg-phone"
								type="text" 
								name="phone" 
								bind:value={phone}
								required 
								placeholder="0812xxxxxx"
								class="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
							/>
							<svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
						</div>
					</div>

					<div>
						<label for="reg-password" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Kata Sandi</label>
						<div class="relative">
							<input 
								id="reg-password"
								type="password" 
								name="password" 
								bind:value={password}
								required 
								placeholder="••••••••"
								class="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
							/>
							<svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
					</div>
				</div>

				<button 
					disabled={loading}
					class="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
				>
					{#if loading}
						<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Mendaftarkan...
					{:else}
						Buat Akun Saya
					{/if}
				</button>
			</form>

			<div class="mt-8 pt-8 border-t border-zinc-50 dark:border-zinc-800 text-center">
				<p class="text-sm text-zinc-500">Sudah punya akun? <a href="/login" class="text-brand-primary font-black hover:underline">Masuk</a></p>
			</div>

            <!-- B2B Note -->
            <div class="mt-10 p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Mewakili Instansi/Dinas?</p>
                <p class="text-[11px] text-zinc-500 leading-relaxed font-medium">Bagi instansi pemerintah atau korporat, akun akan dibuatkan secara manual oleh CS setelah diskusi via <a href="https://wa.me/xxx" class="text-brand-primary font-black">WhatsApp</a>.</p>
            </div>
		</div>
	</div>
</div>

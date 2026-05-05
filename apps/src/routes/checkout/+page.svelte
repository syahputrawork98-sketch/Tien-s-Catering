<script lang="ts">
	import { cart } from '$lib/stores/cartStore.svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';

	function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

	let loading = $state(false);
	
	// Form State
	let customerName = $state('');
	let whatsapp = $state('');
	let address = $state('');
	let deliveryDate = $state('');
	let notes = $state('');

	function handleCheckout(e: SubmitEvent) {
		e.preventDefault();
		if (cart.items.length === 0) return;
		
		loading = true;
		
		// Simulate API Call
		setTimeout(() => {
			loading = false;
			const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
			// Save simple order summary to session for success page
			sessionStorage.setItem('lastOrder', JSON.stringify({
				id: orderId,
				name: customerName,
				total: cart.totalPrice * 1.11
			}));
			
			cart.clear();
			goto('/order-success');
		}, 1500);
	}
</script>

<svelte:head>
	<title>Checkout | Tien's Catering</title>
</svelte:head>

<div class="px-6 py-12 max-w-6xl mx-auto min-h-screen">
	<div class="mb-12">
		<a href="/" class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">← Kembali Belanja</a>
		<h1 class="text-4xl font-black text-brand-charcoal tracking-tight mt-2">Finalisasi Pesanan</h1>
		<p class="text-zinc-500 font-medium mt-1">Lengkapi detail pengiriman untuk hidangan katering Anda.</p>
	</div>

	{#if cart.items.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm" in:fade>
			<div class="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6">
				<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
				</svg>
			</div>
			<h2 class="text-2xl font-black text-brand-charcoal">Keranjang Anda Kosong</h2>
			<p class="text-zinc-400 mt-2 mb-8">Anda belum menambahkan menu apapun ke dalam keranjang.</p>
			<a href="/" class="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-primary/20">Mulai Belanja</a>
		</div>
	{:else}
		<div class="grid lg:grid-cols-3 gap-12" in:fade>
			<!-- Form Content -->
			<div class="lg:col-span-2 space-y-10">
				<!-- Delivery Form -->
				<section class="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-10">
					<h2 class="text-xl font-black text-brand-charcoal mb-8 flex items-center gap-3">
						<span class="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center text-sm">1</span>
						Informasi Pengiriman
					</h2>
					
					<form id="checkout-form" onsubmit={handleCheckout} class="grid md:grid-cols-2 gap-6">
						<div class="md:col-span-2">
							<label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Nama Penerima</label>
							<input type="text" bind:value={customerName} required placeholder="Nama Lengkap" class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal" />
						</div>

						<div>
							<label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Nomor WhatsApp</label>
							<input type="tel" bind:value={whatsapp} required placeholder="0812xxxxxx" class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal" />
						</div>

						<div>
							<label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Tanggal Pengiriman</label>
							<input type="date" bind:value={deliveryDate} required class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal" />
						</div>

						<div class="md:col-span-2">
							<label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Alamat Lengkap</label>
							<textarea bind:value={address} required rows="3" placeholder="Nama Jalan, Gedung, Lantai, No. Rumah..." class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal resize-none"></textarea>
						</div>

						<div class="md:col-span-2">
							<label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Catatan Tambahan (Opsional)</label>
							<input type="text" bind:value={notes} placeholder="Contoh: Sambal dipisah, No MSG..." class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal" />
						</div>
					</form>
				</section>

				<!-- Order Review -->
				<section class="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
					<div class="p-10 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
						<h2 class="text-xl font-black text-brand-charcoal flex items-center gap-3">
							<span class="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center text-sm">2</span>
							Ringkasan Menu
						</h2>
						<span class="bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{cart.totalItems} Items</span>
					</div>
					<div class="p-10 space-y-6">
						{#each cart.items as item}
							<div class="flex items-center justify-between group">
								<div class="flex items-center gap-6">
									<div class="w-20 h-20 bg-zinc-100 rounded-2xl overflow-hidden shadow-inner flex-none">
										<img src={item.image} alt={item.name} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
									</div>
									<div>
										<h3 class="font-black text-brand-charcoal text-lg">{item.name}</h3>
										<p class="text-zinc-400 text-sm font-medium">{item.quantity} porsi x {formatPrice(item.price)}</p>
										<span class="inline-block mt-2 px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-bold uppercase rounded-md tracking-wider">Kirim: {item.deliveryDate}</span>
									</div>
								</div>
								<div class="text-right">
									<p class="font-black text-brand-charcoal text-lg italic">{formatPrice(item.price * item.quantity)}</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			</div>

			<!-- Payment Summary -->
			<div class="lg:col-span-1">
				<div class="bg-brand-charcoal rounded-[3rem] p-10 text-white sticky top-10 shadow-2xl shadow-brand-charcoal/40">
					<h2 class="text-2xl font-black mb-10 uppercase tracking-tighter italic">Billing Info</h2>
					
					<div class="space-y-6 mb-10">
						<div class="flex justify-between items-center text-zinc-400 text-sm font-medium">
							<span>Subtotal</span>
							<span class="text-white font-bold">{formatPrice(cart.totalPrice)}</span>
						</div>
						<div class="flex justify-between items-center text-zinc-400 text-sm font-medium">
							<span>Biaya Pengantaran</span>
							<span class="text-green-400 font-bold uppercase text-[10px] tracking-widest">Gratis</span>
						</div>
						<div class="flex justify-between items-center text-zinc-400 text-sm font-medium">
							<span>PPN (11%)</span>
							<span class="text-white font-bold">{formatPrice(cart.totalPrice * 0.11)}</span>
						</div>
						
						<div class="pt-8 border-t border-white/10 flex flex-col gap-2">
							<span class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Total Pembayaran</span>
							<span class="text-4xl font-black text-brand-primary italic">{formatPrice(cart.totalPrice * 1.11)}</span>
						</div>
					</div>

					<button 
						form="checkout-form"
						type="submit"
						disabled={loading}
						class="w-full bg-brand-primary text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
					>
						{#if loading}
							<svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Menghitung...
						{:else}
							Konfirmasi & Pesan Sekarang
						{/if}
					</button>

					<div class="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
						<p class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
							Pesanan Anda akan langsung diteruskan ke tim kurasi dapur kami setelah konfirmasi.
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>

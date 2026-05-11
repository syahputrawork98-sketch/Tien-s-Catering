<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { cart, type CartItem } from '$lib/stores/cartStore.svelte';
	import { fade } from 'svelte/transition';

	type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'cod';

	type CheckoutOrderResponse = {
		order?: {
			id?: string;
			orderNumber?: string;
			customerName?: string;
			paymentStatus?: string;
			status?: string;
			total?: number;
			[key: string]: unknown;
		};
		message?: string;
	};

	function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

	let loading = $state(false);
	let stockValidationError = $state('');
	let apiError = $state('');

	// Form State
	let customerName = $state('');
	let whatsapp = $state('');
	let departmentOrUnit = $state('');
	let floor = $state('');
	let locationNote = $state('');
	let deliveryDate = $state('');
	let notes = $state('');
	let paymentMethod = $state<PaymentMethod>('cash');

	type StockIssue = {
		id: string;
		name: string;
		deliveryDate: string;
		quantity: number;
		availableStock: number;
	};

	function getStockLimit(item: Pick<CartItem, 'availableStock'>) {
		const parsed = Number(item.availableStock);
		if (!Number.isFinite(parsed)) return undefined;
		return Math.max(0, Math.floor(parsed));
	}

	function getStockIssues(items: CartItem[]): StockIssue[] {
		return items
			.map((item) => {
				const stockLimit = getStockLimit(item);
				if (stockLimit === undefined || item.quantity <= stockLimit) return null;

				return {
					id: item.id,
					name: item.name,
					deliveryDate: item.deliveryDate,
					quantity: item.quantity,
					availableStock: stockLimit
				} satisfies StockIssue;
			})
			.filter((issue): issue is StockIssue => issue !== null);
	}

	function getStockIssueMessage(issues: StockIssue[]) {
		if (issues.length === 0) return '';
		if (issues.length === 1) {
			const issue = issues[0];
			return `Stok menu "${issue.name}" tidak cukup. Maksimal ${issue.availableStock} porsi untuk tanggal ${issue.deliveryDate}.`;
		}

		return `Ada ${issues.length} item yang melebihi stok. Silakan sesuaikan jumlah porsi sebelum checkout.`;
	}

	function getItemStockWarning(item: CartItem) {
		const stockLimit = getStockLimit(item);
		if (stockLimit === undefined) return '';
		if (item.quantity > stockLimit) {
			return `Melebihi stok. Maksimal ${stockLimit} porsi.`;
		}
		if (item.quantity === stockLimit) {
			return `Mencapai batas stok: ${stockLimit} porsi.`;
		}
		return '';
	}

	function buildAddressSummary(
		rawDepartmentOrUnit: string,
		rawFloor: string,
		rawLocationNote: string
	) {
		const parts = [rawDepartmentOrUnit.trim(), rawFloor.trim(), rawLocationNote.trim()].filter(
			(part) => part.length > 0
		);
		return parts.join(' - ');
	}

	const stockIssues = $derived(getStockIssues(cart.items));
	const hasStockIssue = $derived(stockIssues.length > 0);
	const unknownStockCount = $derived(
		cart.items.reduce((total, item) => total + (getStockLimit(item) === undefined ? 1 : 0), 0)
	);

	$effect(() => {
		if (hasStockIssue) return;
		if (!stockValidationError) return;

		stockValidationError = '';
	});

	async function handleCheckout(e: SubmitEvent) {
		e.preventDefault();
		if (cart.items.length === 0) return;

		const issues = getStockIssues(cart.items);
		if (issues.length > 0) {
			stockValidationError = getStockIssueMessage(issues);
			return;
		}

		stockValidationError = '';
		apiError = '';
		loading = true;

		const normalizedDepartmentOrUnit = departmentOrUnit.trim();
		const normalizedFloor = floor.trim();
		const normalizedLocationNote = locationNote.trim();
		const addressSummary = buildAddressSummary(
			normalizedDepartmentOrUnit,
			normalizedFloor,
			normalizedLocationNote
		);

		const payload = {
			customerName: customerName.trim(),
			whatsapp: whatsapp.trim(),
			deliveryDate,
			notes: notes.trim(),
			deliveryInfo: {
				departmentOrUnit: normalizedDepartmentOrUnit || null,
				floor: normalizedFloor || null,
				locationNote: normalizedLocationNote || null,
				addressSummary: addressSummary || null
			},
			paymentMethod,
			items: cart.items.map((item) => ({
				menuId: item.id,
				name: item.name,
				quantity: item.quantity,
				price: item.price
			})),
			totals: {
				subtotal: cart.totalPrice,
				taxAmount: 0,
				deliveryFee: 0,
				total: cart.totalPrice
			},
			devPersonaCode: 'USER'
		};

		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const responseBody = (await response.json().catch(() => null)) as CheckoutOrderResponse | null;

			if (!response.ok) {
				apiError =
					typeof responseBody?.message === 'string' && responseBody.message.trim().length > 0
						? responseBody.message
						: 'Checkout gagal. Silakan coba lagi.';
				return;
			}

			if (!responseBody?.order || typeof responseBody.order !== 'object') {
				apiError = 'Response order dari server tidak valid.';
				return;
			}

			if (browser) {
				sessionStorage.setItem('lastOrder', JSON.stringify(responseBody.order));
			}

			cart.clear();
			await goto('/order-success');
		} catch {
			apiError = 'Gagal terhubung ke server. Periksa koneksi lalu coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Checkout | Tien's Catering</title>
</svelte:head>

<div class="px-6 py-12 max-w-6xl mx-auto min-h-screen">
	<div class="mb-12">
		<a
			href="/"
			class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-brand-primary transition-colors"
			>Kembali Belanja</a
		>
		<h1 class="text-4xl font-black text-brand-charcoal tracking-tight mt-2">Finalisasi Pesanan</h1>
		<p class="text-zinc-500 font-medium mt-1">Lengkapi detail pengiriman untuk hidangan katering Anda.</p>
	</div>

	{#if cart.items.length === 0}
		<div
			class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm"
			in:fade
		>
			<div class="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6">
				<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
					/>
				</svg>
			</div>
			<h2 class="text-2xl font-black text-brand-charcoal">Keranjang Anda Kosong</h2>
			<p class="text-zinc-400 mt-2 mb-8">Anda belum menambahkan menu apapun ke dalam keranjang.</p>
			<a
				href="/"
				class="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-primary/20"
				>Mulai Belanja</a
			>
		</div>
	{:else}
		<div class="grid lg:grid-cols-3 gap-12" in:fade>
			<div class="lg:col-span-2 space-y-10">
				<section class="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-10">
					<h2 class="text-xl font-black text-brand-charcoal mb-8 flex items-center gap-3">
						<span
							class="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center text-sm"
							>1</span
						>
						Informasi Pengiriman
					</h2>

					<form id="checkout-form" onsubmit={handleCheckout} class="grid md:grid-cols-2 gap-6">
						<div class="md:col-span-2">
							<label
								for="checkout-customer-name"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Nama Penerima</label
							>
							<input
								id="checkout-customer-name"
								type="text"
								bind:value={customerName}
								required
								placeholder="Nama Lengkap"
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>

						<div>
							<label
								for="checkout-whatsapp"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Nomor WhatsApp</label
							>
							<input
								id="checkout-whatsapp"
								type="tel"
								bind:value={whatsapp}
								required
								placeholder="0812xxxxxx"
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>

						<div>
							<label
								for="checkout-delivery-date"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Tanggal Pengiriman</label
							>
							<input
								id="checkout-delivery-date"
								type="date"
								bind:value={deliveryDate}
								required
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>

						<div class="md:col-span-2">
							<label
								for="checkout-department-or-unit"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Bidang / Dinas / Bagian</label
							>
							<input
								id="checkout-department-or-unit"
								type="text"
								bind:value={departmentOrUnit}
								required
								placeholder="Contoh: Dinas Kominfo"
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>

						<div>
							<label
								for="checkout-floor"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Lantai</label
							>
							<input
								id="checkout-floor"
								type="text"
								bind:value={floor}
								required
								placeholder="Contoh: 2"
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>

						<div>
							<label
								for="checkout-location-note"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Catatan Lokasi</label
							>
							<input
								id="checkout-location-note"
								type="text"
								bind:value={locationNote}
								placeholder="Contoh: Ruang rapat utama"
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>

						<div>
							<label
								for="checkout-payment-method"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Metode Pembayaran (Simulasi)</label
							>
							<select
								id="checkout-payment-method"
								bind:value={paymentMethod}
								required
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							>
								<option value="cash">Cash (Simulation)</option>
								<option value="transfer">Transfer (Simulation)</option>
								<option value="qris">QRIS (Simulation)</option>
								<option value="cod">COD (Simulation)</option>
							</select>
							<p class="text-[9px] font-bold text-zinc-400 mt-2 ml-1 italic">
								* Tidak ada integrasi payment gateway pada versi demo ini.
							</p>
						</div>

						<div>
							<label
								for="checkout-notes"
								class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1"
								>Catatan Tambahan (Opsional)</label
							>
							<input
								id="checkout-notes"
								type="text"
								bind:value={notes}
								placeholder="Contoh: Sambal dipisah, No MSG"
								class="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal"
							/>
						</div>
					</form>
				</section>

				<section class="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
					<div class="p-10 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
						<h2 class="text-xl font-black text-brand-charcoal flex items-center gap-3">
							<span
								class="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center text-sm"
								>2</span
							>
							Ringkasan Menu
						</h2>
						<span
							class="bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
							>{cart.totalItems} Items</span
						>
					</div>
					<div class="p-10 space-y-6">
						{#each cart.items as item}
							<div class="flex items-center justify-between group">
								<div class="flex items-center gap-6">
									<div class="w-20 h-20 bg-zinc-100 rounded-2xl overflow-hidden shadow-inner flex-none">
										<img
											src={item.image}
											alt={item.name}
											class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
										/>
									</div>
									<div>
										<h3 class="font-black text-brand-charcoal text-lg">{item.name}</h3>
										<p class="text-zinc-400 text-sm font-medium">
											{item.quantity} porsi x {formatPrice(item.price)}
										</p>
										<span
											class="inline-block mt-2 px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-bold uppercase rounded-md tracking-wider"
											>Kirim: {item.deliveryDate}</span
										>
										{#if getItemStockWarning(item)}
											<p class="mt-2 text-[10px] font-bold text-orange-500">
												{getItemStockWarning(item)}
											</p>
										{/if}
									</div>
								</div>
								<div class="text-right">
									<p class="font-black text-brand-charcoal text-lg italic">
										{formatPrice(item.price * item.quantity)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			</div>

			<div class="lg:col-span-1">
				<div class="bg-brand-charcoal rounded-[3rem] p-10 text-white sticky top-10 shadow-2xl shadow-brand-charcoal/40">
					<div class="flex justify-between items-start mb-10">
						<h2 class="text-2xl font-black uppercase tracking-tighter italic">Billing Info</h2>
						<span class="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black text-brand-primary uppercase tracking-widest border border-white/5">Local Demo</span>
					</div>

					<div class="space-y-6 mb-10">
						<div class="flex justify-between items-center text-zinc-400 text-sm font-medium">
							<span>Subtotal</span>
							<span class="text-white font-bold">{formatPrice(cart.totalPrice)}</span>
						</div>
						<div class="flex justify-between items-center text-zinc-400 text-sm font-medium">
							<span>Biaya Pengantaran</span>
							<span class="text-white font-bold">{formatPrice(0)}</span>
						</div>
						<div class="flex justify-between items-center text-zinc-400 text-sm font-medium">
							<span>Pajak</span>
							<span class="text-white font-bold">{formatPrice(0)}</span>
						</div>

						<div class="pt-8 border-t border-white/10 flex flex-col gap-2">
							<span class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]"
								>Total Pembayaran</span
							>
							<span class="text-4xl font-black text-brand-primary italic">{formatPrice(cart.totalPrice)}</span>
						</div>
					</div>

					{#if stockValidationError || hasStockIssue}
						<div class="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
							<p class="text-[11px] text-orange-300 font-bold leading-relaxed">
								{stockValidationError ||
									'Stok beberapa item tidak mencukupi. Kurangi jumlah porsi terlebih dahulu.'}
							</p>
							{#if hasStockIssue}
								<div class="mt-3 space-y-1">
									{#each stockIssues as issue}
										<p class="text-[10px] text-orange-200 font-semibold">
											{issue.name}: {issue.quantity} porsi, maksimal {issue.availableStock}
										</p>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					{#if apiError}
						<div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
							<p class="text-[11px] text-red-200 font-bold leading-relaxed">{apiError}</p>
						</div>
					{/if}

					{#if unknownStockCount > 0}
						<div class="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
							<p class="text-[10px] text-zinc-300 font-semibold leading-relaxed">
								{unknownStockCount} item di keranjang belum memiliki info stok tersimpan (cart lama).
								Checkout tetap diizinkan pada fase UI-only.
							</p>
						</div>
					{/if}

					<button
						form="checkout-form"
						type="submit"
						disabled={loading || hasStockIssue}
						class="w-full bg-brand-primary text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
					>
						{#if loading}
							<svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Memproses...
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

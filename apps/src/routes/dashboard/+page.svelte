<script lang="ts">
	import { mockSession } from '$lib/stores/mockSession.svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	// Types minimal for dashboard summary
	type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
	type PaymentStatus = 'unpaid' | 'waiting_verification' | 'paid' | 'cod_pending';
	
	interface DashboardOrder {
		id: string;
		orderNumber: string;
		status: OrderStatus;
		paymentStatus: PaymentStatus;
		total: number;
		menuName: string;
		createdAt: string;
	}

	interface DashboardPackageRequest {
		id: string;
		status: string;
		packageName: string;
		createdAt: string;
	}

	let loading = $state(true);
	let error = $state('');
	let orders = $state<DashboardOrder[]>([]);
	let requests = $state<DashboardPackageRequest[]>([]);

	// Mapping helpers
	function mapStatus(status: string): OrderStatus {
		const s = status.toLowerCase();
		if (s === 'new' || s === 'confirmed') return 'PENDING';
		if (s === 'processing' || s === 'ready') return 'PROCESSING';
		if (s === 'delivered') return 'SHIPPED';
		if (s === 'completed') return 'COMPLETED';
		if (s === 'cancelled') return 'CANCELLED';
		return 'PENDING';
	}

	function mapPaymentStatus(status: string): PaymentStatus {
		const s = status.toLowerCase();
		if (s === 'unpaid') return 'unpaid';
		if (s === 'waiting_verification') return 'waiting_verification';
		if (s === 'paid') return 'paid';
		if (s === 'cod') return 'cod_pending';
		return 'unpaid';
	}

	function extractMenuName(items: any[]): string {
		if (!items || !items.length) return 'Pesanan Catering';
		if (items.length === 1) return items[0].name;
		return `${items[0].name} +${items.length - 1} item`;
	}

	async function fetchData() {
		loading = true;
		error = '';
		try {
			const [ordersRes, requestsRes] = await Promise.all([
				fetch('/api/orders'),
				fetch('/api/package-requests')
			]);

			if (!ordersRes.ok || !requestsRes.ok) {
				throw new Error('Gagal menyinkronkan data dashboard.');
			}

			const ordersData = await ordersRes.json();
			const requestsData = await requestsRes.json();

			if (Array.isArray(ordersData.items)) {
				orders = ordersData.items.map((apiOrder: any) => ({
					id: apiOrder.id,
					orderNumber: apiOrder.orderNumber,
					status: mapStatus(apiOrder.status),
					paymentStatus: mapPaymentStatus(apiOrder.paymentStatus),
					total: apiOrder.total,
					menuName: extractMenuName(apiOrder.items),
					createdAt: apiOrder.createdAt || apiOrder.orderDate
				}));
			}

			if (Array.isArray(requestsData.items)) {
				requests = requestsData.items.map((apiReq: any) => ({
					id: apiReq.id,
					status: apiReq.status,
					packageName: apiReq.packageName,
					createdAt: apiReq.createdAt
				}));
			}
		} catch (e: any) {
			error = e.message || 'Terjadi kesalahan koneksi.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchData();
	});

	// Derived summaries
	const orderStats = $derived({
		total: orders.length,
		active: orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length,
		completed: orders.filter(o => o.status === 'COMPLETED').length,
		unpaid: orders.filter(o => o.paymentStatus === 'unpaid').length
	});

	const requestStats = $derived({
		total: requests.length,
		new: requests.filter(r => r.status === 'new').length,
		reviewing: requests.filter(r => r.status === 'reviewing').length,
		quoted: requests.filter(r => r.status === 'quoted').length
	});

	const latestOrder = $derived(orders.length > 0 ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null);

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(value);
	}
</script>

<div class="space-y-12 pb-20">
	<header in:fly={{ y: -20, duration: 500 }}>
		<div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full mb-4">
			<span class="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
			<span class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic">Local Dashboard View</span>
		</div>
		<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">
			Halo, {mockSession.user.name.split(' ')[0]}! 👋
		</h1>
		<p class="text-zinc-500 font-medium mt-2 max-w-2xl">
			Selamat datang kembali di pusat kendali katering Anda. Pantau pesanan dan permintaan paket Anda secara real-time.
		</p>
	</header>

	{#if loading}
		<div class="grid md:grid-cols-3 gap-8" in:fade>
			{#each Array(3) as _}
				<div class="h-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 animate-pulse"></div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-[3rem] p-16 text-center shadow-sm" in:fade>
			<p class="text-sm font-bold text-red-600 dark:text-red-400 mb-6">{error}</p>
			<button
				type="button"
				onclick={fetchData}
				class="px-8 py-4 rounded-2xl bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl"
			>
				Coba Muat Ulang
			</button>
		</div>
	{:else}
		<div class="space-y-12" in:fade>
			<!-- Order Summary -->
			<div class="space-y-6">
				<div class="flex items-center justify-between px-2">
					<h2 class="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Ringkasan Pesanan</h2>
					<a href="/dashboard/orders" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Kelola Pesanan</a>
				</div>
				<div class="grid md:grid-cols-4 gap-6">
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-brand-primary/20 transition-all">
						<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Total Pesanan</p>
						<p class="text-4xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">{orderStats.total} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Items</span></p>
					</div>
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-blue-500/20 transition-all">
						<p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">Pesanan Aktif</p>
						<p class="text-4xl font-black text-blue-600 italic tracking-tighter">{orderStats.active} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Proses</span></p>
					</div>
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-emerald-500/20 transition-all">
						<p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3">Sudah Selesai</p>
						<p class="text-4xl font-black text-emerald-600 italic tracking-tighter">{orderStats.completed} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">History</span></p>
					</div>
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-amber-500/20 transition-all">
						<p class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3">Belum Bayar</p>
						<p class="text-4xl font-black text-amber-600 italic tracking-tighter">{orderStats.unpaid} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Unpaid</span></p>
					</div>
				</div>
			</div>

			<!-- Package Request Summary -->
			<div class="space-y-6">
				<div class="flex items-center justify-between px-2">
					<h2 class="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Ringkasan Request Paket</h2>
					<a href="/dashboard/package-requests" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Lihat Request</a>
				</div>
				<div class="grid md:grid-cols-4 gap-6">
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-zinc-300/50 transition-all">
						<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Total Request</p>
						<p class="text-4xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">{requestStats.total} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Paket</span></p>
					</div>
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-blue-500/20 transition-all">
						<p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">Menunggu Review</p>
						<p class="text-4xl font-black text-blue-600 italic tracking-tighter">{requestStats.new} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Baru</span></p>
					</div>
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-amber-500/20 transition-all">
						<p class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3">Sedang Ditinjau</p>
						<p class="text-4xl font-black text-amber-600 italic tracking-tighter">{requestStats.reviewing} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Review</span></p>
					</div>
					<div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-indigo-500/20 transition-all">
						<p class="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-3">Penawaran Final</p>
						<p class="text-4xl font-black text-indigo-600 italic tracking-tighter">{requestStats.quoted} <span class="text-[10px] not-italic text-zinc-300 font-bold uppercase ml-1">Ready</span></p>
					</div>
				</div>
			</div>

			<!-- Navigation Shortcuts -->
			<div class="grid md:grid-cols-4 gap-6">
				<a href="/dashboard/orders" class="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-700/50 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all group">
					<div class="text-xl mb-3">📦</div>
					<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Semua Pesanan</p>
				</a>
				<a href="/dashboard/package-requests" class="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-700/50 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all group">
					<div class="text-xl mb-3">🍱</div>
					<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Request Paket</p>
				</a>
				<a href="/dashboard/profile" class="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-700/50 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all group">
					<div class="text-xl mb-3">👤</div>
					<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Profil Saya</p>
				</a>
				<a href="/dashboard/addresses" class="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-700/50 hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all group">
					<div class="text-xl mb-3">📍</div>
					<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Daftar Alamat</p>
				</a>
			</div>

			<!-- Latest Order Section -->
			<section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
				<div class="p-10 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/20 dark:bg-zinc-800/10">
					<div>
						<h2 class="text-2xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Pesanan Terakhir</h2>
						<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Aktivitas Terbaru Anda</p>
					</div>
					<a href="/dashboard/orders" class="px-6 py-3 bg-brand-charcoal text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary transition-all">Lihat Riwayat Lengkap</a>
				</div>
				<div class="p-10">
					{#if latestOrder}
						<div class="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 group hover:border-brand-primary/30 transition-all">
							<div class="flex items-center gap-6">
								<div class="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center text-xl font-black italic">
									{latestOrder.orderNumber.substring(0, 2)}
								</div>
								<div class="space-y-1">
									<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">#{latestOrder.orderNumber}</p>
									<p class="text-xl font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors">{latestOrder.menuName}</p>
									<div class="flex items-center gap-3">
										<span class="text-[10px] font-bold text-zinc-500 uppercase">{latestOrder.status}</span>
										<span class="w-1 h-1 rounded-full bg-zinc-300"></span>
										<span class="text-[10px] font-bold text-zinc-400">{latestOrder.paymentStatus.replace('_', ' ')}</span>
									</div>
								</div>
							</div>
							<div class="text-center md:text-right">
								<p class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter mb-1">{formatCurrency(latestOrder.total)}</p>
								<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Order Dibuat: {new Date(latestOrder.createdAt).toLocaleDateString('id-ID')}</p>
							</div>
						</div>
					{:else}
						<div class="p-16 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem]">
							<div class="text-4xl mb-4 opacity-20 grayscale">🍱</div>
							<p class="text-sm font-bold text-zinc-400 uppercase tracking-widest italic">Belum ada aktivitas pesanan terbaru.</p>
							<a href="/katalog" class="inline-block mt-6 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Mulai Pesan Sekarang</a>
						</div>
					{/if}
				</div>
			</section>

			<div class="p-10 bg-brand-primary/5 rounded-[3rem] border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
				<div class="space-y-1 text-center md:text-left">
					<p class="text-xl font-black text-brand-charcoal dark:text-brand-primary tracking-tighter uppercase italic">Siap untuk hidangan spesial lainnya?</p>
					<p class="text-xs font-medium text-zinc-500 italic">Eksplorasi katalog kami dan buat momen Anda lebih berkesan.</p>
				</div>
				<a href="/katalog" class="px-10 py-5 bg-brand-charcoal text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-brand-primary transition-all">
					Lihat Katalog Paket
				</a>
			</div>

			<footer class="text-center space-y-4 pt-10 border-t border-zinc-50 dark:border-zinc-800">
				<div class="inline-flex flex-col items-center gap-3 px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-700 shadow-inner">
					<div class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
						<p class="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest italic">Local SQLite Database Simulation Aktif</p>
					</div>
					<p class="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter italic max-w-lg">
						Demo Mode: Pengelolaan Profil & Alamat menggunakan local state. Fitur Pembayaran Otomatis, Invoice Riil, dan Export Laporan saat ini berstatus <span class="text-brand-primary">HOLD (Production Ready Phase)</span>.
					</p>
				</div>
			</footer>
		</div>
	{/if}
</div>

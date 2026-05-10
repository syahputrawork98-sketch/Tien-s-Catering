<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';

	type TabType = 'ALL' | 'NEW' | 'PROCESS' | 'DONE' | 'CANCELLED';

	type AdminOrderItem = {
		id: string;
		menuId: string | null;
		name: string;
		quantity: number;
		price: number;
		subtotal: number;
	};

	type AdminOrder = {
		id: string;
		orderNumber: string;
		customerName: string;
		whatsapp: string;
		orderDate: string;
		deliveryDate: string;
		status: string;
		paymentMethod: string;
		paymentStatus: string;
		total: number;
		notes: string;
		deliveryInfo: {
			departmentOrUnit: string | null;
			floor: string | null;
			locationNote: string | null;
			addressSummary: string | null;
		};
		items: AdminOrderItem[];
	};

	type OrdersApiResponse = {
		items?: unknown;
		message?: string;
	};

	let loading = $state(true);
	let error = $state('');
	let orders = $state<AdminOrder[]>([]);
	let activeTab = $state<TabType>('ALL');
	let showDetailModal = $state(false);
	let selectedOrder = $state<AdminOrder | null>(null);

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null;
	}

	function getString(value: unknown, fallback = ''): string {
		if (typeof value !== 'string') return fallback;
		const normalized = value.trim();
		return normalized.length > 0 ? normalized : fallback;
	}

	function getNumber(value: unknown, fallback = 0): number {
		const parsed = Number(value);
		if (!Number.isFinite(parsed) || parsed < 0) return fallback;
		return parsed;
	}

	function getDeliveryLabel(order: AdminOrder): string {
		const summary = getString(order.deliveryInfo.addressSummary);
		if (summary) return summary;

		const parts = [
			getString(order.deliveryInfo.departmentOrUnit),
			getString(order.deliveryInfo.floor),
			getString(order.deliveryInfo.locationNote)
		].filter((part) => part.length > 0);

		return parts.join(' - ') || '-';
	}

	function normalizeOrder(raw: unknown): AdminOrder | null {
		if (!isRecord(raw)) return null;

		const id = getString(raw.id);
		const orderNumber = getString(raw.orderNumber, id || '-');
		const customerName = getString(raw.customerName, '-');
		const whatsapp = getString(raw.whatsapp, '-');
		const orderDate = getString(raw.orderDate, '-');
		const deliveryDate = getString(raw.deliveryDate, '-');
		const status = getString(raw.status, 'new').toLowerCase();
		const paymentObject = isRecord(raw.payment) ? raw.payment : null;
		const paymentMethod = getString(raw.paymentMethod, getString(paymentObject?.method, '-')).toLowerCase();
		const paymentStatus = getString(raw.paymentStatus, getString(paymentObject?.status, 'unpaid')).toLowerCase();
		const total = getNumber(raw.total);
		const notes = getString(raw.notes);
		const deliveryInfoRaw = isRecord(raw.deliveryInfo) ? raw.deliveryInfo : {};
		const itemsRaw = Array.isArray(raw.items) ? raw.items : [];

		const items: AdminOrderItem[] = itemsRaw
			.map((item) => {
				if (!isRecord(item)) return null;

				return {
					id: getString(item.id, crypto.randomUUID()),
					menuId: getString(item.menuId) || null,
					name: getString(item.name, 'Menu'),
					quantity: Math.max(0, Math.floor(getNumber(item.quantity, 0))),
					price: getNumber(item.price, 0),
					subtotal: getNumber(item.subtotal, 0)
				} satisfies AdminOrderItem;
			})
			.filter((item): item is AdminOrderItem => item !== null);

		if (!id) return null;

		return {
			id,
			orderNumber,
			customerName,
			whatsapp,
			orderDate,
			deliveryDate,
			status,
			paymentMethod,
			paymentStatus,
			total,
			notes,
			deliveryInfo: {
				departmentOrUnit: getString(deliveryInfoRaw.departmentOrUnit) || null,
				floor: getString(deliveryInfoRaw.floor) || null,
				locationNote: getString(deliveryInfoRaw.locationNote) || null,
				addressSummary: getString(deliveryInfoRaw.addressSummary) || null
			},
			items
		};
	}

	function isDoneStatus(status: string): boolean {
		return ['completed', 'done', 'finished'].includes(status);
	}

	function isCancelledStatus(status: string): boolean {
		return status === 'cancelled';
	}

	function isNewStatus(status: string): boolean {
		return status === 'new';
	}

	const filteredOrders = $derived(() => {
		switch (activeTab) {
			case 'NEW':
				return orders.filter((order) => isNewStatus(order.status));
			case 'PROCESS':
				return orders.filter(
					(order) =>
						!isNewStatus(order.status) &&
						!isDoneStatus(order.status) &&
						!isCancelledStatus(order.status)
				);
			case 'DONE':
				return orders.filter((order) => isDoneStatus(order.status));
			case 'CANCELLED':
				return orders.filter((order) => isCancelledStatus(order.status));
			default:
				return orders;
		}
	});

	const stats = $derived(() => ({
		total: orders.length,
		new: orders.filter((order) => isNewStatus(order.status)).length,
		process: orders.filter(
			(order) =>
				!isNewStatus(order.status) &&
				!isDoneStatus(order.status) &&
				!isCancelledStatus(order.status)
		).length,
		done: orders.filter((order) => isDoneStatus(order.status)).length,
		cancelled: orders.filter((order) => isCancelledStatus(order.status)).length
	}));

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatDate(dateValue: string): string {
		const safeDate = getString(dateValue);
		if (!safeDate) return '-';

		const date = new Date(safeDate);
		if (!Number.isNaN(date.getTime())) {
			return new Intl.DateTimeFormat('id-ID', {
				day: '2-digit',
				month: 'short',
				year: 'numeric'
			}).format(date);
		}

		return safeDate;
	}

	function statusLabel(status: string): string {
		const map: Record<string, string> = {
			new: 'Pesanan Baru',
			confirmed: 'Dikonfirmasi',
			processing: 'Diproses',
			ready: 'Siap Antar',
			delivered: 'Dalam Pengantaran',
			completed: 'Selesai',
			cancelled: 'Dibatalkan'
		};

		return map[status] ?? status.toUpperCase();
	}

	function statusColor(status: string): string {
		const map: Record<string, string> = {
			new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
			confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
			processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
			ready: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
			delivered: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
			completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
			cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
		};

		return map[status] ?? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';
	}

	function paymentLabel(status: string): string {
		const map: Record<string, string> = {
			unpaid: 'Belum Dibayar',
			waiting_verification: 'Menunggu Verifikasi',
			paid: 'Sudah Dibayar',
			cod: 'COD'
		};

		return map[status] ?? status.toUpperCase();
	}

	function paymentColor(status: string): string {
		const map: Record<string, string> = {
			unpaid: 'text-red-500',
			waiting_verification: 'text-amber-600',
			paid: 'text-emerald-600',
			cod: 'text-sky-600'
		};

		return map[status] ?? 'text-zinc-500';
	}

	async function loadOrders() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/orders');
			const body = (await response.json().catch(() => null)) as OrdersApiResponse | null;

			if (!response.ok) {
				error =
					typeof body?.message === 'string' && body.message.trim().length > 0
						? body.message
						: 'Gagal memuat daftar order.';
				orders = [];
				return;
			}

			if (!Array.isArray(body?.items)) {
				error = 'Response order tidak valid.';
				orders = [];
				return;
			}

			orders = body.items
				.map((item) => normalizeOrder(item))
				.filter((item): item is AdminOrder => item !== null);
		} catch {
			error = 'Gagal terhubung ke server. Silakan coba lagi.';
			orders = [];
		} finally {
			loading = false;
		}
	}

	function openDetail(order: AdminOrder) {
		selectedOrder = order;
		showDetailModal = true;
	}

	onMount(() => {
		void loadOrders();
	});

	const tabs: { id: TabType; label: string; count: () => number }[] = [
		{ id: 'ALL', label: 'Semua', count: () => stats().total },
		{ id: 'NEW', label: 'Pesanan Baru', count: () => stats().new },
		{ id: 'PROCESS', label: 'Diproses', count: () => stats().process },
		{ id: 'DONE', label: 'Selesai', count: () => stats().done },
		{ id: 'CANCELLED', label: 'Dibatalkan', count: () => stats().cancelled }
	];
</script>

<div class="space-y-10 pb-24 relative">
	<header class="flex flex-col md:flex-row md:items-start justify-between gap-6" in:fly={{ y: -20, duration: 500 }}>
		<div>
			<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
				<span class="w-2 h-2 rounded-full bg-blue-500"></span>
				<span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Read Only Mode</span>
			</div>
			<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Manajemen Pesanan Admin</h1>
			<p class="text-zinc-500 font-medium mt-2">
				Data order dibaca dari database lokal. Aksi update status, verifikasi pembayaran, dan cancel masih Hold.
			</p>
		</div>
	</header>

	{#if loading}
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-10 shadow-sm" in:fade>
			<p class="text-sm font-bold text-zinc-500">Memuat order dari database...</p>
		</div>
	{:else if error}
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 p-10 shadow-sm" in:fade>
			<p class="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
			<button
				type="button"
				onclick={loadOrders}
				class="mt-6 px-6 py-3 rounded-xl bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
			>
				Coba Muat Ulang
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-2 lg:grid-cols-5 gap-4" in:fade={{ delay: 120 }}>
			{#each [
				{ label: 'Total Pesanan', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
				{ label: 'Pesanan Baru', value: stats().new, color: 'text-blue-600' },
				{ label: 'Diproses', value: stats().process, color: 'text-amber-600' },
				{ label: 'Selesai', value: stats().done, color: 'text-emerald-600' },
				{ label: 'Dibatalkan', value: stats().cancelled, color: 'text-red-500' }
			] as stat}
				<div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{stat.label}</p>
					<p class="text-3xl font-black {stat.color} italic">{stat.value}</p>
				</div>
			{/each}
		</div>

		<div class="space-y-8" in:fade={{ delay: 180 }}>
			<div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
				{#each tabs as tab}
					<button
						type="button"
						onclick={() => (activeTab = tab.id)}
						class="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
						{activeTab === tab.id
							? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105'
							: 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
					>
						{tab.label}
						{#if tab.count() > 0}
							<span class="px-2 py-0.5 rounded-md text-[9px] {activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">{tab.count()}</span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="space-y-4">
				{#each filteredOrders() as order (order.id)}
					<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8" in:scale={{ start: 0.98, duration: 260 }}>
						<div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
							<div class="flex-1 space-y-4">
								<div class="flex flex-wrap items-center gap-3">
									<span class="text-sm font-black text-brand-charcoal dark:text-white">{order.orderNumber}</span>
									<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {statusColor(order.status)}">{statusLabel(order.status)}</span>
									<span class="text-[10px] font-black uppercase {paymentColor(order.paymentStatus)}">{paymentLabel(order.paymentStatus)}</span>
									<span class="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Pembayaran: {order.paymentMethod || '-'}</span>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Customer</p>
										<p class="text-sm font-bold text-brand-charcoal dark:text-white">{order.customerName}</p>
										<p class="text-xs text-zinc-400">{order.whatsapp}</p>
									</div>
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Pesan</p>
										<p class="text-sm font-bold text-brand-charcoal dark:text-white">{formatDate(order.orderDate)}</p>
									</div>
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Antar</p>
										<p class="text-sm font-bold text-brand-charcoal dark:text-white">{formatDate(order.deliveryDate)}</p>
									</div>
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
										<p class="text-xl font-black text-brand-charcoal dark:text-white italic">{formatPrice(order.total)}</p>
									</div>
								</div>

								<div>
									<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lokasi Antar</p>
									<p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{getDeliveryLabel(order)}</p>
								</div>
							</div>

							<div class="flex flex-wrap lg:flex-col gap-3 lg:min-w-[220px]">
								<button
									type="button"
									onclick={() => openDetail(order)}
									class="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all"
								>
									Detail
								</button>
								<button
									type="button"
									disabled
									class="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-200 dark:border-amber-800 opacity-60 cursor-not-allowed"
								>
									Update Status (Hold)
								</button>
								<button
									type="button"
									disabled
									class="px-5 py-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-sky-200 dark:border-sky-800 opacity-60 cursor-not-allowed"
								>
									Verifikasi Payment (Hold)
								</button>
								<button
									type="button"
									disabled
									class="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-200 dark:border-red-800 opacity-60 cursor-not-allowed"
								>
									Batalkan (Hold)
								</button>
							</div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800" in:fade>
						<p class="text-2xl font-black text-zinc-300 dark:text-zinc-700">Belum ada order di database</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<Modal show={showDetailModal} title="Detail Pesanan" onClose={() => (showDetailModal = false)}>
	{#if selectedOrder}
		<div class="space-y-6">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Order Number</p>
					<p class="text-sm font-black text-brand-charcoal dark:text-white">{selectedOrder.orderNumber}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
					<span class="px-3 py-1 rounded-full text-[10px] font-black {statusColor(selectedOrder.status)}">{statusLabel(selectedOrder.status)}</span>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Customer</p>
					<p class="text-sm font-bold">{selectedOrder.customerName}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">WhatsApp</p>
					<p class="text-sm font-bold">{selectedOrder.whatsapp}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Pesan</p>
					<p class="text-sm font-bold">{formatDate(selectedOrder.orderDate)}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Antar</p>
					<p class="text-sm font-bold">{formatDate(selectedOrder.deliveryDate)}</p>
				</div>
				<div class="col-span-2">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lokasi Antar</p>
					<p class="text-sm font-bold">{getDeliveryLabel(selectedOrder)}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Metode Pembayaran</p>
					<p class="text-sm font-bold uppercase">{selectedOrder.paymentMethod || '-'}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status Pembayaran</p>
					<p class="text-sm font-bold {paymentColor(selectedOrder.paymentStatus)}">{paymentLabel(selectedOrder.paymentStatus)}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
					<p class="text-lg font-black text-brand-charcoal dark:text-white italic">{formatPrice(selectedOrder.total)}</p>
				</div>
			</div>

			<div>
				<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Item Pesanan</p>
				<div class="space-y-2">
					{#each selectedOrder.items as item}
						<div class="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
							<div>
								<p class="text-sm font-bold">{item.name}</p>
								<p class="text-[10px] text-zinc-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
							</div>
							<span class="text-sm font-black">{formatPrice(item.subtotal || item.price * item.quantity)}</span>
						</div>
					{:else}
						<div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
							<p class="text-sm text-zinc-500 font-semibold">Item tidak tersedia.</p>
						</div>
					{/each}
				</div>
			</div>

			{#if selectedOrder.notes}
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan</p>
					<p class="text-sm">{selectedOrder.notes}</p>
				</div>
			{/if}

			<div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
				<p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Aksi Admin</p>
				<p class="text-xs font-semibold text-zinc-500 mt-1">
					Update status, verifikasi pembayaran, dan pembatalan order masih Hold di Batch 5.
				</p>
			</div>
		</div>
	{/if}
</Modal>

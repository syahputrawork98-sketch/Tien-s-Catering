<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';

	type TabType = 'ALL' | 'NEW' | 'VERIFIKASI' | 'PROCESS' | 'DONE' | 'CANCELLED';
	type OrderStatus = 'new' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
	type PaymentStatus = 'unpaid' | 'waiting_verification' | 'paid' | 'cod_pending' | 'rejected';
	type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'cod' | 'unknown';
	type PaymentFilter = 'ALL' | PaymentStatus;
	type OrderStockStatus = 'not_deducted' | 'deducted' | 'released';

	type AdminOrderItem = {
		id: string;
		menuId: string | null;
		name: string;
		quantity: number;
		price: number;
		subtotal: number;
	};

	type AdminOrderPayment = {
		method: PaymentMethod;
		status: PaymentStatus;
		totalAmount: number;
		paidAmount: number;
		remainingAmount: number;
	};

	type AdminOrder = {
		id: string;
		orderNumber: string;
		customerName: string;
		whatsapp: string;
		orderDate: string;
		deliveryDate: string;
		status: OrderStatus;
		paymentMethod: PaymentMethod;
		paymentStatus: PaymentStatus;
		subtotal: number;
		taxAmount: number;
		deliveryFee: number;
		total: number;
		notes: string;
		devPersonaCode: string | null;
		stockStatus: OrderStockStatus;
		stockDeductedAt: string | null;
		stockReleasedAt: string | null;
		deliveryInfo: {
			departmentOrUnit: string | null;
			floor: string | null;
			locationNote: string | null;
			addressSummary: string | null;
		};
		payment: AdminOrderPayment;
		items: AdminOrderItem[];
		paymentProof: {
			id: string;
			fileName: string;
			filePath: string;
			status: string;
			uploadedAt: string;
			verificationNote: string | null;
			verifiedAt: string | null;
			verifiedBy: string | null;
		} | null;
		sourceType: string | null;
		sourceId: string | null;
	};

	type OrdersApiResponse = {
		items?: unknown;
		message?: string;
	};

	type OrderStatusApiResponse = {
		order?: {
			id?: unknown;
			orderNumber?: unknown;
			status?: unknown;
			updatedAt?: unknown;
			stockStatus?: unknown;
			stockUpdated?: unknown;
		};
		message?: string;
	};

	type OrderPaymentStatusApiResponse = {
		payment?: {
			orderId?: unknown;
			orderNumber?: unknown;
			paymentStatus?: unknown;
			paidAmount?: unknown;
			remainingAmount?: unknown;
		};
		message?: string;
	};

	let loading = $state(true);
	let error = $state('');
	let orders = $state<AdminOrder[]>([]);
	let activeTab = $state<TabType>('ALL');
	let showDetailModal = $state(false);
	let selectedOrder = $state<AdminOrder | null>(null);
	let statusUpdatingOrderId = $state<string | null>(null);
	let statusActionError = $state('');
	let statusActionSuccess = $state('');
	let paymentUpdatingOrderId = $state<string | null>(null);
	let paymentActionError = $state('');
	let paymentActionSuccess = $state('');
	let verificationNote = $state('');
	let isVerifying = $state(false);
	let paymentStatusDraftByOrderId = $state<Record<string, PaymentStatus>>({});
	let searchQuery = $state('');
	let paymentFilter = $state<PaymentFilter>('ALL');
	let orderStatusFilter = $state<string>('ALL');
	let isFilteredFromMonitor = $state(false);

	const orderStatusFlow: OrderStatus[] = ['new', 'confirmed', 'processing', 'ready', 'delivered', 'completed'];
	const manualPaymentStatuses: PaymentStatus[] = ['unpaid', 'waiting_verification', 'paid', 'cod_pending', 'rejected'];
	const allowedOrderStatuses: OrderStatus[] = [
		'new',
		'confirmed',
		'processing',
		'ready',
		'delivered',
		'completed',
		'cancelled'
	];
	const allowedPaymentMethods: PaymentMethod[] = ['cash', 'transfer', 'qris', 'cod', 'unknown'];

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

	function normalizeOrderStatus(value: string): OrderStatus {
		const normalized = value.toLowerCase();
		return allowedOrderStatuses.includes(normalized as OrderStatus) ? (normalized as OrderStatus) : 'new';
	}

	function normalizePaymentStatus(value: string): PaymentStatus {
		const normalized = value.toLowerCase();
		return manualPaymentStatuses.includes(normalized as PaymentStatus) ? (normalized as PaymentStatus) : 'unpaid';
	}

	function normalizePaymentMethod(value: string): PaymentMethod {
		const normalized = value.toLowerCase();
		return allowedPaymentMethods.includes(normalized as PaymentMethod)
			? (normalized as PaymentMethod)
			: 'unknown';
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
		const status = normalizeOrderStatus(getString(raw.status, 'new'));
		const paymentObject = isRecord(raw.payment) ? raw.payment : null;
		const paymentMethod = normalizePaymentMethod(
			getString(raw.paymentMethod, getString(paymentObject?.method, 'unknown'))
		);
		const paymentStatus = normalizePaymentStatus(
			getString(raw.paymentStatus, getString(paymentObject?.status, 'unpaid'))
		);
		const subtotal = getNumber(raw.subtotal);
		const taxAmount = getNumber(raw.taxAmount);
		const deliveryFee = getNumber(raw.deliveryFee);
		const total = getNumber(raw.total);
		const notes = getString(raw.notes);
		const devPersonaCode = getString(raw.devPersonaCode) || null;
		const stockStatus = normalizeStockStatus(getString(raw.stockStatus, 'not_deducted').toLowerCase());
		const stockDeductedAt = getString(raw.stockDeductedAt) || null;
		const stockReleasedAt = getString(raw.stockReleasedAt) || null;
		const deliveryInfoRaw = isRecord(raw.deliveryInfo) ? raw.deliveryInfo : {};
		const itemsRaw = Array.isArray(raw.items) ? raw.items : [];

		const items: AdminOrderItem[] = itemsRaw
			.map((item, index) => {
				if (!isRecord(item)) return null;

				return {
					id: getString(item.id, `${id}-item-${index + 1}`),
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
			subtotal,
			taxAmount,
			deliveryFee,
			total,
			notes,
			devPersonaCode,
			stockStatus,
			stockDeductedAt,
			stockReleasedAt,
			deliveryInfo: {
				departmentOrUnit: getString(deliveryInfoRaw.departmentOrUnit) || null,
				floor: getString(deliveryInfoRaw.floor) || null,
				locationNote: getString(deliveryInfoRaw.locationNote) || null,
				addressSummary: getString(deliveryInfoRaw.addressSummary) || null
			},
			payment: {
				method: normalizePaymentMethod(getString(paymentObject?.method, paymentMethod)),
				status: normalizePaymentStatus(getString(paymentObject?.status, paymentStatus)),
				totalAmount: getNumber(paymentObject?.totalAmount, total),
				paidAmount: getNumber(paymentObject?.paidAmount, 0),
				remainingAmount: getNumber(paymentObject?.remainingAmount, total)
			},
			items,
			paymentProof: isRecord(raw.paymentProof) ? {
				id: getString(raw.paymentProof.id),
				fileName: getString(raw.paymentProof.fileName),
				filePath: getString(raw.paymentProof.filePath),
				status: getString(raw.paymentProof.status),
				uploadedAt: getString(raw.paymentProof.uploadedAt),
				verificationNote: getString(raw.paymentProof.verificationNote) || null,
				verifiedAt: getString(raw.paymentProof.verifiedAt) || null,
				verifiedBy: getString(raw.paymentProof.verifiedBy) || null
			} : null,
			sourceType: getString(raw.sourceType) || 'catalog',
			sourceId: getString(raw.sourceId) || null
		};
	}

	function isDoneStatus(status: OrderStatus): boolean {
		return ['completed', 'done', 'finished'].includes(status);
	}

	function isCancelledStatus(status: OrderStatus): boolean {
		return status === 'cancelled';
	}

	function isNewStatus(status: OrderStatus): boolean {
		return status === 'new';
	}

	function matchesOrderKeyword(order: AdminOrder, normalizedKeyword: string): boolean {
		if (!normalizedKeyword) return true;

		const searchableValues = [
			order.orderNumber,
			order.customerName,
			order.whatsapp,
			order.notes,
			getDeliveryLabel(order),
			statusLabel(order.status),
			paymentLabel(order.paymentStatus)
		];

		return searchableValues.some((value) => value.toLowerCase().includes(normalizedKeyword));
	}

	const filteredOrders = $derived(() => {
		const normalizedKeyword = searchQuery.trim().toLowerCase();
		let tabbedOrders: AdminOrder[] = [];

		switch (activeTab) {
			case 'NEW':
				tabbedOrders = orders.filter((order) => isNewStatus(order.status));
				break;
			case 'VERIFIKASI':
				tabbedOrders = orders.filter((order) => order.paymentStatus === 'waiting_verification');
				break;
			case 'PROCESS':
				tabbedOrders = orders.filter(
					(order) =>
						!isNewStatus(order.status) &&
						!isDoneStatus(order.status) &&
						!isCancelledStatus(order.status)
				);
				break;
			case 'DONE':
				tabbedOrders = orders.filter((order) => isDoneStatus(order.status));
				break;
			case 'CANCELLED':
				tabbedOrders = orders.filter((order) => isCancelledStatus(order.status));
				break;
			default:
				tabbedOrders = orders;
		}

		return tabbedOrders.filter((order) => {
			const isPaymentMatch = paymentFilter === 'ALL' || order.paymentStatus === paymentFilter;
			if (!isPaymentMatch) return false;

			const isOrderStatusMatch = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
			if (!isOrderStatusMatch) return false;

			return matchesOrderKeyword(order, normalizedKeyword);
		});
	});

	const hasAnyOrders = $derived(orders.length > 0);
	const hasActiveListFilter = $derived(
		activeTab !== 'ALL' || paymentFilter !== 'ALL' || searchQuery.trim().length > 0
	);

	const stats = $derived(() => ({
		total: orders.length,
		new: orders.filter((order) => isNewStatus(order.status)).length,
		process: orders.filter(
			(order) =>
				!isNewStatus(order.status) &&
				!isDoneStatus(order.status) &&
				!isCancelledStatus(order.status)
		).length,
		verifikasi: orders.filter((order) => order.paymentStatus === 'waiting_verification').length,
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

	function statusLabel(status: OrderStatus): string {
		const map: Record<OrderStatus, string> = {
			new: 'Menunggu Konfirmasi',
			confirmed: 'Dikonfirmasi',
			processing: 'Diproses',
			ready: 'Siap Diantar',
			delivered: 'Dalam/Sudah Diantar',
			completed: 'Selesai',
			cancelled: 'Dibatalkan'
		};

		return map[status];
	}

	function getNextStatus(status: OrderStatus): OrderStatus | null {
		const index = orderStatusFlow.indexOf(status);
		if (index < 0 || index >= orderStatusFlow.length - 1) {
			return null;
		}

		return orderStatusFlow[index + 1];
	}

	function canSetCancelled(status: OrderStatus): boolean {
		return status !== 'completed' && status !== 'cancelled';
	}

	function statusColor(status: OrderStatus): string {
		const map: Record<OrderStatus, string> = {
			new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
			confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
			processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
			ready: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
			delivered: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
			completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
			cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
		};

		return map[status];
	}

	function paymentLabel(status: PaymentStatus): string {
		const map: Record<PaymentStatus, string> = {
			unpaid: 'Belum Bayar',
			waiting_verification: 'Menunggu Verifikasi',
			paid: 'Lunas',
			cod_pending: 'COD / Bayar di Tempat',
			rejected: 'Pembayaran Ditolak'
		};

		return map[status];
	}

	function paymentMethodLabel(value: PaymentMethod): string {
		const map: Record<PaymentMethod, string> = {
			cash: 'Cash',
			transfer: 'Transfer',
			qris: 'QRIS',
			cod: 'COD',
			unknown: 'Unknown'
		};

		return map[value];
	}

	function normalizeManualPaymentStatus(status: string): PaymentStatus {
		return normalizePaymentStatus(status);
	}

	function normalizeStockStatus(status: string): OrderStockStatus {
		if (status === 'deducted' || status === 'released') return status;
		return 'not_deducted';
	}

	function setPaymentStatusDraft(orderId: string, rawStatus: string) {
		paymentStatusDraftByOrderId = {
			...paymentStatusDraftByOrderId,
			[orderId]: normalizeManualPaymentStatus(rawStatus.toLowerCase())
		};
	}

	function hasPaymentStatusChanged(order: AdminOrder): boolean {
		const draftPaymentStatus =
			paymentStatusDraftByOrderId[order.id] ?? normalizeManualPaymentStatus(order.paymentStatus);
		return draftPaymentStatus !== order.paymentStatus;
	}

	function resetListFilters() {
		searchQuery = '';
		paymentFilter = 'ALL';
		orderStatusFilter = 'ALL';
		activeTab = 'ALL';
	}

	function paymentColor(status: PaymentStatus): string {
		const map: Record<PaymentStatus, string> = {
			unpaid: 'text-zinc-500',
			waiting_verification: 'text-amber-600',
			paid: 'text-emerald-600',
			cod_pending: 'text-sky-600',
			rejected: 'text-red-600'
		};

		return map[status];
	}

	function stockStatusLabel(status: OrderStockStatus): string {
		const map: Record<OrderStockStatus, string> = {
			not_deducted: 'Belum Potong Stok',
			deducted: 'Stok Sudah Dipotong',
			released: 'Stok Sudah Dikembalikan'
		};

		return map[status];
	}

	function stockStatusColor(status: OrderStockStatus): string {
		const map: Record<OrderStockStatus, string> = {
			not_deducted: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
			deducted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
			released: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
		};

		return map[status];
	}

	async function loadOrders() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/orders');

			if (response.status === 401) {
				error = 'Sesi Anda telah berakhir. Silakan pilih kembali akun melalui Persona Switcher.';
				authStore.handleUnauthorized();
				return;
			}

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

			paymentStatusDraftByOrderId = orders.reduce<Record<string, PaymentStatus>>((acc, item) => {
				acc[item.id] = normalizeManualPaymentStatus(item.paymentStatus);
				return acc;
			}, {});

			if (showDetailModal && selectedOrder) {
				const refreshedSelectedOrder = orders.find((item) => item.id === selectedOrder?.id) ?? null;
				selectedOrder = refreshedSelectedOrder;
				if (!refreshedSelectedOrder) {
					showDetailModal = false;
				}
			}
		} catch {
			error = 'Gagal terhubung ke server. Silakan coba lagi.';
			orders = [];
		} finally {
			loading = false;
		}
	}

	async function applyOrderStatus(order: AdminOrder, nextStatus: OrderStatus) {
		statusUpdatingOrderId = order.id;
		statusActionError = '';
		statusActionSuccess = '';

		try {
			const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}/status`, {
				method: 'PATCH',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ status: nextStatus })
			});

			const body = (await response.json().catch(() => null)) as OrderStatusApiResponse | null;
			if (!response.ok) {
				statusActionError =
					typeof body?.message === 'string' && body.message.trim().length > 0
						? body.message
						: 'Gagal memperbarui status order.';
				return;
			}

			const responseStockStatus = normalizeStockStatus(
				getString(body?.order?.stockStatus, 'not_deducted').toLowerCase()
			);
			const responseStockUpdated = Boolean(body?.order?.stockUpdated);
			const stockFeedback = responseStockUpdated
				? nextStatus === 'confirmed'
					? 'Stok berhasil dipotong.'
					: nextStatus === 'cancelled'
						? 'Stok berhasil dikembalikan.'
						: `Perubahan stok diterapkan (${stockStatusLabel(responseStockStatus)}).`
				: 'Status berubah tanpa perubahan stok.';

			statusActionSuccess = `Status order ${order.orderNumber} diperbarui menjadi ${statusLabel(nextStatus)}. ${stockFeedback}`;

			await loadOrders();
			if (showDetailModal && selectedOrder?.id === order.id) {
				const refreshedOrder = orders.find((item) => item.id === order.id) ?? null;
				selectedOrder = refreshedOrder;
				if (!refreshedOrder) {
					showDetailModal = false;
				}
			}
		} catch {
			statusActionError = 'Gagal terhubung ke server saat memperbarui status.';
		} finally {
			statusUpdatingOrderId = null;
		}
	}

	async function applyPaymentStatus(order: AdminOrder) {
		const nextPaymentStatus =
			paymentStatusDraftByOrderId[order.id] ?? normalizeManualPaymentStatus(order.paymentStatus);

		paymentActionError = '';
		paymentActionSuccess = '';
		if (!hasPaymentStatusChanged(order)) {
			paymentActionSuccess = `Status pembayaran ${order.orderNumber} sudah ${paymentLabel(order.paymentStatus)}.`;
			return;
		}

		paymentUpdatingOrderId = order.id;

		try {
			const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}/payment-status`, {
				method: 'PATCH',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ paymentStatus: nextPaymentStatus })
			});

			const body = (await response.json().catch(() => null)) as OrderPaymentStatusApiResponse | null;
			if (!response.ok) {
				paymentActionError =
					typeof body?.message === 'string' && body.message.trim().length > 0
						? body.message
						: 'Gagal memperbarui status pembayaran.';
				return;
			}

			paymentActionSuccess = `Status pembayaran ${order.orderNumber} diperbarui menjadi ${paymentLabel(nextPaymentStatus)}.`;

			await loadOrders();
			if (showDetailModal && selectedOrder?.id === order.id) {
				const refreshedOrder = orders.find((item) => item.id === order.id) ?? null;
				selectedOrder = refreshedOrder;
				if (!refreshedOrder) {
					showDetailModal = false;
				}
			}
		} catch {
			paymentActionError = 'Gagal terhubung ke server saat memperbarui status pembayaran.';
		} finally {
			paymentUpdatingOrderId = null;
		}
	}

	async function verifyPayment(orderId: string, action: 'approve' | 'reject') {
		if (action === 'reject' && !verificationNote.trim()) {
			paymentActionError = 'Alasan penolakan wajib diisi.';
			return;
		}

		isVerifying = true;
		paymentActionError = '';
		paymentActionSuccess = '';

		try {
			const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/verify-payment`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					action,
					note: verificationNote,
					verifiedBy: 'Admin (Demo)'
				})
			});

			const body = await response.json();
			if (!response.ok) {
				paymentActionError = body.message || 'Gagal memproses verifikasi.';
				return;
			}

			paymentActionSuccess = body.message;
			verificationNote = '';
			await loadOrders();
		} catch (e) {
			paymentActionError = 'Gagal terhubung ke server.';
		} finally {
			isVerifying = false;
		}
	}

	function openDetail(order: AdminOrder) {
		selectedOrder = order;
		showDetailModal = true;
	}

	function getNextStatusActionLabel(status: OrderStatus): string {
		const nextStatus = getNextStatus(status);
		return nextStatus ? `Lanjut ke ${statusLabel(nextStatus)}` : 'Status Final';
	}

	async function advanceToNextStatus(order: AdminOrder) {
		const nextStatus = getNextStatus(order.status);
		if (!nextStatus) return;
		await applyOrderStatus(order, nextStatus);
	}

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const searchParam = urlParams.get('search');
		const tabParam = urlParams.get('tab');
		const paymentStatusParam = urlParams.get('paymentStatus');
		const orderStatusParam = urlParams.get('orderStatus');

		if (searchParam) {
			searchQuery = searchParam;
			isFilteredFromMonitor = true;
		}

		if (tabParam) {
			const validTabs: TabType[] = ['ALL', 'NEW', 'VERIFIKASI', 'PROCESS', 'DONE', 'CANCELLED'];
			if (validTabs.includes(tabParam.toUpperCase() as TabType)) {
				activeTab = tabParam.toUpperCase() as TabType;
				isFilteredFromMonitor = true;
			}
		}

		if (paymentStatusParam) {
			paymentFilter = normalizePaymentStatus(paymentStatusParam) as PaymentFilter;
			isFilteredFromMonitor = true;
		}

		if (orderStatusParam) {
			orderStatusFilter = normalizeOrderStatus(orderStatusParam);
			isFilteredFromMonitor = true;
		}

		void loadOrders();
	});

	const tabs: { id: TabType; label: string; count: () => number }[] = [
		{ id: 'ALL', label: 'Semua', count: () => stats().total },
		{ id: 'NEW', label: 'Menunggu Konfirmasi', count: () => stats().new },
		{ id: 'VERIFIKASI', label: 'Verifikasi Bayar', count: () => stats().verifikasi },
		{ id: 'PROCESS', label: 'Diproses', count: () => stats().process },
		{ id: 'DONE', label: 'Selesai', count: () => stats().done },
		{ id: 'CANCELLED', label: 'Dibatalkan', count: () => stats().cancelled }
	];
</script>

<div class="space-y-10 pb-24 relative">
	<header class="flex flex-col md:flex-row md:items-start justify-between gap-6" in:fly={{ y: -20, duration: 500 }}>
		<div class="flex-1">
			<div class="flex flex-wrap gap-2 mb-4">
				<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
					<span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
					<span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Local SQLite Database Simulation</span>
				</div>
				<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-900/30">
					<span class="w-2 h-2 rounded-full bg-amber-500"></span>
					<span class="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">Payment & Invoice Hold</span>
				</div>
			</div>
			<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Manajemen Pesanan 📦</h1>
			<p class="text-zinc-500 font-medium mt-2 max-w-3xl">
				Data pesanan dikelola secara riil melalui database lokal. Status alur kerja dan mutasi stok telah aktif, sementara modul pembayaran otomatis tetap berada dalam fase simulasi operasional.
			</p>
		</div>

		<div class="flex shrink-0">
			<a
				href="/api/reports/export.csv"
				class="inline-flex items-center gap-3 px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
			>
				<span>📥</span> Export Orders (CSV)
			</a>
		</div>
	</header>

	{#if isFilteredFromMonitor && (searchQuery || activeTab !== 'ALL' || paymentFilter !== 'ALL' || orderStatusFilter !== 'ALL')}
		<div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4" in:fade>
			<div class="flex items-center gap-4 text-center md:text-left">
				<div class="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🛰️</div>
				<div>
					<p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Operational Monitor Filter Aktif</p>
					<p class="text-xs text-indigo-500 font-medium mt-1">Menampilkan data spesifik berdasarkan pilihan navigasi Dashboard Monitor.</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => {
					resetListFilters();
					isFilteredFromMonitor = false;
				}}
				class="px-8 py-3 bg-white dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
			>
				Reset Filter & Lihat Semua
			</button>
		</div>
	{/if}

	{#if statusActionError}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4" in:fade>
			<p class="text-xs font-bold text-red-700 dark:text-red-300">{statusActionError}</p>
		</div>
	{/if}

	{#if statusActionSuccess}
		<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4" in:fade>
			<p class="text-xs font-bold text-emerald-700 dark:text-emerald-300">{statusActionSuccess}</p>
		</div>
	{/if}

	{#if paymentActionError}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4" in:fade>
			<p class="text-xs font-bold text-red-700 dark:text-red-300">{paymentActionError}</p>
		</div>
	{/if}

	{#if paymentActionSuccess}
		<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4" in:fade>
			<p class="text-xs font-bold text-emerald-700 dark:text-emerald-300">{paymentActionSuccess}</p>
		</div>
	{/if}

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
				{ label: 'Total Pesanan (Volume)', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
				{ label: 'Revenue Final (Paid)', value: orders.filter(o => o.paymentStatus === 'paid' || o.status === 'completed' || o.status === 'delivered').length, color: 'text-emerald-600' },
				{ label: 'Revenue Pending', value: orders.filter(o => (o.paymentStatus !== 'paid' && o.status !== 'completed' && o.status !== 'delivered') && o.status !== 'cancelled').length, color: 'text-amber-600' },
				{ label: 'Menunggu Verifikasi', value: stats().verifikasi, color: 'text-orange-600' },
				{ label: 'Dibatalkan / Void', value: stats().cancelled, color: 'text-red-500' }
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

				<div class="flex flex-col lg:flex-row lg:items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
					<div class="relative flex-1">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Cari nomor order, customer, WhatsApp, lokasi, atau catatan..."
							class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pl-11 text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
						/>
						<span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔎</span>
					</div>

					<select
						bind:value={paymentFilter}
						class="w-full lg:w-[200px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-200"
					>
						<option value="ALL">Semua Pembayaran</option>
						<option value="unpaid">Belum Lunas (Unpaid)</option>
						<option value="waiting_verification">Menunggu Verifikasi</option>
						<option value="paid">Lunas (Paid)</option>
						<option value="cod_pending">COD Pending</option>
						<option value="rejected">Ditolak (Rejected)</option>
					</select>

					<select
						bind:value={orderStatusFilter}
						class="w-full lg:w-[200px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-200"
					>
						<option value="ALL">Semua Status Order</option>
						<option value="new">Menunggu Konfirmasi</option>
						<option value="confirmed">Dikonfirmasi</option>
						<option value="processing">Diproses</option>
						<option value="ready">Siap Diantar</option>
						<option value="delivered">Dalam/Sudah Diantar</option>
						<option value="completed">Selesai (Completed)</option>
						<option value="cancelled">Dibatalkan (Cancelled)</option>
					</select>

					{#if hasActiveListFilter}
						<button
							type="button"
							onclick={resetListFilters}
							class="w-full lg:w-auto px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
						>
							Reset
						</button>
					{/if}
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
									<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {stockStatusColor(order.stockStatus)}">{stockStatusLabel(order.stockStatus)}</span>
									<span class="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Pembayaran: {paymentMethodLabel(order.paymentMethod)}</span>

									{#if order.sourceType === 'package_request'}
										<span class="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/50">
											🍱 Paket Katering
										</span>
									{/if}

									<span class="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 uppercase tracking-wider">Local DB</span>

									{#if order.paymentStatus === 'paid' || order.status === 'completed' || order.status === 'delivered'}
										<span class="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/50">
											💰 Revenue Final
										</span>
									{:else if order.status !== 'cancelled'}
										<span class="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 uppercase tracking-wider border border-amber-100 dark:border-amber-900/50">
											⏳ Revenue Pending
										</span>
									{/if}
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
									{#if getNextStatus(order.status)}
										<button
											type="button"
											disabled={statusUpdatingOrderId !== null}
											onclick={() => advanceToNextStatus(order)}
											class="px-5 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
										>
											{statusUpdatingOrderId === order.id
												? 'Menyimpan...'
												: getNextStatusActionLabel(order.status)}
										</button>
									{:else}
										<button
										type="button"
										disabled
										class="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 dark:border-zinc-700 opacity-70 cursor-not-allowed"
									>
										Status Final
									</button>
								{/if}
								{#if canSetCancelled(order.status)}
									<button
										type="button"
										disabled={statusUpdatingOrderId !== null}
										onclick={() => applyOrderStatus(order, 'cancelled')}
										class="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
									>
										Batalkan Pesanan
									</button>
								{/if}
								<div class="p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-900/40 rounded-xl space-y-2">
									<p class="text-[9px] font-black text-sky-700 dark:text-sky-300 uppercase tracking-widest">
										Manual Payment Proof (Quick)
									</p>
									<select
										aria-label="Pilih Status Pembayaran (Simulasi)"
										value={paymentStatusDraftByOrderId[order.id] ?? normalizeManualPaymentStatus(order.paymentStatus)}
										disabled={paymentUpdatingOrderId !== null}
										onchange={(event) =>
											setPaymentStatusDraft(order.id, (event.currentTarget as HTMLSelectElement).value)}
										class="w-full rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 disabled:opacity-60"
									>
										<option value="unpaid">Belum Bayar</option>
										<option value="waiting_verification">Menunggu Verifikasi</option>
										<option value="paid">Lunas</option>
										<option value="cod_pending">COD / Bayar di Tempat</option>
										</select>
										<button
											type="button"
											aria-label="Simpan Status Pembayaran Manual"
											disabled={paymentUpdatingOrderId !== null || !hasPaymentStatusChanged(order)}
											onclick={() => applyPaymentStatus(order)}
											class="w-full px-3 py-2 bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-sky-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
										>
											{paymentUpdatingOrderId === order.id
												? 'Memproses...'
												: hasPaymentStatusChanged(order)
													? 'Tandai Lunas (Manual)'
													: 'Status Sesuai (Lokal)'}
										</button>
										<p class="text-[9px] font-semibold text-sky-700/80 dark:text-sky-300/80 italic">
											Workflow simulasi tanpa gateway/upload bukti.
									</p>
								</div>
							</div>
						</div>
					</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800" in:fade>
							{#if hasAnyOrders}
								<p class="text-2xl font-black text-zinc-300 dark:text-zinc-700">Tidak ada order yang cocok dengan filter</p>
								<p class="text-sm font-semibold text-zinc-400 mt-2">
									Coba ganti kata kunci pencarian, tab status, atau filter payment.
								</p>
							{:else}
								<p class="text-2xl font-black text-zinc-300 dark:text-zinc-700">Belum ada order di database</p>
							{/if}
						</div>
					{/each}
				</div>
		</div>
	{/if}
</div>

<Modal show={showDetailModal} title="Detail Pesanan" onClose={() => (showDetailModal = false)}>
	{#if selectedOrder}
		<div class="space-y-6">
			<div class="flex flex-wrap items-center gap-2">
				<span class="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 uppercase tracking-wider">Data Database Lokal</span>
				<span class="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Status + Payment Manual</span>
				<span class="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 uppercase tracking-wider">Gateway/Upload Bukti Hold</span>
				<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {stockStatusColor(selectedOrder.stockStatus)}">{stockStatusLabel(selectedOrder.stockStatus)}</span>
			</div>

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
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status Stok Order</p>
					<span class="px-3 py-1 rounded-full text-[10px] font-black {stockStatusColor(selectedOrder.stockStatus)}">{stockStatusLabel(selectedOrder.stockStatus)}</span>
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
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Bidang / Dinas / Bagian</p>
					<p class="text-sm font-bold">{selectedOrder.deliveryInfo.departmentOrUnit ?? '-'}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lantai</p>
					<p class="text-sm font-bold">{selectedOrder.deliveryInfo.floor ?? '-'}</p>
				</div>
				<div class="col-span-2">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Lokasi</p>
					<p class="text-sm font-bold">{selectedOrder.deliveryInfo.locationNote ?? '-'}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Metode Pembayaran</p>
					<p class="text-sm font-bold uppercase">{paymentMethodLabel(selectedOrder.paymentMethod)}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status Pembayaran</p>
					<p class="text-sm font-bold {paymentColor(selectedOrder.paymentStatus)}">{paymentLabel(selectedOrder.paymentStatus)}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Dev Persona</p>
					<p class="text-sm font-bold uppercase">{selectedOrder.devPersonaCode ?? '-'}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Waktu Potong Stok</p>
					<p class="text-sm font-bold">{selectedOrder.stockDeductedAt ? formatDate(selectedOrder.stockDeductedAt) : '-'}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Waktu Restore Stok</p>
					<p class="text-sm font-bold">{selectedOrder.stockReleasedAt ? formatDate(selectedOrder.stockReleasedAt) : '-'}</p>
				</div>
				<div>
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
					<div class="flex items-center gap-4">
						<p class="text-lg font-black text-brand-charcoal dark:text-white italic">{formatPrice(selectedOrder.total)}</p>
						<a
							href="/invoice/{selectedOrder.id}"
							target="_blank"
							class="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700"
						>
							📄 Lihat Invoice
						</a>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Subtotal</p>
					<p class="text-sm font-black">{formatPrice(selectedOrder.subtotal)}</p>
				</div>
				<div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pajak</p>
					<p class="text-sm font-black">{formatPrice(selectedOrder.taxAmount)}</p>
				</div>
				<div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Delivery Fee</p>
					<p class="text-sm font-black">{formatPrice(selectedOrder.deliveryFee)}</p>
				</div>
				<div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
					<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Sisa Bayar</p>
					<p class="text-sm font-black">{formatPrice(selectedOrder.payment.remainingAmount)}</p>
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

			<div>
				<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan</p>
				<p class="text-sm">{selectedOrder.notes || '-'}</p>
			</div>

			<div class="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-[2rem] border border-zinc-100 dark:border-zinc-700 space-y-6">
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Manual Payment Proof Verification</p>
						<p class="text-[9px] font-bold text-zinc-400 italic uppercase">Manual verification simulation flow</p>
					</div>
					{#if selectedOrder.paymentProof}
						<span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider
							{selectedOrder.paymentProof.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
							 selectedOrder.paymentProof.status === 'rejected' ? 'bg-red-100 text-red-700' :
							 'bg-amber-100 text-amber-700'}">
							{selectedOrder.paymentProof.status === 'verified' ? 'Terverifikasi' :
							 selectedOrder.paymentProof.status === 'rejected' ? 'Ditolak' :
							 'Menunggu Verifikasi'}
						</span>
					{:else}
						<div class="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
							<span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">No Proof Uploaded</span>
						</div>
					{/if}
				</div>

				{#if selectedOrder.paymentProof}
					<div class="space-y-4">
						<div class="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group relative">
							{#if selectedOrder.paymentProof.filePath.startsWith('data:image/')}
								<img src={selectedOrder.paymentProof.filePath} alt="Payment Proof" class="w-full h-full object-contain" />
							{:else}
								<div class="w-full h-full flex flex-col items-center justify-center space-y-2">
									<span class="text-4xl">📄</span>
									<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{selectedOrder.paymentProof.fileName}</p>
									<a href={selectedOrder.paymentProof.filePath} target="_blank" class="px-4 py-2 bg-zinc-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Buka Dokumen</a>
								</div>
							{/if}
						</div>

						<div class="grid grid-cols-2 gap-4 text-[10px]">
							<div>
								<p class="text-zinc-400 font-black uppercase tracking-widest mb-1">Nama File</p>
								<p class="font-bold truncate">{selectedOrder.paymentProof.fileName}</p>
							</div>
							<div>
								<p class="text-zinc-400 font-black uppercase tracking-widest mb-1">Waktu Unggah</p>
								<p class="font-bold">{formatDate(selectedOrder.paymentProof.uploadedAt)}</p>
							</div>
						</div>

						{#if selectedOrder.paymentStatus === 'waiting_verification'}
							<div class="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
								<textarea
									bind:value={verificationNote}
									placeholder="Catatan verifikasi atau alasan penolakan (wajib jika reject)..."
									class="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary"
									rows="2"
								></textarea>

								<div class="flex gap-3">
									<button
										onclick={() => verifyPayment(selectedOrder!.id, 'reject')}
										disabled={isVerifying}
										class="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50"
									>
										Tolak (Reject)
									</button>
									<button
										onclick={() => verifyPayment(selectedOrder!.id, 'approve')}
										disabled={isVerifying}
										class="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all disabled:opacity-50"
									>
										Verifikasi Lunas (Approve)
									</button>
								</div>
							</div>
						{:else if selectedOrder.paymentProof.verificationNote}
							<div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
								<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Admin</p>
								<p class="text-xs italic">"{selectedOrder.paymentProof.verificationNote}"</p>
								<div class="mt-2 flex justify-between text-[8px] font-black text-zinc-400 uppercase tracking-tighter">
									<span>Oleh: {selectedOrder.paymentProof.verifiedBy}</span>
									<span>{formatDate(selectedOrder.paymentProof.verifiedAt || '')}</span>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<p class="text-xs font-semibold text-zinc-500 mt-1 italic text-center py-4">
						Belum ada bukti pembayaran yang diunggah customer.
					</p>
				{/if}
			</div>

			<div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
				<p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Completion Confirmation</p>
				<p class="text-xs font-semibold text-zinc-500 mt-1">
					Konfirmasi selesai User/CS/Admin belum diaktifkan untuk mode read-only (Hold).
				</p>
			</div>

			<div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
				<p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Aksi Admin</p>
				<p class="text-xs font-semibold text-zinc-500 mt-1">
					Update status order minimal dan payment status manual aktif dari daftar order. Payment gateway/upload bukti tetap Hold.
				</p>
			</div>
		</div>
	{/if}
</Modal>

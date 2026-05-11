<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';

	type PackageRequestStatus =
		| 'new'
		| 'reviewing'
		| 'quoted'
		| 'rejected'
		| 'cancelled'
		| 'converted_to_order';

	type PackageRequestReviewStatus = 'new' | 'reviewing' | 'quoted' | 'rejected' | 'cancelled';
	type PackageRequestFilterStatus = 'all' | PackageRequestReviewStatus;

	type AdminPackageRequest = {
		id: string;
		requestNumber: string;
		packageId: string;
		packageName: string;
		customerName: string;
		whatsapp: string;
		eventDate: string;
		pax: number;
		location: string;
		notes: string;
		status: PackageRequestStatus;
		adminNote: string | null;
		estimatedPrice: number | null;
		reviewedAt: string | null;
		convertedOrderId: string | null;
		createdAt: string;
		updatedAt: string;
	};

	type PackageRequestApiResponse = {
		items?: unknown;
		message?: string;
	};

	type PackageRequestReviewApiResponse = {
		request?: {
			id?: unknown;
			requestNumber?: unknown;
			status?: unknown;
			adminNote?: unknown;
			estimatedPrice?: unknown;
			reviewedAt?: unknown;
			updatedAt?: unknown;
		};
		message?: string;
	};

	type ReviewDraft = {
		status: PackageRequestReviewStatus;
		adminNote: string;
		estimatedPrice: string;
	};

	const reviewStatuses: Array<{ value: PackageRequestReviewStatus; label: string }> = [
		{ value: 'new', label: 'Menunggu Review' },
		{ value: 'reviewing', label: 'Sedang Ditinjau' },
		{ value: 'quoted', label: 'Penawaran Diberikan' },
		{ value: 'rejected', label: 'Dibatalkan/Ditolak' },
		{ value: 'cancelled', label: 'Dibatalkan' }
	];
	const requestStatusFilters: Array<{ value: PackageRequestFilterStatus; label: string }> = [
		{ value: 'all', label: 'Semua Status' },
		{ value: 'new', label: 'Menunggu Review' },
		{ value: 'reviewing', label: 'Sedang Ditinjau' },
		{ value: 'quoted', label: 'Penawaran Diberikan' },
		{ value: 'rejected', label: 'Ditolak' },
		{ value: 'cancelled', label: 'Dibatalkan' }
	];

	let loading = $state(true);
	let error = $state('');
	let requests = $state<AdminPackageRequest[]>([]);
	let searchQuery = $state('');
	let statusFilter = $state<PackageRequestFilterStatus>('all');
	let reviewSavingId = $state<string | null>(null);
	let reviewError = $state('');
	let reviewSuccess = $state('');
	let reviewDraftById = $state<Record<string, ReviewDraft>>({});
	let filteredRequests = $derived.by(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return requests.filter((request) => {
			const matchesStatus = statusFilter === 'all' ? true : request.status === statusFilter;
			if (!matchesStatus) return false;

			if (!normalizedQuery) return true;
			return [
				request.requestNumber,
				request.packageName,
				request.customerName,
				request.whatsapp,
				request.location,
				request.notes,
				request.adminNote ?? ''
			].some((field) => field.toLowerCase().includes(normalizedQuery));
		});
	});
	let requestSummary = $derived.by(() =>
		requests.reduce(
			(acc, request) => {
				acc.total += 1;
				if (request.status === 'new') acc.new += 1;
				if (request.status === 'reviewing') acc.reviewing += 1;
				if (request.status === 'quoted') acc.quoted += 1;
				if (request.status === 'rejected' || request.status === 'cancelled') {
					acc.rejectedOrCancelled += 1;
				}
				return acc;
			},
			{
				total: 0,
				new: 0,
				reviewing: 0,
				quoted: 0,
				rejectedOrCancelled: 0
			}
		)
	);

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
		if (!Number.isFinite(parsed)) return fallback;
		return parsed;
	}

	function normalizeStatus(value: unknown): PackageRequestStatus {
		const normalized = getString(value, 'new').toLowerCase();
		const allowed: PackageRequestStatus[] = [
			'new',
			'reviewing',
			'quoted',
			'rejected',
			'cancelled',
			'converted_to_order'
		];

		return allowed.includes(normalized as PackageRequestStatus)
			? (normalized as PackageRequestStatus)
			: 'new';
	}

	function normalizeReviewStatus(value: unknown): PackageRequestReviewStatus {
		const normalized = getString(value, 'new').toLowerCase();
		const allowed: PackageRequestReviewStatus[] = ['new', 'reviewing', 'quoted', 'rejected', 'cancelled'];
		return allowed.includes(normalized as PackageRequestReviewStatus)
			? (normalized as PackageRequestReviewStatus)
			: 'new';
	}

	function normalizeRequest(raw: unknown): AdminPackageRequest | null {
		if (!isRecord(raw)) return null;

		const id = getString(raw.id);
		if (!id) return null;

		return {
			id,
			requestNumber: getString(raw.requestNumber, id),
			packageId: getString(raw.packageId, '-'),
			packageName: getString(raw.packageName, '-'),
			customerName: getString(raw.customerName, '-'),
			whatsapp: getString(raw.whatsapp, '-'),
			eventDate: getString(raw.eventDate, '-'),
			pax: Math.max(1, Math.floor(getNumber(raw.pax, 1))),
			location: getString(raw.location, '-'),
			notes: getString(raw.notes, ''),
			status: normalizeStatus(raw.status),
			adminNote: getString(raw.adminNote) || null,
			estimatedPrice:
				raw.estimatedPrice === null || raw.estimatedPrice === undefined
					? null
					: Math.max(0, Math.floor(getNumber(raw.estimatedPrice, 0))),
			reviewedAt: getString(raw.reviewedAt) || null,
			convertedOrderId: getString(raw.convertedOrderId) || null,
			createdAt: getString(raw.createdAt, '-'),
			updatedAt: getString(raw.updatedAt, '-')
		};
	}

	function formatDate(value: string): string {
		const safeValue = getString(value);
		if (!safeValue) return '-';

		const date = new Date(safeValue);
		if (Number.isNaN(date.getTime())) return safeValue;

		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(value);
	}

	function statusLabel(status: PackageRequestStatus): string {
		const labels: Record<PackageRequestStatus, string> = {
			new: 'Menunggu Review',
			reviewing: 'Sedang Ditinjau',
			quoted: 'Penawaran Diberikan',
			rejected: 'Dibatalkan/Ditolak',
			cancelled: 'Dibatalkan',
			converted_to_order: 'Sudah Menjadi Order'
		};

		return labels[status];
	}

	function statusColor(status: PackageRequestStatus): string {
		const colors: Record<PackageRequestStatus, string> = {
			new: 'bg-blue-50 text-blue-600 border border-blue-100',
			reviewing: 'bg-amber-50 text-amber-600 border border-amber-100',
			quoted: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
			rejected: 'bg-red-50 text-red-600 border border-red-100',
			cancelled: 'bg-zinc-50 text-zinc-400 border border-zinc-100',
			converted_to_order: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
		};

		return colors[status];
	}

	function setDraftStatus(requestId: string, status: string) {
		const normalized = normalizeReviewStatus(status);
		const current = reviewDraftById[requestId];
		if (!current) return;

		reviewDraftById = {
			...reviewDraftById,
			[requestId]: {
				...current,
				status: normalized
			}
		};
	}

	function setDraftAdminNote(requestId: string, note: string) {
		const current = reviewDraftById[requestId];
		if (!current) return;

		reviewDraftById = {
			...reviewDraftById,
			[requestId]: {
				...current,
				adminNote: note
			}
		};
	}

	function setDraftEstimatedPrice(requestId: string, estimatedPrice: string) {
		const current = reviewDraftById[requestId];
		if (!current) return;

		reviewDraftById = {
			...reviewDraftById,
			[requestId]: {
				...current,
				estimatedPrice
			}
		};
	}

	async function loadPackageRequests() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/package-requests');
			const body = (await response.json().catch(() => null)) as PackageRequestApiResponse | null;

			if (!response.ok) {
				error =
					typeof body?.message === 'string' && body.message.trim().length > 0
						? body.message
						: 'Gagal memuat request paket.';
				requests = [];
				return;
			}

			if (!Array.isArray(body?.items)) {
				error = 'Response request paket tidak valid.';
				requests = [];
				return;
			}

			requests = body.items
				.map((item) => normalizeRequest(item))
				.filter((item): item is AdminPackageRequest => item !== null)
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

			reviewDraftById = requests.reduce<Record<string, ReviewDraft>>((acc, request) => {
				acc[request.id] = {
					status: normalizeReviewStatus(request.status),
					adminNote: request.adminNote ?? '',
					estimatedPrice:
						request.estimatedPrice === null || request.estimatedPrice === undefined
							? ''
							: String(request.estimatedPrice)
				};
				return acc;
			}, {});
		} catch {
			error = 'Gagal terhubung ke server. Silakan coba lagi.';
			requests = [];
		} finally {
			loading = false;
		}
	}

	async function saveReview(request: AdminPackageRequest) {
		const draft = reviewDraftById[request.id];
		if (!draft) return;

		reviewError = '';
		reviewSuccess = '';

		let estimatedPrice: number | null = null;
		if (draft.estimatedPrice.trim().length > 0) {
			const parsed = Number(draft.estimatedPrice);
			if (!Number.isFinite(parsed) || parsed < 0) {
				reviewError = 'Estimasi harga harus angka >= 0.';
				return;
			}
			estimatedPrice = Math.floor(parsed);
		}

		reviewSavingId = request.id;

		try {
			const response = await fetch(`/api/package-requests/${encodeURIComponent(request.id)}/status`, {
				method: 'PATCH',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					status: draft.status,
					adminNote: draft.adminNote.trim().length > 0 ? draft.adminNote.trim() : null,
					estimatedPrice
				})
			});

			const body = (await response.json().catch(() => null)) as PackageRequestReviewApiResponse | null;
			if (!response.ok) {
				reviewError =
					typeof body?.message === 'string' && body.message.trim().length > 0
						? body.message
						: 'Gagal menyimpan review request paket.';
				return;
			}

			reviewSuccess = `Review ${request.requestNumber} berhasil disimpan.`;
			await loadPackageRequests();
		} catch {
			reviewError = 'Gagal terhubung ke server saat menyimpan review.';
		} finally {
			reviewSavingId = null;
		}
	}

	async function convertRequestToOrder(request: AdminPackageRequest) {
		if (request.status === 'converted_to_order' || request.convertedOrderId) return;
		if (request.status !== 'quoted') {
			reviewError = 'Hanya request dengan status "Penawaran Diberikan" (quoted) yang bisa dikonversi.';
			return;
		}

		if (!confirm(`Konversi Request #${request.requestNumber} menjadi Order aktif?`)) return;

		reviewSavingId = request.id;
		reviewError = '';
		reviewSuccess = '';

		try {
			const response = await fetch(`/api/package-requests/${encodeURIComponent(request.id)}/convert`, {
				method: 'POST'
			});

			const body = (await response.json().catch(() => null)) as { message?: string; orderNumber?: string } | null;
			if (!response.ok) {
				reviewError = body?.message || 'Gagal mengonversi request paket.';
				return;
			}

			reviewSuccess = `Berhasil! Request telah menjadi Order #${body?.orderNumber}.`;
			await loadPackageRequests();
		} catch {
			reviewError = 'Gagal terhubung ke server saat proses konversi.';
		} finally {
			reviewSavingId = null;
		}
	}

	onMount(() => {
		void loadPackageRequests();
	});
</script>

<div class="space-y-10 pb-24">
	<header in:fly={{ y: -20, duration: 500 }}>
		<div class="flex flex-wrap gap-2 mb-4">
			<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
				<span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
				<span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Local SQLite Database Simulation</span>
			</div>
			<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/5 rounded-full border border-brand-primary/10">
				<span class="w-2 h-2 rounded-full bg-brand-primary"></span>
				<span class="text-[10px] font-black text-brand-primary uppercase tracking-widest">Conversion Flow Active (Phase A)</span>
			</div>
		</div>
		<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">
			Package Requests 🍱
		</h1>
		<p class="text-zinc-500 font-medium mt-2 max-w-2xl">
			Review dan kelola permintaan paket katering dari database lokal. Berikan estimasi harga dan catatan penawaran untuk memandu pelanggan menuju kesepakatan final.
		</p>
	</header>

	{#if reviewError}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 shadow-sm" in:fade>
			<div class="flex items-center gap-3">
				<span class="text-xl">⚠️</span>
				<p class="text-sm font-bold text-red-700 dark:text-red-300">{reviewError}</p>
			</div>
		</div>
	{/if}

	{#if reviewSuccess}
		<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 shadow-sm" in:fade>
			<div class="flex items-center gap-3">
				<span class="text-xl">✅</span>
				<p class="text-sm font-bold text-emerald-700 dark:text-emerald-300">{reviewSuccess}</p>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-20 text-center shadow-sm" in:fade>
			<div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">Sinkronisasi Database...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-[3rem] p-16 text-center shadow-sm" in:fade>
			<p class="text-sm font-bold text-red-600 dark:text-red-400 mb-6">{error}</p>
			<button
				type="button"
				onclick={loadPackageRequests}
				class="px-8 py-4 rounded-2xl bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl"
			>
				Muat Ulang Data
			</button>
		</div>
	{:else if requests.length === 0}
		<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 p-24 text-center" in:fade>
			<div class="text-5xl mb-6 opacity-20 grayscale">📭</div>
			<p class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter uppercase">Belum ada request masuk</p>
			<p class="text-zinc-500 mt-2 font-medium">Semua permintaan paket dari pelanggan akan tampil di sini untuk proses review.</p>
		</div>
	{:else}
		<div class="space-y-8" in:fade={{ delay: 120 }}>
			<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-10 space-y-8">
				<div class="grid gap-6 lg:grid-cols-[1fr_300px]">
					<div class="space-y-2">
						<label for="request-search" class="mb-1 block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
							🔍 Cari Database
						</label>
						<input
							id="request-search"
							type="text"
							bind:value={searchQuery}
							placeholder="Cari nomor, paket, pelanggan, whatsapp, lokasi..."
							class="w-full rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 py-4 text-xs font-bold text-brand-charcoal dark:text-white focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
						/>
					</div>
					<div class="space-y-2">
						<label for="request-status-filter" class="mb-1 block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
							📂 Filter Status
						</label>
						<select
							id="request-status-filter"
							bind:value={statusFilter}
							class="w-full rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 py-4 text-xs font-bold text-brand-charcoal dark:text-white focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none"
						>
							{#each requestStatusFilters as item}
								<option value={item.value}>{item.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
					<div class="rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-5 py-4">
						<p class="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Request</p>
						<p class="text-xl font-black text-brand-charcoal dark:text-white">{requestSummary.total}</p>
					</div>
					<div class="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 px-5 py-4">
						<p class="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Baru</p>
						<p class="text-xl font-black text-blue-700 dark:text-blue-300">{requestSummary.new}</p>
					</div>
					<div class="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-5 py-4">
						<p class="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Ditinjau</p>
						<p class="text-xl font-black text-amber-700 dark:text-amber-300">{requestSummary.reviewing}</p>
					</div>
					<div class="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 px-5 py-4">
						<p class="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">Quoted</p>
						<p class="text-xl font-black text-indigo-700 dark:text-indigo-300">{requestSummary.quoted}</p>
					</div>
					<div class="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 px-5 py-4">
						<p class="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Batal/Tolak</p>
						<p class="text-xl font-black text-red-700 dark:text-red-300">{requestSummary.rejectedOrCancelled}</p>
					</div>
				</div>
				<p class="text-[11px] text-zinc-500 font-bold italic">
					✨ Menampilkan {filteredRequests.length} dari {requests.length} data dalam database.
				</p>
			</div>

			{#if filteredRequests.length === 0}
				<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 p-24 text-center shadow-inner" in:fade>
					<p class="text-xl font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-tighter italic">
						Tidak ada hasil yang sesuai kriteria filter
					</p>
				</div>
			{:else}
				<div class="space-y-6">
					{#each filteredRequests as request (request.id)}
						<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:border-brand-primary/20 transition-all" in:scale={{ start: 0.98, duration: 220 }}>
							<div class="flex flex-col lg:flex-row lg:items-stretch">
								<div class="flex-1 p-10 space-y-8">
									<div class="flex flex-wrap items-center gap-3">
										<span class="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] {statusColor(request.status)}">{statusLabel(request.status)}</span>
										<span class="px-5 py-2 rounded-full text-[10px] font-black bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700 italic">#{request.requestNumber}</span>
									</div>

									<div class="grid grid-cols-1 md:grid-cols-2 gap-10">
										<div class="space-y-6">
											<div class="space-y-1">
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">📦 Paket Yang Diminta</p>
												<p class="text-xl font-black text-brand-charcoal dark:text-white uppercase italic">{request.packageName}</p>
												<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest tracking-tighter">ID: {request.packageId}</p>
											</div>
											<div class="space-y-1">
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">👤 Informasi Pelanggan</p>
												<p class="text-xl font-black text-brand-charcoal dark:text-white uppercase italic">{request.customerName}</p>
												<p class="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{request.whatsapp}</p>
											</div>
										</div>
										<div class="grid grid-cols-2 gap-6">
											<div>
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">📅 Tanggal Acara</p>
												<p class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">{formatDate(request.eventDate)}</p>
											</div>
											<div>
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">👥 Peserta</p>
												<p class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">{request.pax} Pax</p>
											</div>
											<div>
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">🕒 Diajukan</p>
												<p class="text-sm font-bold text-zinc-500 uppercase tracking-tighter">{formatDate(request.createdAt)}</p>
											</div>
											<div>
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">🛠️ Review Terakhir</p>
												<p class="text-sm font-bold text-zinc-500 uppercase tracking-tighter">
													{request.reviewedAt ? formatDate(request.reviewedAt) : 'Belum Ada'}
												</p>
											</div>
										</div>
									</div>

									<div class="space-y-6 pt-8 border-t border-zinc-50 dark:border-zinc-800/50">
										<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
											<div class="space-y-2">
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">📍 Lokasi / Alamat</p>
												<div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
													<p class="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed italic">{request.location}</p>
												</div>
											</div>
											<div class="space-y-2">
												<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">📝 Catatan Kebutuhan</p>
												<div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
													<p class="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed italic">"{request.notes || 'Tidak ada catatan khusus.'}"</p>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="lg:w-[360px] bg-zinc-50/50 dark:bg-zinc-800/30 border-l border-zinc-50 dark:border-zinc-800/50 p-10 space-y-8 flex flex-col justify-between">
									<div class="space-y-6">
										<div class="space-y-1">
											<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Panel Review Admin</p>
											<p class="text-xs font-bold text-zinc-500 italic">Update Status & Penawaran</p>
										</div>

										<div class="space-y-4">
											<div class="space-y-2">
												<label for={`status-${request.id}`} class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Status Final</label>
												<select
													id={`status-${request.id}`}
													value={reviewDraftById[request.id]?.status ?? normalizeReviewStatus(request.status)}
													disabled={reviewSavingId !== null}
													onchange={(event) => setDraftStatus(request.id, (event.currentTarget as HTMLSelectElement).value)}
													class="w-full rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-xs font-bold text-brand-charcoal dark:text-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all disabled:opacity-60"
												>
													{#each reviewStatuses as item}
														<option value={item.value}>{item.label}</option>
													{/each}
												</select>
											</div>
											<div class="space-y-2">
												<label for={`estimated-${request.id}`} class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Estimasi Total Harga</label>
												<input
													id={`estimated-${request.id}`}
													type="number"
													min="0"
													step="1"
													value={reviewDraftById[request.id]?.estimatedPrice ?? ''}
													disabled={reviewSavingId !== null}
													oninput={(event) => setDraftEstimatedPrice(request.id, (event.currentTarget as HTMLInputElement).value)}
													class="w-full rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-xs font-bold text-brand-charcoal dark:text-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all disabled:opacity-60"
													placeholder="Rp 0"
												/>
											</div>
											<div class="space-y-2">
												<label for={`note-${request.id}`} class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Catatan Review Untuk Customer</label>
												<textarea
													id={`note-${request.id}`}
													rows="3"
													disabled={reviewSavingId !== null}
													oninput={(event) => setDraftAdminNote(request.id, (event.currentTarget as HTMLTextAreaElement).value)}
													class="w-full rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-xs font-medium text-brand-charcoal dark:text-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all disabled:opacity-60 resize-none"
													placeholder="Tulis balasan atau rincian penawaran..."
												>{reviewDraftById[request.id]?.adminNote ?? ''}</textarea>
											</div>
											<button
												type="button"
												disabled={reviewSavingId !== null}
												onclick={() => saveReview(request)}
												class="w-full py-4 bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-brand-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
											>
												{reviewSavingId === request.id ? 'Menyimpan...' : 'Simpan Perubahan'}
											</button>
										</div>
									</div>

									<div class="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
										{#if request.status === 'converted_to_order' || request.convertedOrderId}
											<div class="space-y-3">
												<div class="w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-center gap-2">
													<span>✅</span> Sudah Menjadi Order
												</div>
												{#if request.convertedOrderId}
													<a 
														href="/dashboard/admin/orders?search={request.convertedOrderId.split('-')[0]}"
														class="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-900 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-xl border border-brand-primary/20 hover:bg-brand-primary/5 transition-all"
													>
														🔍 Lihat Order
													</a>
												{/if}
											</div>
										{:else}
											<button
												type="button"
												disabled={reviewSavingId !== null || request.status !== 'quoted'}
												onclick={() => convertRequestToOrder(request)}
												class="w-full py-3.5 {request.status === 'quoted' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 opacity-60 cursor-not-allowed'} text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
											>
												{reviewSavingId === request.id ? 'Memproses...' : 'Convert ke Order'}
											</button>
										{/if}
										<div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
											<p class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter italic">
												{#if request.status === 'quoted'}
													Penawaran disetujui? Klik Convert untuk menjadikannya pesanan aktif.
												{:else if request.status === 'converted_to_order'}
													Alur konversi Fase A selesai. Order dapat dipantau di manajemen pesanan.
												{:else}
													Beri penawaran (status: quoted) terlebih dahulu sebelum konversi.
												{/if}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

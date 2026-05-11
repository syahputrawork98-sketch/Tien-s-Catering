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
		{ value: 'new', label: 'Baru' },
		{ value: 'reviewing', label: 'Sedang Ditinjau' },
		{ value: 'quoted', label: 'Sudah Diquote' },
		{ value: 'rejected', label: 'Ditolak' },
		{ value: 'cancelled', label: 'Dibatalkan' }
	];
	const requestStatusFilters: Array<{ value: PackageRequestFilterStatus; label: string }> = [
		{ value: 'all', label: 'Semua' },
		{ value: 'new', label: 'Baru' },
		{ value: 'reviewing', label: 'Sedang Ditinjau' },
		{ value: 'quoted', label: 'Sudah Diquote' },
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
			new: 'Baru',
			reviewing: 'Sedang Ditinjau',
			quoted: 'Sudah Diquote',
			rejected: 'Ditolak',
			cancelled: 'Dibatalkan',
			converted_to_order: 'Dikonversi ke Order'
		};

		return labels[status];
	}

	function statusColor(status: PackageRequestStatus): string {
		const colors: Record<PackageRequestStatus, string> = {
			new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
			reviewing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
			quoted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
			rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
			cancelled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
			converted_to_order: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
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
				.filter((item): item is AdminPackageRequest => item !== null);

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

	onMount(() => {
		void loadPackageRequests();
	});
</script>

<div class="space-y-10 pb-24">
	<header in:fly={{ y: -20, duration: 500 }}>
		<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
			<span class="w-2 h-2 rounded-full bg-blue-500"></span>
			<span class="text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Read-only Request Paket</span>
		</div>
		<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">
			Package Requests Admin
		</h1>
	<p class="text-zinc-500 font-medium mt-2">
			Review request paket minimal aktif. Convert ke order/payment/invoice tetap Hold.
		</p>
	</header>

	{#if reviewError}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4" in:fade>
			<p class="text-xs font-bold text-red-700 dark:text-red-300">{reviewError}</p>
		</div>
	{/if}

	{#if reviewSuccess}
		<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4" in:fade>
			<p class="text-xs font-bold text-emerald-700 dark:text-emerald-300">{reviewSuccess}</p>
		</div>
	{/if}

	{#if loading}
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-10 shadow-sm" in:fade>
			<p class="text-sm font-bold text-zinc-500">Memuat request paket dari database...</p>
		</div>
	{:else if error}
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 p-10 shadow-sm" in:fade>
			<p class="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
			<button
				type="button"
				onclick={loadPackageRequests}
				class="mt-6 px-6 py-3 rounded-xl bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
			>
				Coba Muat Ulang
			</button>
		</div>
	{:else if requests.length === 0}
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 p-16 text-center" in:fade>
			<p class="text-2xl font-black text-zinc-300 dark:text-zinc-700">Belum ada request paket</p>
		</div>
	{:else}
		<div class="space-y-6" in:fade={{ delay: 120 }}>
			<div class="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
				<div class="grid gap-3 lg:grid-cols-[1fr_260px]">
					<div>
						<label for="request-search" class="mb-1 block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
							Cari Request
						</label>
						<input
							id="request-search"
							type="text"
							bind:value={searchQuery}
							placeholder="Nomor request, paket, pemesan, WA, lokasi, catatan"
							class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200"
						/>
					</div>
					<div>
						<label for="request-status-filter" class="mb-1 block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
							Filter Status
						</label>
						<select
							id="request-status-filter"
							bind:value={statusFilter}
							class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200"
						>
							{#each requestStatusFilters as item}
								<option value={item.value}>{item.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
					<div class="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-3 py-2">
						<p class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total</p>
						<p class="text-sm font-black text-brand-charcoal dark:text-white">{requestSummary.total}</p>
					</div>
					<div class="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 px-3 py-2">
						<p class="text-[9px] font-black uppercase tracking-widest text-blue-500">Baru</p>
						<p class="text-sm font-black text-blue-700 dark:text-blue-300">{requestSummary.new}</p>
					</div>
					<div class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-3 py-2">
						<p class="text-[9px] font-black uppercase tracking-widest text-amber-500">Reviewing</p>
						<p class="text-sm font-black text-amber-700 dark:text-amber-300">{requestSummary.reviewing}</p>
					</div>
					<div class="rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 px-3 py-2">
						<p class="text-[9px] font-black uppercase tracking-widest text-purple-500">Quoted</p>
						<p class="text-sm font-black text-purple-700 dark:text-purple-300">{requestSummary.quoted}</p>
					</div>
					<div class="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 px-3 py-2">
						<p class="text-[9px] font-black uppercase tracking-widest text-red-500">Reject/Cancel</p>
						<p class="text-sm font-black text-red-700 dark:text-red-300">{requestSummary.rejectedOrCancelled}</p>
					</div>
				</div>
				<p class="text-[11px] text-zinc-500">
					Menampilkan {filteredRequests.length} dari {requests.length} request.
				</p>
			</div>

			{#if filteredRequests.length === 0}
				<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 p-16 text-center" in:fade>
					<p class="text-xl font-black text-zinc-400 dark:text-zinc-600">
						Tidak ada request yang cocok dengan filter
					</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each filteredRequests as request (request.id)}
						<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8" in:scale={{ start: 0.98, duration: 220 }}>
							<div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
								<div class="space-y-4 flex-1">
									<div class="flex flex-wrap items-center gap-3">
										<span class="text-sm font-black text-brand-charcoal dark:text-white">{request.requestNumber}</span>
										<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {statusColor(request.status)}">{statusLabel(request.status)}</span>
										<span class="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider">Data Database Lokal</span>
									</div>

									<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Paket</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">{request.packageName}</p>
											<p class="text-[11px] text-zinc-500">ID: {request.packageId}</p>
										</div>
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pemesan</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">{request.customerName}</p>
											<p class="text-[11px] text-zinc-500">{request.whatsapp}</p>
										</div>
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tanggal Acara</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">{formatDate(request.eventDate)}</p>
										</div>
									</div>

									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Jumlah Pax</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">{request.pax}</p>
										</div>
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Dibuat</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">{formatDate(request.createdAt)}</p>
										</div>
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estimasi Harga</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">
												{request.estimatedPrice === null ? '-' : formatPrice(request.estimatedPrice)}
											</p>
										</div>
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Direview</p>
											<p class="text-sm font-bold text-brand-charcoal dark:text-white">
												{request.reviewedAt ? formatDate(request.reviewedAt) : '-'}
											</p>
										</div>
										<div class="md:col-span-2">
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lokasi / Acara</p>
											<p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{request.location}</p>
										</div>
										<div class="md:col-span-2">
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Kebutuhan</p>
											<p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{request.notes || '-'}</p>
										</div>
										<div class="md:col-span-2">
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Admin</p>
											<p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{request.adminNote || '-'}</p>
										</div>
									</div>
								</div>

								<div class="lg:min-w-[300px] space-y-3">
									<div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 space-y-3">
										<p class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Review Request</p>
										<div>
											<label for={`status-${request.id}`} class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Status</label>
											<select
												id={`status-${request.id}`}
												value={reviewDraftById[request.id]?.status ?? normalizeReviewStatus(request.status)}
												disabled={reviewSavingId !== null}
												onchange={(event) => setDraftStatus(request.id, (event.currentTarget as HTMLSelectElement).value)}
												class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 disabled:opacity-60"
											>
												{#each reviewStatuses as item}
													<option value={item.value}>{item.label}</option>
												{/each}
											</select>
										</div>
										<div>
											<label for={`estimated-${request.id}`} class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Estimasi Harga</label>
											<input
												id={`estimated-${request.id}`}
												type="number"
												min="0"
												step="1"
												value={reviewDraftById[request.id]?.estimatedPrice ?? ''}
												disabled={reviewSavingId !== null}
												oninput={(event) => setDraftEstimatedPrice(request.id, (event.currentTarget as HTMLInputElement).value)}
												class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 disabled:opacity-60"
												placeholder="Contoh: 2500000"
											/>
										</div>
										<div>
											<label for={`note-${request.id}`} class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Catatan Admin</label>
											<textarea
												id={`note-${request.id}`}
												rows="2"
												disabled={reviewSavingId !== null}
												oninput={(event) => setDraftAdminNote(request.id, (event.currentTarget as HTMLTextAreaElement).value)}
												class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 disabled:opacity-60 resize-none"
												placeholder="Contoh: butuh konfirmasi jumlah pax final H-2."
											>{reviewDraftById[request.id]?.adminNote ?? ''}</textarea>
										</div>
										<button
											type="button"
											disabled={reviewSavingId !== null}
											onclick={() => saveReview(request)}
											class="w-full px-5 py-2.5 bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
										>
											{reviewSavingId === request.id ? 'Menyimpan Review...' : 'Simpan Review'}
										</button>
									</div>

									<button
										type="button"
										disabled
										class="w-full px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 dark:border-zinc-700 opacity-70 cursor-not-allowed"
									>
										Review Request (Hold)
									</button>
									<button
										type="button"
										disabled
										class="w-full px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 dark:border-zinc-700 opacity-70 cursor-not-allowed"
									>
										Buat Quote (Hold)
									</button>
									<button
										type="button"
										disabled
										class="w-full px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 dark:border-zinc-700 opacity-70 cursor-not-allowed"
									>
										Convert ke Order (Hold)
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

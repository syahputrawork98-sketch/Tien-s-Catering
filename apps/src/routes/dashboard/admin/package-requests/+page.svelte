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
		createdAt: string;
		updatedAt: string;
	};

	type PackageRequestApiResponse = {
		items?: unknown;
		message?: string;
	};

	let loading = $state(true);
	let error = $state('');
	let requests = $state<AdminPackageRequest[]>([]);

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
		} catch {
			error = 'Gagal terhubung ke server. Silakan coba lagi.';
			requests = [];
		} finally {
			loading = false;
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
			Daftar request paket dari database lokal. Aksi review/quote/approve/convert masih Hold.
		</p>
	</header>

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
		<div class="space-y-4" in:fade={{ delay: 120 }}>
			{#each requests as request (request.id)}
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
								<div class="md:col-span-2">
									<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lokasi / Acara</p>
									<p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{request.location}</p>
								</div>
								<div class="md:col-span-2">
									<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Kebutuhan</p>
									<p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{request.notes || '-'}</p>
								</div>
							</div>
						</div>

						<div class="lg:min-w-[220px] space-y-3">
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

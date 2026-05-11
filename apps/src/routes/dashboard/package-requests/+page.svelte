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

	type CustomerPackageRequest = {
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

	let loading = $state(true);
	let error = $state('');
	let requests = $state<CustomerPackageRequest[]>([]);

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

	function normalizeRequest(raw: unknown): CustomerPackageRequest | null {
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
				.filter((item): item is CustomerPackageRequest => item !== null);
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
			<span class="text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Visibility Request Paket</span>
		</div>
		<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">
			Request Paket Saya
		</h1>
		<p class="text-zinc-500 font-medium mt-2">
			Pantau status permintaan paket catering Anda. Perubahan menjadi order tetap Hold.
		</p>
	</header>

	{#if loading}
		<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-10 shadow-sm" in:fade>
			<div class="flex items-center gap-4">
				<div class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
				<p class="text-sm font-bold text-zinc-500">Memuat riwayat request paket...</p>
			</div>
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
			<p class="text-2xl font-black text-zinc-300 dark:text-zinc-700 italic tracking-tighter">Belum ada request paket</p>
			<p class="text-zinc-500 mt-2 font-medium">Request paket yang Anda buat melalui halaman Katalog akan muncul di sini.</p>
			<a 
				href="/katalog" 
				class="inline-block mt-8 px-10 py-4 bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
			>
				Lihat Katalog Paket
			</a>
		</div>
	{:else}
		<div class="space-y-6" in:fade={{ delay: 120 }}>
			<div class="grid grid-cols-1 gap-6">
				{#each requests as request (request.id)}
					<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8 group hover:border-brand-primary/30 transition-all">
						<div class="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
							<div class="space-y-6 flex-1">
								<div class="flex flex-wrap items-center gap-3">
									<span class="text-lg font-black text-brand-charcoal dark:text-white tracking-tighter">#{request.requestNumber}</span>
									<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {statusColor(request.status)}">
										{statusLabel(request.status)}
									</span>
									<span class="px-3 py-1 rounded-full text-[9px] font-black bg-zinc-50 dark:bg-zinc-800 text-zinc-400 uppercase tracking-widest border border-zinc-100 dark:border-zinc-700">Simulasi Lokal</span>
								</div>

								<div class="space-y-1">
									<h2 class="text-2xl font-black text-brand-charcoal dark:text-white italic leading-none">{request.packageName}</h2>
									<p class="text-sm font-bold text-zinc-500">ID Paket: {request.packageId}</p>
								</div>

								<div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-zinc-50 dark:border-zinc-800">
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tanggal Acara</p>
										<p class="text-sm font-bold text-brand-primary">{formatDate(request.eventDate)}</p>
									</div>
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Jumlah Peserta</p>
										<p class="text-sm font-bold text-zinc-600 dark:text-zinc-300">{request.pax} Pax</p>
									</div>
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Dibuat Pada</p>
										<p class="text-sm font-bold text-zinc-600 dark:text-zinc-300">{formatDate(request.createdAt)}</p>
									</div>
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estimasi Harga</p>
										<p class="text-sm font-black text-brand-charcoal dark:text-white italic">
											{request.estimatedPrice === null ? 'Menunggu Review' : formatPrice(request.estimatedPrice)}
										</p>
									</div>
								</div>

								<div class="space-y-4">
									<div>
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Lokasi Acara</p>
										<div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
											<p class="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">{request.location}</p>
										</div>
									</div>
									
									{#if request.notes}
										<div>
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Catatan Anda</p>
											<div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
												<p class="text-xs font-medium text-zinc-600 dark:text-zinc-300 italic">"{request.notes}"</p>
											</div>
										</div>
									{/if}

									{#if request.adminNote}
										<div in:fade>
											<p class="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2">Catatan Admin</p>
											<div class="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/20">
												<p class="text-xs font-bold text-brand-charcoal dark:text-zinc-200 leading-relaxed">"{request.adminNote}"</p>
												{#if request.reviewedAt}
													<p class="text-[9px] text-brand-primary/60 font-black mt-2 uppercase">Direview pada {formatDate(request.reviewedAt)}</p>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							</div>

							<div class="lg:w-64 space-y-4">
								<div class="p-6 bg-zinc-50 dark:bg-zinc-800/80 rounded-[2rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
									<div class="text-center space-y-1">
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Alur Selanjutnya</p>
										<p class="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 italic">Review & Penawaran</p>
									</div>
									<div class="space-y-3">
										<div class="flex items-center gap-3 opacity-40 grayscale">
											<div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-black">1</div>
											<p class="text-[10px] font-bold">Penawaran Final</p>
										</div>
										<div class="flex items-center gap-3 opacity-40 grayscale">
											<div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-black">2</div>
											<p class="text-[10px] font-bold">Bayar DP / Lunas</p>
										</div>
										<div class="flex items-center gap-3 opacity-40 grayscale">
											<div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-black">3</div>
											<p class="text-[10px] font-bold">Proses Order</p>
										</div>
									</div>
								</div>
								
								<button 
									disabled
									class="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-70"
								>
									Convert ke Order (Hold)
								</button>
								<p class="text-[9px] font-bold text-zinc-400 text-center uppercase tracking-tighter italic">
									Hubungi CS untuk percepatan review paket.
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

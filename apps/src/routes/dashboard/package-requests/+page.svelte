<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.svelte';
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
		convertedOrderId: string | null;
		userId?: string | null;
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
			convertedOrderId: getString(raw.convertedOrderId) || null,
			userId: getString(raw.userId) || null,
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

	async function loadPackageRequests() {
		loading = true;
		error = '';

		try {
			const query = authStore.isAuthenticated ? `?userId=${authStore.user?.id}` : '';
			const response = await fetch(`/api/package-requests${query}`);

			if (response.status === 401) {
				error = 'Sesi Anda telah berakhir. Silakan pilih kembali akun melalui Persona Switcher.';
				authStore.handleUnauthorized();
				return;
			}

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
				.filter((item): item is CustomerPackageRequest => item !== null)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
		<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/5 rounded-full mb-4">
			<span class="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
			<span class="text-[10px] font-black text-brand-primary uppercase tracking-widest">Local SQLite Database Simulation</span>
		</div>
		<h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">
			Request <span class="text-brand-primary">Paket</span> Saya 🍱
		</h1>
		<p class="text-zinc-500 font-medium mt-2 max-w-2xl">
			Pantau status permintaan paket catering Anda. Harap diperhatikan bahwa request ini bersifat penawaran awal dan baru akan diproses setelah dikonfirmasi menjadi order resmi.
		</p>
	</header>

	{#if loading}
		<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-20 text-center shadow-sm" in:fade>
			<div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">Menyinkronkan data request...</p>
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
			<div class="text-5xl mb-6 opacity-20 grayscale">🍱</div>
			<p class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter uppercase">Belum ada request aktif</p>
			<p class="text-zinc-500 mt-2 font-medium">Request paket yang Anda buat melalui katalog menu akan muncul di sini untuk proses review admin.</p>
			<a 
				href="/katalog" 
				class="inline-block mt-8 px-10 py-5 bg-brand-charcoal text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-brand-primary transition-all"
			>
				Pilih Paket Sekarang
			</a>
		</div>
	{:else}
		<div class="space-y-8" in:fade={{ delay: 120 }}>
			<div class="grid grid-cols-1 gap-8">
				{#each requests as request (request.id)}
					<div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:border-brand-primary/20 transition-all">
						<div class="flex flex-col lg:flex-row lg:items-stretch">
							<div class="flex-1 p-10 space-y-8">
								<div class="flex flex-wrap items-center gap-3">
									<span class="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] {statusColor(request.status)}">
										{statusLabel(request.status)}
									</span>
									<span class="px-5 py-2 rounded-full text-[9px] font-black bg-zinc-50 dark:bg-zinc-800 text-zinc-400 uppercase tracking-widest border border-zinc-100 dark:border-zinc-700 italic">#{request.requestNumber}</span>
									{#if !request.userId}
										<span class="px-3 py-1.5 rounded-full text-[8px] font-black bg-orange-100 text-orange-600 border border-orange-200 uppercase tracking-widest">
											Demo Data
										</span>
									{/if}
								</div>

								<div class="space-y-2">
									<h2 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase group-hover:text-brand-primary transition-colors">{request.packageName}</h2>
									<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID Referensi: {request.packageId}</p>
								</div>

								<div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-zinc-50 dark:border-zinc-800/50">
									<div class="space-y-1">
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">📅 Tanggal Acara</p>
										<p class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">{formatDate(request.eventDate)}</p>
									</div>
									<div class="space-y-1">
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">👥 Peserta</p>
										<p class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">{request.pax} Pax</p>
									</div>
									<div class="space-y-1">
										<p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">📍 Lokasi</p>
										<p class="text-sm font-bold text-zinc-500 truncate max-w-[120px]" title={request.location}>{request.location}</p>
									</div>
									<div class="space-y-1">
										<p class="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">💰 Estimasi Harga</p>
										<p class="text-sm font-black text-brand-primary italic">
											{request.estimatedPrice === null ? 'Tinjauan Admin' : formatPrice(request.estimatedPrice)}
										</p>
									</div>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
									{#if request.notes}
										<div class="space-y-3">
											<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">📝 Catatan Permintaan</p>
											<div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-700/50">
												<p class="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">"{request.notes}"</p>
											</div>
										</div>
									{/if}

									{#if request.adminNote}
										<div class="space-y-3" in:fade>
											<p class="text-[10px] font-black text-brand-primary uppercase tracking-widest">👨‍💼 Balasan Admin</p>
											<div class="p-6 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
												<p class="text-xs font-bold text-brand-charcoal dark:text-zinc-200 leading-relaxed">"{request.adminNote}"</p>
												{#if request.reviewedAt}
													<p class="text-[9px] text-brand-primary/60 font-black mt-4 uppercase tracking-widest">Update pada {formatDate(request.reviewedAt)}</p>
												{/if}
											</div>
										</div>
									{:else}
										<div class="flex items-center justify-center p-10 border-2 border-dashed border-zinc-50 dark:border-zinc-800 rounded-[2.5rem]">
											<p class="text-[10px] font-black text-zinc-300 uppercase tracking-widest text-center italic">Menunggu respon admin...</p>
										</div>
									{/if}
								</div>
							</div>

							<div class="lg:w-80 bg-zinc-50/50 dark:bg-zinc-800/30 border-l border-zinc-50 dark:border-zinc-800/50 p-10 flex flex-col justify-between space-y-10">
								<div class="space-y-6">
									<div class="space-y-1">
										<p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Timeline Progress</p>
										<p class="text-xs font-bold text-zinc-500 italic">Update Status Real-time</p>
									</div>
									
									<div class="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
										<div class="flex gap-4 relative">
											<div class="w-6 h-6 rounded-full {request.status !== 'new' ? 'bg-emerald-500' : 'bg-brand-primary animate-pulse'} z-10 flex items-center justify-center text-[8px] text-white">✓</div>
											<div>
												<p class="text-[10px] font-black uppercase tracking-widest {request.status === 'new' ? 'text-brand-primary' : 'text-zinc-400'}">Permintaan Dikirim</p>
												<p class="text-[9px] font-medium text-zinc-400">{formatDate(request.createdAt)}</p>
											</div>
										</div>
										<div class="flex gap-4 relative">
											<div class="w-6 h-6 rounded-full {(request.status === 'quoted' || request.status === 'converted_to_order') ? 'bg-emerald-500' : (request.status === 'reviewing' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800')} z-10 flex items-center justify-center text-[8px] text-white">✓</div>
											<div>
												<p class="text-[10px] font-black uppercase tracking-widest {request.status === 'reviewing' ? 'text-amber-600' : 'text-zinc-400'}">Proses Peninjauan</p>
												<p class="text-[9px] font-medium text-zinc-400">Tahap Review Harga</p>
											</div>
										</div>
										<div class="flex gap-4 relative">
											<div class="w-6 h-6 rounded-full {request.status === 'converted_to_order' ? 'bg-emerald-500' : (request.status === 'quoted' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800')} z-10 flex items-center justify-center text-[8px] text-white">✓</div>
											<div>
												<p class="text-[10px] font-black uppercase tracking-widest {request.status === 'quoted' ? 'text-indigo-600' : 'text-zinc-400'}">Penawaran Final</p>
												<p class="text-[9px] font-medium text-zinc-400">Siap Jadi Order</p>
											</div>
										</div>
									</div>
								</div>
								
								<div class="space-y-4">
									{#if request.status === 'converted_to_order' || request.convertedOrderId}
										<div class="space-y-3">
											<div class="w-full py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-center gap-2">
												<span>✅</span> Sudah Menjadi Order
											</div>
											<a 
												href="/dashboard/orders"
												class="w-full py-4 bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-brand-primary transition-all flex items-center justify-center gap-2"
											>
												🛍️ Lihat Pesanan Resmi
											</a>
										</div>
									{:else}
										<button 
											disabled
											class="w-full py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-70 shadow-inner"
										>
											Convert ke Order (Hold)
										</button>
										<div class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
											<p class="text-[9px] font-black text-zinc-400 uppercase tracking-tighter italic">
												Demo: Perubahan menjadi order tetap Hold sesuai kebijakan local-development.
											</p>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

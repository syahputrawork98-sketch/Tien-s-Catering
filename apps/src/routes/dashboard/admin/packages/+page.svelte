<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	type PackageStatus = 'active' | 'inactive';

	type PackageItem = {
		id: string;
		name: string;
		slug: string;
		description: string;
		category: string;
		packageCategory: string;
		basePrice: number;
		image: string;
		images: string[];
		minPax: number;
		packageItems: string[];
		features: string[];
		suitableFor: string[];
		status: PackageStatus;
		isActive: boolean;
		isAvailable: boolean;
		updatedAt: string;
	};

	type PackageFormState = {
		name: string;
		description: string;
		packageCategory: string;
		basePrice: string;
		minPax: string;
		image: string;
		galleryImageUrls: string;
		packageItems: string;
		features: string;
		suitableFor: string;
		status: PackageStatus;
	};

	type ApiListResponse = {
		items?: unknown;
		message?: unknown;
	};

	type ApiWriteResponse = {
		item?: unknown;
		message?: unknown;
	};

	let packages = $state<PackageItem[]>([]);
	let isLoading = $state(true);
	let loadError = $state('');

	let showForm = $state(false);
	let formMode = $state<'create' | 'edit'>('create');
	let editingPackageId = $state<string | null>(null);
	let formError = $state('');
	let isSubmitting = $state(false);
	let isTogglingId = $state<string | null>(null);
	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'active' | 'inactive'>('all');

	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	let form = $state<PackageFormState>({
		name: '',
		description: '',
		packageCategory: '',
		basePrice: '0',
		minPax: '1',
		image: '',
		galleryImageUrls: '',
		packageItems: '',
		features: '',
		suitableFor: '',
		status: 'inactive'
	});

	function safeString(value: unknown, fallback = ''): string {
		if (typeof value !== 'string') return fallback;
		const normalized = value.trim();
		return normalized.length > 0 ? normalized : fallback;
	}

	function safeNumber(value: unknown, fallback = 0): number {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	function safeBoolean(value: unknown, fallback = false): boolean {
		if (typeof value === 'boolean') return value;
		if (typeof value === 'number') return value !== 0;
		if (typeof value === 'string') {
			const normalized = value.trim().toLowerCase();
			if (normalized === 'true' || normalized === '1') return true;
			if (normalized === 'false' || normalized === '0') return false;
		}
		return fallback;
	}

	function toStringList(value: unknown): string[] {
		if (!Array.isArray(value)) return [];
		return value
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	function normalizePackage(raw: unknown, index: number): PackageItem | null {
		if (typeof raw !== 'object' || raw === null) return null;
		const record = raw as Record<string, unknown>;
		const category = safeString(record.category, 'Paket');
		const status = safeString(record.status, safeBoolean(record.isActive, true) ? 'active' : 'inactive');
		const normalizedStatus: PackageStatus = status === 'inactive' ? 'inactive' : 'active';
		const image = safeString(record.image, '/images/placeholder-package.jpg');
		const images = toStringList(record.images);

		return {
			id: safeString(record.id, `pkg-${index + 1}`),
			name: safeString(record.name, 'Paket Catering'),
			slug: safeString(record.slug, `paket-${index + 1}`),
			description: safeString(record.description, ''),
			category,
			packageCategory: safeString(record.packageCategory, category),
			basePrice: Math.max(0, Math.floor(safeNumber(record.basePrice, 0))),
			image,
			images: images.length > 0 ? images : [image],
			minPax: Math.max(1, Math.floor(safeNumber(record.minPax, 1))),
			packageItems: toStringList(record.packageItems),
			features: toStringList(record.features),
			suitableFor: toStringList(record.suitableFor),
			status: normalizedStatus,
			isActive: safeBoolean(record.isActive, normalizedStatus === 'active'),
			isAvailable: safeBoolean(record.isAvailable, true),
			updatedAt: safeString(record.updatedAt, '')
		};
	}

	async function loadPackages() {
		isLoading = true;
		loadError = '';

		try {
			const response = await fetch('/api/packages');

			if (response.status === 401) {
				loadError = 'Sesi Anda telah berakhir. Silakan pilih kembali akun melalui Persona Switcher.';
				authStore.handleUnauthorized();
				return;
			}

			const payload = (await response.json().catch(() => null)) as ApiListResponse | null;

			if (!response.ok) {
				const message = safeString(payload?.message, 'Gagal mengambil data paket.');
				throw new Error(message);
			}

			if (!Array.isArray(payload?.items)) {
				throw new Error('Format data paket tidak valid.');
			}

			packages = payload.items
				.map((item, index) => normalizePackage(item, index))
				.filter((item): item is PackageItem => item !== null);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Gagal mengambil data paket.';
			packages = [];
		} finally {
			isLoading = false;
		}
	}

	function resetForm() {
		form = {
			name: '',
			description: '',
			packageCategory: '',
			basePrice: '0',
			minPax: '1',
			image: '',
			galleryImageUrls: '',
			packageItems: '',
			features: '',
			suitableFor: '',
			status: 'inactive'
		};
		formError = '';
		editingPackageId = null;
		formMode = 'create';
	}

	function openCreateForm() {
		resetForm();
		showForm = true;
	}

	function openEditForm(item: PackageItem) {
		formMode = 'edit';
		editingPackageId = item.id;
		formError = '';
		form = {
			name: item.name,
			description: item.description,
			packageCategory: item.packageCategory || item.category,
			basePrice: String(item.basePrice),
			minPax: String(item.minPax),
			image: item.image,
			galleryImageUrls: item.images.join('\n'),
			packageItems: item.packageItems.join('\n'),
			features: item.features.join('\n'),
			suitableFor: item.suitableFor.join('\n'),
			status: item.status
		};
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		formError = '';
	}

	function toLineList(value: string): string[] {
		return value
			.split(/\r?\n/)
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	function formatMoney(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(value);
	}

	function statusLabel(status: PackageStatus): string {
		return status === 'active' ? 'Aktif' : 'Nonaktif';
	}

	let filteredPackages = $derived.by(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return packages.filter((item) => {
			const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
			if (!matchesStatus) return false;

			if (!normalizedQuery) return true;
			const haystack = [item.name, item.packageCategory, item.category, item.slug]
				.join(' ')
				.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	});

	function validateFormInput(): string | null {
		if (!form.name.trim()) return 'Nama paket wajib diisi.';
		if (!form.description.trim()) return 'Deskripsi paket wajib diisi.';
		if (!form.packageCategory.trim()) return 'Kategori paket wajib diisi.';

		const basePrice = Number(form.basePrice);
		if (!Number.isFinite(basePrice) || basePrice < 0) {
			return 'Harga mulai dari harus angka >= 0.';
		}

		const minPax = Number(form.minPax);
		if (!Number.isFinite(minPax) || Math.floor(minPax) < 1) {
			return 'Minimal pax harus angka >= 1.';
		}

		if (form.status !== 'active' && form.status !== 'inactive') {
			return 'Status paket harus active atau inactive.';
		}

		return null;
	}

	function buildFormPayload() {
		const category = form.packageCategory.trim();
		return {
			name: form.name.trim(),
			description: form.description.trim(),
			packageCategory: category,
			category,
			basePrice: Math.max(0, Math.floor(Number(form.basePrice))),
			minPax: Math.max(1, Math.floor(Number(form.minPax))),
			image: form.image.trim() || '/images/placeholder-package.jpg',
			images: toLineList(form.galleryImageUrls),
			packageItems: toLineList(form.packageItems),
			features: toLineList(form.features),
			suitableFor: toLineList(form.suitableFor),
			status: form.status
		};
	}

	async function submitForm(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		feedback = null;

		const validationMessage = validateFormInput();
		if (validationMessage) {
			formError = validationMessage;
			return;
		}

		isSubmitting = true;

		try {
			const submitMode = formMode;
			const payload = buildFormPayload();
			const endpoint =
				submitMode === 'create'
					? '/api/packages'
					: `/api/packages/${encodeURIComponent(editingPackageId || '')}`;
			const method = submitMode === 'create' ? 'POST' : 'PATCH';

			const response = await fetch(endpoint, {
				method,
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const body = (await response.json().catch(() => null)) as ApiWriteResponse | null;
			if (!response.ok) {
				formError = safeString(body?.message, 'Aksi package belum berhasil diproses.');
				return;
			}

			showForm = false;
			resetForm();
			await loadPackages();
			feedback = {
				type: 'success',
				message:
					submitMode === 'create'
						? 'Paket berhasil dibuat. Status default Nonaktif.'
						: 'Paket berhasil diperbarui.'
			};
		} catch (error) {
			formError =
				error instanceof Error ? error.message : 'Aksi package belum berhasil diproses. Coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}

	async function toggleStatus(item: PackageItem) {
		isTogglingId = item.id;
		feedback = null;

		try {
			const nextStatus: PackageStatus = item.status === 'active' ? 'inactive' : 'active';
			const response = await fetch(`/api/packages/${encodeURIComponent(item.id)}/status`, {
				method: 'PATCH',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ status: nextStatus })
			});

			const body = (await response.json().catch(() => null)) as ApiWriteResponse | null;
			if (!response.ok) {
				throw new Error(safeString(body?.message, 'Gagal memperbarui status package.'));
			}

			await loadPackages();
			feedback = {
				type: 'success',
				message: `Status paket "${item.name}" diubah ke ${statusLabel(nextStatus)}.`
			};
		} catch (error) {
			feedback = {
				type: 'error',
				message: error instanceof Error ? error.message : 'Gagal memperbarui status package.'
			};
		} finally {
			isTogglingId = null;
		}
	}

	$effect(() => {
		loadPackages();
	});
</script>

<section class="space-y-6">
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight text-brand-charcoal dark:text-white">
				Admin Package Management
			</h1>
			<p class="text-sm text-zinc-500 mt-1">
				Create, update, dan aktif/nonaktif paket catering. Package baru default Nonaktif.
			</p>
		</div>
		<button
			type="button"
			class="rounded-xl bg-brand-charcoal px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-90"
			onclick={openCreateForm}
		>
			Tambah Package
		</button>
	</div>

	{#if feedback}
		<div
			class={`rounded-xl border px-4 py-3 text-sm ${
				feedback.type === 'success'
					? 'border-emerald-200 bg-emerald-50 text-emerald-700'
					: 'border-red-200 bg-red-50 text-red-700'
			}`}
		>
			{feedback.message}
		</div>
	{/if}

	<div class="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
		<div class="grid gap-3 md:grid-cols-[1fr_220px]">
			<div>
				<label for="package-search" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">
					Cari package
				</label>
				<input
					id="package-search"
					class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
					placeholder="Cari nama, kategori, atau slug"
					bind:value={searchQuery}
				/>
			</div>
			<div>
				<label for="package-status-filter" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">
					Filter status
				</label>
				<select
					id="package-status-filter"
					class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
					bind:value={statusFilter}
				>
					<option value="all">Semua</option>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>
		</div>
		<p class="text-xs text-zinc-500">
			Menampilkan {filteredPackages.length} dari {packages.length} package.
		</p>
	</div>

	{#if showForm}
		<form class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4" onsubmit={submitForm}>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="md:col-span-2">
					<label for="pkg-name" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Nama Package</label>
					<input id="pkg-name" class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" bind:value={form.name} />
				</div>
				<div class="md:col-span-2">
					<label for="pkg-description" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Deskripsi</label>
					<textarea
						id="pkg-description"
						class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
						rows="3"
						bind:value={form.description}
					></textarea>
				</div>
				<div>
					<label for="pkg-category" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Kategori Package</label>
					<input
						id="pkg-category"
						class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
						bind:value={form.packageCategory}
						placeholder="Contoh: Prasmanan"
					/>
				</div>
				<div>
					<label for="pkg-status" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Status</label>
					<select
						id="pkg-status"
						class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
						bind:value={form.status}
						disabled={formMode === 'create'}
					>
						<option value="inactive">Inactive</option>
						<option value="active">Active</option>
					</select>
					{#if formMode === 'create'}
						<p class="mt-1 text-xs text-zinc-500">Saat create, status default inactive.</p>
					{/if}
				</div>
				<div>
					<label for="pkg-price" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Harga Mulai Dari</label>
					<input id="pkg-price" class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" type="number" min="0" bind:value={form.basePrice} />
				</div>
				<div>
					<label for="pkg-min-pax" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Minimal Pax</label>
					<input id="pkg-min-pax" class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" type="number" min="1" bind:value={form.minPax} />
				</div>
				<div class="md:col-span-2">
					<label for="pkg-main-image" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Main Image URL</label>
					<input
						id="pkg-main-image"
						class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
						placeholder="https://..."
						bind:value={form.image}
					/>
				</div>
				<div class="md:col-span-2">
					<label for="pkg-gallery-images" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Gallery Image URLs (satu URL per baris)</label>
					<textarea
						id="pkg-gallery-images"
						class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
						rows="4"
						placeholder="https://image-1.example&#10;https://image-2.example"
						bind:value={form.galleryImageUrls}
					></textarea>
				</div>
				<div>
					<label for="pkg-items" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Package Items (satu per baris)</label>
					<textarea id="pkg-items" class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows="4" bind:value={form.packageItems}></textarea>
				</div>
				<div>
					<label for="pkg-features" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Features (satu per baris)</label>
					<textarea id="pkg-features" class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows="4" bind:value={form.features}></textarea>
				</div>
				<div class="md:col-span-2">
					<label for="pkg-suitable-for" class="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Suitable For (satu per baris)</label>
					<textarea id="pkg-suitable-for" class="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows="3" bind:value={form.suitableFor}></textarea>
				</div>
			</div>

			{#if formError}
				<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{formError}
				</div>
			{/if}

			<div class="flex flex-wrap gap-3">
				<button
					type="submit"
					class="rounded-xl bg-brand-charcoal px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-60"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Menyimpan...' : formMode === 'create' ? 'Simpan Package Baru' : 'Simpan Perubahan'}
				</button>
				<button
					type="button"
					class="rounded-xl border border-zinc-300 px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-600"
					onclick={closeForm}
					disabled={isSubmitting}
				>
					Batal
				</button>
			</div>
		</form>
	{/if}

	{#if isLoading}
		<div class="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">Memuat data package...</div>
	{:else if loadError}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError}</div>
	{:else if packages.length === 0}
		<div class="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
			Belum ada data package.
		</div>
	{:else if filteredPackages.length === 0}
		<div class="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
			Tidak ada package yang cocok dengan filter saat ini.
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filteredPackages as item (item.id)}
				<article class="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
					<div class="mb-3 flex items-start justify-between gap-3">
						<div>
							<h2 class="text-sm font-black text-brand-charcoal">{item.name}</h2>
							<p class="mt-1 text-xs text-zinc-500">{item.packageCategory || item.category}</p>
						</div>
						<span
							class={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
								item.status === 'active'
									? 'bg-emerald-100 text-emerald-700'
									: 'bg-zinc-100 text-zinc-600'
							}`}
						>
							{statusLabel(item.status)}
						</span>
					</div>

					{#if item.image}
						<img src={item.image} alt={item.name} class="mb-3 h-28 w-full rounded-xl object-cover" />
					{/if}

					<p class="text-xs text-zinc-600 line-clamp-2 mb-3">{item.description}</p>
					<div class="space-y-1 text-xs text-zinc-600">
						<p><span class="font-bold">Harga:</span> {formatMoney(item.basePrice)}</p>
						<p><span class="font-bold">Min Pax:</span> {item.minPax}</p>
						<p><span class="font-bold">Slug:</span> {item.slug}</p>
					</div>

					<div class="mt-4 flex flex-wrap gap-2">
						<button
							type="button"
							class="rounded-lg border border-zinc-300 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-600"
							onclick={() => openEditForm(item)}
						>
							Edit
						</button>
						<button
							type="button"
							class={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white ${
								item.status === 'active' ? 'bg-zinc-600' : 'bg-emerald-600'
							} disabled:opacity-60`}
							onclick={() => toggleStatus(item)}
							disabled={isTogglingId === item.id}
						>
							{isTogglingId === item.id
								? 'Memproses...'
								: item.status === 'active'
									? 'Nonaktifkan'
									: 'Aktifkan'}
						</button>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

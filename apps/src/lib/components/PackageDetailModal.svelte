<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { mockBusinessProfile } from '$lib/mock/business';

	let { isOpen = false, pkg = null, onClose = () => {} } = $props<{
		isOpen: boolean;
		pkg: any;
		onClose: () => void;
	}>();

	type PackageRequestForm = {
		customerName: string;
		whatsapp: string;
		eventDate: string;
		pax: string;
		eventLocation: string;
		specialNotes: string;
	};

	type PackageRequestSummary = {
		requestId: string;
		packageId: string;
		packageName: string;
		basePrice: number;
		customerName: string;
		whatsapp: string;
		eventDate: string;
		pax: number;
		eventLocation: string;
		specialNotes: string;
		submittedAt: string;
		source: 'ui-only';
	};

	const REQUEST_STORAGE_KEY = 'lastPackageRequest';

	const createEmptyForm = (): PackageRequestForm => ({
		customerName: '',
		whatsapp: '',
		eventDate: '',
		pax: '',
		eventLocation: '',
		specialNotes: ''
	});

	let requestForm = $state<PackageRequestForm>(createEmptyForm());
	let submitError = $state('');
	let validationError = $state('');
	let submitSuccess = $state<PackageRequestSummary | null>(null);
	let isSubmitting = $state(false);
	let activePackageId = $state<string | null>(null);

	$effect(() => {
		if (!isOpen || !pkg?.id) {
			activePackageId = null;
			return;
		}

		if (activePackageId !== pkg.id) {
			resetRequestState();
			activePackageId = pkg.id;
		}
	});

	function formatPrice(val: number | string) {
		const parsedVal = typeof val === 'string' ? parseFloat(val) : val;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(parsedVal);
	}

	function getTodayDateString() {
		const date = new Date();
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
		return date.toISOString().slice(0, 10);
	}

	const minEventDate = getTodayDateString();

	function sanitizeWhatsapp(value: string) {
		return value.replace(/\s+/g, '').replace(/-/g, '');
	}

	function formatDateLabel(value: string) {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return value;
		}
		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	function validateRequest() {
		if (!requestForm.customerName.trim()) {
			return 'Nama pemesan wajib diisi.';
		}

		const whatsapp = sanitizeWhatsapp(requestForm.whatsapp);
		if (!whatsapp) {
			return 'Nomor WhatsApp wajib diisi.';
		}
		if (!/^\+?\d{9,15}$/.test(whatsapp)) {
			return 'Format nomor WhatsApp belum valid.';
		}

		if (!requestForm.eventDate) {
			return 'Tanggal acara wajib diisi.';
		}

		const pax = Number(requestForm.pax);
		if (!Number.isFinite(pax) || pax <= 0) {
			return 'Jumlah pax harus lebih dari 0.';
		}
		if (pkg?.minPax && pax < pkg.minPax) {
			return `Jumlah pax minimal untuk paket ini adalah ${pkg.minPax}.`;
		}

		if (!requestForm.eventLocation.trim()) {
			return 'Lokasi/acara wajib diisi.';
		}

		if (!requestForm.specialNotes.trim()) {
			return 'Catatan kebutuhan wajib diisi. Jika tidak ada, isi dengan "-".';
		}

		return null;
	}

	function persistRequest(summary: PackageRequestSummary) {
		if (typeof window === 'undefined') {
			return;
		}
		try {
			sessionStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(summary));
		} catch (error) {
			console.error('Gagal menyimpan request paket ke sessionStorage', error);
		}
	}

	function resetRequestState() {
		requestForm = createEmptyForm();
		submitError = '';
		validationError = '';
		submitSuccess = null;
		isSubmitting = false;
	}

	async function handleRequestSubmit(event: SubmitEvent) {
		event.preventDefault();

		validationError = '';
		submitError = '';

		const validationMessage = validateRequest();
		if (validationMessage) {
			validationError = validationMessage;
			return;
		}

		isSubmitting = true;

		try {
			const summary: PackageRequestSummary = {
				requestId: `PKG-${Date.now()}`,
				packageId: pkg.id,
				packageName: pkg.name,
				basePrice: pkg.basePrice,
				customerName: requestForm.customerName.trim(),
				whatsapp: sanitizeWhatsapp(requestForm.whatsapp),
				eventDate: requestForm.eventDate,
				pax: Number(requestForm.pax),
				eventLocation: requestForm.eventLocation.trim(),
				specialNotes: requestForm.specialNotes.trim(),
				submittedAt: new Date().toISOString(),
				source: 'ui-only'
			};

			persistRequest(summary);
			submitSuccess = summary;
		} catch (error) {
			console.error('Gagal memproses request paket', error);
			submitError = 'Request belum berhasil diproses. Coba lagi beberapa saat.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if isOpen && pkg}
	<!-- Overlay -->
	<div 
		class="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-md"
		transition:fade
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="-1"
	>
		<!-- Panel -->
		<div 
			class="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative flex flex-col md:flex-row"
			transition:fly={{ y: 50, duration: 500 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="none"
		>
			<!-- Close Button -->
			<button 
				type="button"
				aria-label="Tutup detail paket"
				onclick={onClose}
				class="absolute top-6 right-6 w-12 h-12 bg-white/90 hover:bg-white text-brand-charcoal rounded-full flex items-center justify-center shadow-2xl transition-all z-[160] hover:rotate-90 active:scale-90"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Detail Sidebar (Image/Info) -->
			<div class="md:w-2/5 bg-brand-charcoal p-10 text-white flex flex-col justify-between overflow-hidden relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] -mr-32 -mt-32"></div>
                
                <div class="relative z-10">
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-4 block">Premium Service</span>
                    <h2 class="text-4xl font-black mb-6 tracking-tighter uppercase leading-none">{pkg.name}</h2>
                    <p class="text-zinc-400 text-sm leading-relaxed mb-8">
                        {pkg.description}
                    </p>
                </div>

                <div class="relative z-10 space-y-4">
                    <div class="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <p class="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Mulai Dari</p>
                        <p class="text-2xl font-black text-brand-primary">{formatPrice(pkg.basePrice)}</p>
                    </div>
                </div>
			</div>

			<!-- Detail Content -->
			<div class="p-10 md:w-3/5 overflow-y-auto max-h-[80vh] no-scrollbar">
                <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 pb-4 border-b border-zinc-100">Apa yang Anda dapatkan?</h3>
                
                <div class="space-y-6 mb-12">
                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-charcoal">Menu Utama Pilihan</p>
                            <p class="text-xs text-zinc-500">Pilihan 5-8 menu utama mulai dari hidangan Nusantara hingga Internasional.</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-charcoal">Layanan Pramusaji</p>
                            <p class="text-xs text-zinc-500">Tim pramusaji profesional siap melayani tamu Anda selama acara berlangsung.</p>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-brand-charcoal">Peralatan Lengkap</p>
                            <p class="text-xs text-zinc-500">Termasuk alat makan, buffet set premium, dan meja display yang elegan.</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-10">
                    <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Min. Order</p>
                        <p class="font-bold text-brand-charcoal">{pkg.minPax || 20} Porsi</p>
                    </div>
                    <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Area Layanan</p>
                        <p class="font-bold text-brand-charcoal">Bandung & Sekitarnya</p>
                    </div>
                </div>

                <div class="mb-8 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2">Harga Mulai Dari</p>
                    <p class="text-xs text-zinc-600 leading-relaxed">
                        Harga paket bersifat estimasi awal. Total akhir akan dikonfirmasi admin setelah review tanggal acara, jumlah pax, lokasi, dan kebutuhan khusus.
                    </p>
                </div>

				{#if submitSuccess}
					<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-4 space-y-3">
						<p class="text-xs font-black uppercase tracking-wider text-emerald-700">Request Paket Terkirim</p>
						<p class="text-sm text-emerald-900">
							Request untuk <span class="font-bold">{submitSuccess.packageName}</span> sudah dicatat.
						</p>
						<div class="text-xs text-emerald-800 space-y-1">
							<p><span class="font-bold">ID Request:</span> {submitSuccess.requestId}</p>
							<p><span class="font-bold">Tanggal Acara:</span> {formatDateLabel(submitSuccess.eventDate)}</p>
							<p><span class="font-bold">Jumlah Pax:</span> {submitSuccess.pax}</p>
						</div>
						<p class="text-[11px] text-emerald-800">
							Tim admin akan review request ini terlebih dahulu. Request paket belum masuk cart, checkout, atau order.
						</p>
					</div>
					<button
						type="button"
						onclick={resetRequestState}
						class="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all"
					>
						Ajukan Request Paket Lain
					</button>
				{:else}
					<form class="space-y-4 mb-4" onsubmit={handleRequestSubmit}>
						<div>
							<label for="package-request-name" class="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nama Pemesan</label>
							<input
								id="package-request-name"
								type="text"
								bind:value={requestForm.customerName}
								placeholder="Contoh: Budi Santoso"
								class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								required
							/>
						</div>
						<div>
							<label for="package-request-whatsapp" class="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">WhatsApp</label>
							<input
								id="package-request-whatsapp"
								type="tel"
								bind:value={requestForm.whatsapp}
								placeholder="Contoh: 081234567890"
								class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								required
							/>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="package-request-date" class="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tanggal Acara</label>
								<input
									id="package-request-date"
									type="date"
									bind:value={requestForm.eventDate}
									min={minEventDate}
									class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									required
								/>
							</div>
							<div>
								<label for="package-request-pax" class="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Jumlah Pax</label>
								<input
									id="package-request-pax"
									type="number"
									min={pkg.minPax || 1}
									step="1"
									bind:value={requestForm.pax}
									placeholder={`Min ${pkg.minPax || 1}`}
									class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									required
								/>
							</div>
						</div>
						<div>
							<label for="package-request-location" class="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Lokasi/Acara</label>
							<input
								id="package-request-location"
								type="text"
								bind:value={requestForm.eventLocation}
								placeholder="Contoh: Dinas Kominfo Lt. 2, Ruang Rapat Utama"
								class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								required
							/>
						</div>
						<div>
							<label for="package-request-notes" class="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Catatan Kebutuhan</label>
							<textarea
								id="package-request-notes"
								rows="3"
								bind:value={requestForm.specialNotes}
								placeholder="Contoh: Tanpa kacang, butuh opsi vegetarian, atau tulis '-' jika tidak ada."
								class="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none resize-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
								required
							></textarea>
						</div>

						{#if validationError}
							<p class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
								{validationError}
							</p>
						{/if}

						{#if submitError}
							<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
								{submitError}
							</p>
						{/if}

						<button
							type="submit"
							disabled={isSubmitting}
							class="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'Mengirim Request...' : 'Ajukan Request Paket'}
						</button>
					</form>
				{/if}

				<a
					href={mockBusinessProfile.whatsappUrl}
					target="_blank"
					rel="noreferrer"
					class="w-full bg-zinc-50 text-brand-charcoal py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-zinc-100 hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
				>
					<svg class="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
					</svg>
					Konsultasi via WhatsApp
				</a>
				<p class="mt-3 text-[10px] text-zinc-400 leading-relaxed">
					Alur ini masih UI-only. Request paket belum masuk cart, checkout, atau order database.
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>

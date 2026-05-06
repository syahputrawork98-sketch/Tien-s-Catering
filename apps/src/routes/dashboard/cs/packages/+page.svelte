<script lang="ts">
    import { mockCatalogPackages, type CatalogItem } from '$lib/mock/catalog';
    import { mockPackageCategories, getActivePackageCategories } from '$lib/mock/packageCategories';
    import { fade, fly, scale } from 'svelte/transition';
    import Modal from '$lib/components/ui/Modal.svelte';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

    const TODAY = '2026-05-06';
    
    // Local state
    let packages = $state<CatalogItem[]>([...mockCatalogPackages]);
    let categories = $state(mockPackageCategories.filter(c => c.status === 'active'));
    
    let activeTab = $state('SEMUA');

    // Modal state
    let showAddModal = $state(false);
    let showDetailModal = $state(false);
    let showEditModal = $state(false);
    let selectedPackage = $state<CatalogItem | null>(null);

    let packageForm = $state({
        id: '',
        name: '',
        category: '',
        price: 0,
        minPax: 1,
        status: 'active',
        suitableFor: '',
        features: '',
        packageItems: '',
        description: '',
        image: ''
    });
    let formErrors = $state<Record<string, string>>({});

    // Dynamic tabs from active categories
    const tabs = $derived([
        { id: 'SEMUA', label: 'Semua Paket' },
        ...categories.map(c => ({ id: c.name, label: c.name }))
    ]);

    const stats = $derived({
        total: packages.length,
        active: packages.filter(p => p.isActive).length,
        inactive: packages.filter(p => !p.isActive).length,
        categoriesCount: categories.length
    });

    const filteredPackages = $derived(
        packages.filter(p => {
            if (activeTab === 'SEMUA') return true;
            return (p.packageCategory ?? p.category) === activeTab;
        })
    );

    function getCount(tabId: string) {
        if (tabId === 'SEMUA') return packages.length;
        return packages.filter(p => (p.packageCategory ?? p.category) === tabId).length;
    }

    function toggleActive(id: string) {
        packages = packages.map(p => {
            if (p.id === id) {
                const newState = !p.isActive;
                return { 
                    ...p, 
                    isActive: newState,
                    status: newState ? 'active' as const : 'inactive' as const
                };
            }
            return p;
        });
    }

    function openAddModal() {
        if (categories.length === 0) {
            alert('Belum ada kategori paket aktif. Hubungi Admin.');
            return;
        }
        packageForm = {
            id: '',
            name: '',
            category: categories[0].name,
            price: 0,
            minPax: 1,
            status: 'active',
            suitableFor: '',
            features: '',
            packageItems: '',
            description: '',
            image: ''
        };
        formErrors = {};
        showAddModal = true;
    }

    function handleDetail(pkg: CatalogItem) {
        selectedPackage = { ...pkg };
        showDetailModal = true;
    }

    function handleEdit(pkg: CatalogItem) {
        selectedPackage = { ...pkg };
        packageForm = {
            id: pkg.id,
            name: pkg.name,
            category: pkg.packageCategory || pkg.category || '',
            price: pkg.basePrice,
            minPax: pkg.minPax || 1,
            status: pkg.status as string,
            suitableFor: (pkg.suitableFor || []).join(', '),
            features: (pkg.features || []).join('\n'),
            packageItems: (pkg.packageItems || []).join('\n'),
            description: pkg.description || '',
            image: pkg.image || ''
        };
        formErrors = {};
        showEditModal = true;
        showDetailModal = false;
    }

    function validateForm() {
        const errors: Record<string, string> = {};
        if (!packageForm.name.trim()) errors.name = 'Nama paket wajib diisi';
        if (!packageForm.category) errors.category = 'Kategori wajib dipilih';
        if (packageForm.price <= 0) errors.price = 'Harga mulai dari wajib diisi';
        if (packageForm.minPax <= 0) errors.minPax = 'Minimal pax wajib diisi';
        
        formErrors = errors;
        return Object.keys(errors).length === 0;
    }

    function handleSavePackage() {
        if (!validateForm()) return;

        const newItem: CatalogItem = {
            id: `PKG-${Date.now()}`,
            type: 'package',
            name: packageForm.name,
            slug: packageForm.name.toLowerCase().replace(/\s+/g, '-'),
            description: packageForm.description,
            category: packageForm.category,
            packageCategory: packageForm.category,
            basePrice: packageForm.price,
            minPax: packageForm.minPax,
            isActive: packageForm.status === 'active',
            isAvailable: true,
            status: packageForm.status as any,
            suitableFor: packageForm.suitableFor.split(',').map(s => s.trim()).filter(s => s !== ''),
            features: packageForm.features.split('\n').map(s => s.trim()).filter(s => s !== ''),
            packageItems: packageForm.packageItems.split('\n').map(s => s.trim()).filter(s => s !== ''),
            image: packageForm.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
            createdAt: TODAY,
            updatedAt: TODAY
        };

        packages = [newItem, ...packages];
        showAddModal = false;
    }

    function handleUpdatePackage() {
        if (!validateForm() || !selectedPackage) return;

        packages = packages.map(p => {
            if (p.id === packageForm.id) {
                return {
                    ...p,
                    name: packageForm.name,
                    slug: packageForm.name.toLowerCase().replace(/\s+/g, '-'),
                    description: packageForm.description,
                    category: packageForm.category,
                    packageCategory: packageForm.category,
                    basePrice: packageForm.price,
                    minPax: packageForm.minPax,
                    isActive: packageForm.status === 'active',
                    status: packageForm.status as any,
                    suitableFor: packageForm.suitableFor.split(',').map(s => s.trim()).filter(s => s !== ''),
                    features: packageForm.features.split('\n').map(s => s.trim()).filter(s => s !== ''),
                    packageItems: packageForm.packageItems.split('\n').map(s => s.trim()).filter(s => s !== ''),
                    image: packageForm.image || p.image,
                    updatedAt: TODAY
                };
            }
            return p;
        });

        showEditModal = false;
    }
</script>

<div class="space-y-12 pb-24 relative">
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div in:fly={{ y: -20, duration: 500 }}>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Kelola Paket Catering 🎁</h1>
            <p class="text-zinc-500 font-medium mt-2">Atur paket catering berdasarkan kategori aktif yang ditetapkan Admin.</p>
        </div>
        <div class="flex gap-4" in:fly={{ x: 20, duration: 500 }}>
            <button 
                onclick={openAddModal}
                class="w-full md:w-auto px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Buat Paket Baru
            </button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6" in:fade={{ delay: 200 }}>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Total Paket</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Paket Aktif</p>
            <p class="text-4xl font-black text-emerald-600 italic">{stats.active}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">Nonaktif</p>
            <p class="text-4xl font-black text-red-600 italic">{stats.inactive}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Kategori Aktif</p>
            <p class="text-4xl font-black text-blue-600 italic">{stats.categoriesCount}</p>
        </div>
    </div>

    <!-- Navigation & Tabs -->
    <div class="space-y-8" in:fade={{ delay: 300 }}>
        <div class="flex overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
            <div class="flex gap-3 min-w-max">
                {#each tabs as tab}
                    <button 
                        onclick={() => activeTab = tab.id}
                        class="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4
                        {activeTab === tab.id 
                            ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'}"
                    >
                        {tab.label}
                        {#if getCount(tab.id) > 0}
                            <span class="px-2 py-0.5 rounded-md text-[9px] 
                                {activeTab === tab.id 
                                    ? 'bg-white/20 text-white dark:bg-brand-charcoal/10 dark:text-brand-charcoal' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                                {getCount(tab.id)}
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Package Grid -->
        <div class="min-h-[500px]">
            {#if categories.length === 0}
                <div class="flex flex-col items-center justify-center py-32 px-8 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-red-200 dark:border-red-900/30 text-center" in:fade>
                    <div class="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-8">
                        <span class="text-5xl">⚠️</span>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">
                        Belum ada kategori paket aktif.
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        Hubungi Admin untuk membuat atau mengaktifkan kategori paket terlebih dahulu sebelum mengelola paket.
                    </p>
                </div>
            {:else if filteredPackages.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {#each filteredPackages as pkg (pkg.id)}
                        <div 
                            class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col"
                            in:scale={{ start: 0.95, duration: 400 }}
                        >
                            <div class="relative h-56 overflow-hidden">
                                {#if pkg.image}
                                    <img src={pkg.image} alt={pkg.name} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                {:else}
                                    <div class="w-full h-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-5xl">🎁</div>
                                {/if}
                                <div class="absolute top-6 left-6 flex flex-col gap-2">
                                    <span class="px-4 py-1.5 bg-white/90 backdrop-blur-md dark:bg-zinc-900/90 rounded-full text-[9px] font-black uppercase tracking-widest text-brand-charcoal dark:text-white shadow-lg border border-white/20">
                                        {pkg.packageCategory ?? pkg.category}
                                    </span>
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                <div class="absolute bottom-6 left-8">
                                    <span class="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg">{formatPrice(pkg.basePrice)}<span class="text-sm not-italic opacity-60">/pax</span></span>
                                </div>
                            </div>

                            <div class="p-8 flex flex-col flex-1">
                                <div class="mb-6">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-xl font-black text-brand-charcoal dark:text-white leading-tight">{pkg.name}</h3>
                                        <div class="flex flex-col items-end gap-2">
                                            <button onclick={() => toggleActive(pkg.id)} class="w-10 h-5 rounded-full relative transition-all {pkg.isActive ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}">
                                                <div class="absolute top-1 w-3 h-3 bg-white rounded-full transition-all {pkg.isActive ? 'left-6' : 'left-1'} shadow-sm"></div>
                                            </button>
                                        </div>
                                    </div>
                                    <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{pkg.description}</p>
                                </div>

                                <div class="grid grid-cols-2 gap-4 mt-auto">
                                    <button onclick={() => handleDetail(pkg)} class="py-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-zinc-100 transition-all border border-zinc-100 dark:border-zinc-800">Detail</button>
                                    <button onclick={() => handleEdit(pkg)} class="py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all">Edit Paket</button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-32 px-8 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center" in:fade>
                    <div class="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-8">
                        <span class="text-5xl">📦</span>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">
                        Belum ada paket di kategori ini.
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        Paket akan muncul ketika dibuat menggunakan kategori aktif ini.
                    </p>
                    <button onclick={() => activeTab = 'SEMUA'} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Lihat Semua Paket</button>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Modal Detail -->
<Modal show={showDetailModal} title="Detail Paket Catering 🎁" onClose={() => showDetailModal = false} maxWidth="max-w-4xl">
    {#if selectedPackage}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="space-y-6">
                <div class="aspect-video rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src={selectedPackage.image} alt={selectedPackage.name} class="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 class="text-3xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">{selectedPackage.name}</h2>
                    <span class="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2 inline-block">
                        {selectedPackage.packageCategory ?? selectedPackage.category}
                    </span>
                </div>
                <p class="text-sm font-medium text-zinc-500 leading-relaxed">{selectedPackage.description}</p>
            </div>
            <div class="space-y-6">
                <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                    <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{formatPrice(selectedPackage.basePrice)}</p>
                </div>
                <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Minimal Pax</p>
                    <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{selectedPackage.minPax} Pax</p>
                </div>
                <button onclick={() => handleEdit(selectedPackage!)} class="w-full py-5 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl">Edit Paket Ini</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Modal Add/Edit -->
<Modal show={showAddModal || showEditModal} title={showAddModal ? "Buat Paket Catering Baru 🎁" : "Edit Paket Catering ✏️"} onClose={() => { showAddModal = false; showEditModal = false; }} maxWidth="max-w-3xl">
    <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Paket *</label>
                <input type="text" bind:value={packageForm.name} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
                {#if formErrors.name}<p class="text-[9px] font-bold text-red-500 uppercase tracking-wider">{formErrors.name}</p>{/if}
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori Paket *</label>
                <select bind:value={packageForm.category} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary appearance-none">
                    {#each categories as cat}<option value={cat.name}>{cat.name}</option>{/each}
                </select>
                {#if formErrors.category}<p class="text-[9px] font-bold text-red-500 uppercase tracking-wider">{formErrors.category}</p>{/if}
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harga Mulai Dari *</label>
                <input type="number" bind:value={packageForm.price} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
                {#if formErrors.price}<p class="text-[9px] font-bold text-red-500 uppercase tracking-wider">{formErrors.price}</p>{/if}
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Minimal Pax *</label>
                <input type="number" bind:value={packageForm.minPax} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-2 col-span-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi</label>
                <textarea bind:value={packageForm.description} rows="3" class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
            <div class="space-y-2 col-span-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL Gambar</label>
                <input type="text" bind:value={packageForm.image} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
        </div>
        <div class="flex gap-4 pt-4">
            <button onclick={() => { showAddModal = false; showEditModal = false; }} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase">Batal</button>
            <button onclick={showAddModal ? handleSavePackage : handleUpdatePackage} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal rounded-2xl text-[10px] font-black uppercase shadow-xl">Simpan Paket</button>
        </div>
    </div>
</Modal>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<script lang="ts">
    import { fly, fade, scale } from 'svelte/transition';
    import { mockCatalogItems, type CatalogItem } from '$lib/mock/catalog';
    import Modal from '$lib/components/ui/Modal.svelte';

    type TabType = 'ALL' | 'ACTIVE' | 'DRAFT' | string;

    let packages = $state<(CatalogItem & { adminNote?: string; updatedBy?: string })[]>(
        mockCatalogItems.filter(i => i.type === 'package').map(i => ({ ...i }))
    );

    let activeTab = $state<TabType>('ALL');
    let showDetailModal = $state(false);
    let showEditModal = $state(false);
    let selectedPkg = $state<typeof packages[0] | null>(null);
    let editForm = $state({ name: '', description: '', packageCategory: '', basePrice: 0, minPax: 0, isActive: true, isAvailable: true, image: '', suitableFor: '', features: '', packageItems: '', adminNote: '' });
    let editError = $state('');

    const categories = ['Semua', ...Array.from(new Set(packages.map(p => p.packageCategory ?? p.category)))];

    const filteredPackages = $derived(() => {
        if (activeTab === 'ALL') return packages;
        if (activeTab === 'ACTIVE') return packages.filter(p => p.isActive);
        if (activeTab === 'DRAFT') return packages.filter(p => !p.isActive || p.status === 'draft' || p.status === 'inactive');
        return packages.filter(p => (p.packageCategory ?? p.category) === activeTab);
    });

    const stats = $derived(() => ({
        total: packages.length,
        active: packages.filter(p => p.isActive).length,
        draft: packages.filter(p => !p.isActive || p.status === 'draft').length,
        categories: Array.from(new Set(packages.map(p => p.packageCategory ?? p.category))).length
    }));

    function formatPrice(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    }

    function openDetail(pkg: typeof packages[0]) { selectedPkg = pkg; showDetailModal = true; }

    function openEdit(pkg: typeof packages[0]) {
        selectedPkg = pkg;
        editForm = { name: pkg.name, description: pkg.description, packageCategory: pkg.packageCategory ?? pkg.category, basePrice: pkg.basePrice, minPax: pkg.minPax ?? 0, isActive: pkg.isActive, isAvailable: pkg.isAvailable, image: pkg.image ?? '', suitableFor: (pkg.suitableFor ?? []).join(', '), features: (pkg.features ?? []).join(', '), packageItems: (pkg.packageItems ?? []).join(', '), adminNote: (pkg as any).adminNote ?? '' };
        editError = '';
        showEditModal = true;
    }

    function saveEdit() {
        if (!editForm.name.trim()) { editError = 'Nama paket wajib diisi.'; return; }
        if (editForm.basePrice <= 0) { editError = 'Harga harus lebih dari 0.'; return; }
        if (!selectedPkg) return;
        packages = packages.map(p => p.id === selectedPkg!.id ? {
            ...p,
            name: editForm.name, description: editForm.description,
            packageCategory: editForm.packageCategory, category: editForm.packageCategory,
            basePrice: editForm.basePrice, minPax: editForm.minPax,
            isActive: editForm.isActive, isAvailable: editForm.isAvailable, image: editForm.image,
            suitableFor: editForm.suitableFor.split(',').map(s => s.trim()).filter(Boolean),
            features: editForm.features.split(',').map(s => s.trim()).filter(Boolean),
            packageItems: editForm.packageItems.split(',').map(s => s.trim()).filter(Boolean),
            updatedBy: 'admin', updatedAt: new Date().toISOString().slice(0, 10),
            adminNote: editForm.adminNote
        } : p);
        showEditModal = false;
    }

    function toggleActive(id: string) {
        packages = packages.map(p => p.id === id ? { ...p, isActive: !p.isActive, updatedBy: 'admin', status: !p.isActive ? 'active' : 'inactive' } : p);
    }

    const tabItems = [
        { id: 'ALL', label: 'Semua Paket' },
        { id: 'ACTIVE', label: 'Aktif' },
        { id: 'DRAFT', label: 'Nonaktif' },
        ...Array.from(new Set(packages.map(p => p.packageCategory ?? p.category))).map(c => ({ id: c, label: c }))
    ];
</script>

<div class="space-y-10 pb-24 relative">
    <header in:fly={{ y: -20, duration: 500 }}>
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Control</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Master Paket Catering 🎁</h1>
        <p class="text-zinc-500 font-medium mt-2">Kelola paket catering, harga dasar, kategori acara, dan status publik.</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Paket', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
            { label: 'Paket Aktif', value: stats().active, color: 'text-emerald-600' },
            { label: 'Nonaktif/Draft', value: stats().draft, color: 'text-zinc-500' },
            { label: 'Kategori', value: stats().categories, color: 'text-blue-600' }
        ] as s}
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{s.label}</p>
                <p class="text-3xl font-black {s.color} italic">{s.value}</p>
            </div>
        {/each}
    </div>

    <!-- Tabs -->
    <div class="space-y-8" in:fade={{ delay: 250 }}>
        <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {#each tabItems as tab}
                <button
                    onclick={() => activeTab = tab.id}
                    class="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                    {activeTab === tab.id ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
                >{tab.label}</button>
            {/each}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each filteredPackages() as pkg (pkg.id)}
                <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col" in:scale={{ start: 0.97, duration: 300 }}>
                    <div class="relative h-48">
                        {#if pkg.image}
                            <img src={pkg.image} alt={pkg.name} class="w-full h-full object-cover" />
                        {:else}
                            <div class="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                                <span class="text-5xl">🎁</span>
                            </div>
                        {/if}
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div class="absolute top-4 left-4 flex gap-2">
                            <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase text-brand-charcoal">{pkg.packageCategory ?? pkg.category}</span>
                            {#if (pkg as any).updatedBy === 'admin'}
                                <span class="px-3 py-1 bg-red-500/90 rounded-full text-[9px] font-black uppercase text-white">⚡ Admin</span>
                            {/if}
                        </div>
                        <div class="absolute bottom-4 left-5">
                            <p class="text-xs text-white/70 font-bold">Mulai</p>
                            <p class="text-2xl font-black text-white italic">{formatPrice(pkg.basePrice)}<span class="text-xs not-italic opacity-60">/pax</span></p>
                        </div>
                    </div>

                    <div class="p-6 flex flex-col flex-1 space-y-4">
                        <div class="flex justify-between items-start">
                            <h3 class="text-base font-black text-brand-charcoal dark:text-white leading-tight">{pkg.name}</h3>
                            <div class="flex flex-col items-end gap-1">
                                <span class="text-[9px] font-black {pkg.isActive ? 'text-emerald-500' : 'text-zinc-400'}">{pkg.isActive ? 'Aktif' : 'Nonaktif'}</span>
                                <button onclick={() => toggleActive(pkg.id)} aria-label="Toggle aktif" class="w-10 h-5 rounded-full relative transition-all {pkg.isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}">
                                    <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all {pkg.isActive ? 'left-5' : 'left-0.5'}"></div>
                                </button>
                            </div>
                        </div>

                        {#if pkg.minPax}
                            <p class="text-[10px] font-black text-zinc-400 uppercase">Min. {pkg.minPax} Pax</p>
                        {/if}

                        {#if pkg.suitableFor?.length}
                            <div class="flex flex-wrap gap-1">
                                {#each pkg.suitableFor.slice(0, 3) as tag}
                                    <span class="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-[9px] font-bold text-zinc-400 rounded-lg">#{tag}</span>
                                {/each}
                            </div>
                        {/if}

                        <div class="grid grid-cols-2 gap-2 mt-auto">
                            <button onclick={() => openDetail(pkg)} class="py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl hover:bg-zinc-100 transition-all">Detail</button>
                            <button onclick={() => openEdit(pkg)} class="py-3 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">Edit</button>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="col-span-3 text-center py-20 text-zinc-400 font-black">Tidak ada paket</div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal Detail -->
<Modal show={showDetailModal} title="Detail Master Paket 🎁" onClose={() => showDetailModal = false}>
    {#if selectedPkg}
        <div class="space-y-5">
            {#if selectedPkg.image}
                <img src={selectedPkg.image} alt={selectedPkg.name} class="w-full h-48 object-cover rounded-2xl" />
            {/if}
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nama Paket</p><p class="font-black text-base">{selectedPkg.name}</p></div>
                <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deskripsi</p><p class="text-sm">{selectedPkg.description}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Kategori</p><p class="text-sm font-bold">{selectedPkg.packageCategory ?? selectedPkg.category}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Harga</p><p class="text-sm font-black">{formatPrice(selectedPkg.basePrice)}/pax</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Min. Pax</p><p class="text-sm font-bold">{selectedPkg.minPax ?? '-'}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p><p class="text-sm font-bold">{selectedPkg.isActive ? 'Aktif' : 'Nonaktif'}</p></div>
            </div>
            {#if selectedPkg.features?.length}
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Features</p>
                    <div class="space-y-1">{#each selectedPkg.features as f}<div class="flex items-center gap-2 text-sm"><svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>{f}</div>{/each}</div>
                </div>
            {/if}
            {#if (selectedPkg as any).adminNote}
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                    <p class="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Catatan Admin</p>
                    <p class="text-sm">{(selectedPkg as any).adminNote}</p>
                </div>
            {/if}
        </div>
    {/if}
</Modal>

<!-- Modal Edit -->
<Modal show={showEditModal} title="Edit Master Paket ✏️" onClose={() => showEditModal = false}>
    <div class="space-y-4">
        <div class="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
            <p class="text-[10px] font-bold text-red-600">Perubahan akan dicatat sebagai aksi Admin.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 col-span-2">
                <label for="pName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Paket *</label>
                <input id="pName" type="text" bind:value={editForm.name} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="pCat" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori Paket</label>
                <input id="pCat" type="text" bind:value={editForm.packageCategory} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="pPrice" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harga/Pax (Rp) *</label>
                <input id="pPrice" type="number" bind:value={editForm.basePrice} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="pPax" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Min. Pax</label>
                <input id="pPax" type="number" bind:value={editForm.minPax} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="pDesc" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi</label>
                <textarea id="pDesc" bind:value={editForm.description} rows="2" class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
            <div class="space-y-1 col-span-2">
                <label for="pFeatures" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Features (pisah koma)</label>
                <input id="pFeatures" type="text" bind:value={editForm.features} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="pImg" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL Gambar</label>
                <input id="pImg" type="text" bind:value={editForm.image} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="pNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan Admin</label>
                <textarea id="pNote" bind:value={editForm.adminNote} rows="2" placeholder="Alasan perubahan..." class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
        </div>
        {#if editError}<p class="text-[10px] font-bold text-red-500">{editError}</p>{/if}
        <div class="flex gap-3 pt-2">
            <button onclick={() => showEditModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
            <button onclick={saveEdit} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Simpan</button>
        </div>
    </div>
</Modal>

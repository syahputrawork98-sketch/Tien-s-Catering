<script lang="ts">
    import { fly, fade, scale } from 'svelte/transition';
    import { mockCatalogItems, type CatalogItem } from '$lib/mock/catalog';
    import { mockPackageCategories, type MockPackageCategory, slugifyCategoryName } from '$lib/mock/packageCategories';
    import Modal from '$lib/components/ui/Modal.svelte';

    type TabType = 'ALL_PKG' | 'ACTIVE_PKG' | 'DRAFT_PKG' | 'CATEGORIES';

    // Local state
    let packages = $state<(CatalogItem & { adminNote?: string; updatedBy?: string })[]>(
        mockCatalogItems.filter(i => i.type === 'package').map(i => ({ ...i }))
    );
    let categories = $state<MockPackageCategory[]>(
        mockPackageCategories.map(c => ({ ...c }))
    );

    let activeTab = $state<TabType>('ALL_PKG');
    let categoryFilter = $state('ALL'); // Untuk filter paket berdasarkan kategori

    // Modals
    let showPkgModal = $state(false);
    let showCatModal = $state(false);
    let showDetailModal = $state(false);
    let isEditing = $state(false);
    let selectedPkg = $state<typeof packages[0] | null>(null);
    let selectedCat = $state<MockPackageCategory | null>(null);

    // Forms
    let pkgForm = $state({
        name: '', description: '', packageCategory: '', basePrice: 0, 
        minPax: 0, isActive: true, image: '', suitableFor: '', 
        features: '', packageItems: '', adminNote: ''
    });
    let catForm = $state({
        name: '', description: '', status: 'active' as import('$lib/mock/packageCategories').MockPackageCategoryStatus, adminNote: ''
    });
    let formError = $state('');

    // Derived
    const activeCategories = $derived(categories.filter(c => c.status === 'active'));
    
    const filteredPackages = $derived(() => {
        let res = packages;
        if (activeTab === 'ACTIVE_PKG') res = packages.filter(p => p.isActive);
        else if (activeTab === 'DRAFT_PKG') res = packages.filter(p => !p.isActive);
        
        if (categoryFilter !== 'ALL') {
            res = res.filter(p => (p.packageCategory ?? p.category) === categoryFilter);
        }
        return res;
    });

    const stats = $derived(() => ({
        totalPkg: packages.length,
        activePkg: packages.filter(p => p.isActive).length,
        totalCat: categories.length,
        activeCat: categories.filter(c => c.status === 'active').length
    }));

    function formatPrice(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    }

    // Handlers Paket
    function openAddPkg() {
        isEditing = false;
        pkgForm = { name: '', description: '', packageCategory: activeCategories[0]?.name || '', basePrice: 0, minPax: 0, isActive: true, image: '', suitableFor: '', features: '', packageItems: '', adminNote: '' };
        formError = '';
        showPkgModal = true;
    }

    function openEditPkg(pkg: typeof packages[0]) {
        isEditing = true;
        selectedPkg = pkg;
        pkgForm = { 
            name: pkg.name, description: pkg.description, packageCategory: pkg.packageCategory ?? pkg.category, 
            basePrice: pkg.basePrice, minPax: pkg.minPax ?? 0, isActive: pkg.isActive, 
            image: pkg.image ?? '', suitableFor: (pkg.suitableFor ?? []).join(', '), 
            features: (pkg.features ?? []).join(', '), packageItems: (pkg.packageItems ?? []).join(', '), 
            adminNote: (pkg as any).adminNote ?? '' 
        };
        formError = '';
        showPkgModal = true;
    }

    function savePkg() {
        if (!pkgForm.name.trim()) { formError = 'Nama paket wajib diisi.'; return; }
        if (!pkgForm.packageCategory) { formError = 'Pilih kategori paket.'; return; }
        if (pkgForm.basePrice <= 0) { formError = 'Harga harus lebih dari 0.'; return; }
        if (isEditing && !pkgForm.adminNote.trim()) { formError = 'Catatan admin wajib saat mengedit.'; return; }

        const data = {
            name: pkgForm.name, description: pkgForm.description,
            packageCategory: pkgForm.packageCategory, category: pkgForm.packageCategory,
            basePrice: pkgForm.basePrice, minPax: pkgForm.minPax,
            isActive: pkgForm.isActive, status: pkgForm.isActive ? 'active' : 'inactive' as any,
            image: pkgForm.image,
            suitableFor: pkgForm.suitableFor.split(',').map(s => s.trim()).filter(Boolean),
            features: pkgForm.features.split(',').map(s => s.trim()).filter(Boolean),
            packageItems: pkgForm.packageItems.split(',').map(s => s.trim()).filter(Boolean),
            updatedBy: 'admin', updatedAt: new Date().toISOString().slice(0, 10),
            adminNote: pkgForm.adminNote
        };

        if (isEditing && selectedPkg) {
            packages = packages.map(p => p.id === selectedPkg!.id ? { ...p, ...data } : p);
        } else {
            const newPkg: any = { 
                id: `pkg-${Date.now()}`, type: 'package', isAvailable: true, createdAt: new Date().toISOString().slice(0, 10), 
                ...data, updatedBy: 'admin', adminNote: pkgForm.adminNote || 'Paket baru dibuat oleh Admin.'
            };
            packages = [newPkg, ...packages];
        }
        showPkgModal = false;
    }

    // Handlers Kategori
    function openAddCat() {
        isEditing = false;
        catForm = { name: '', description: '', status: 'active', adminNote: '' };
        formError = '';
        showCatModal = true;
    }

    function openEditCat(cat: MockPackageCategory) {
        isEditing = true;
        selectedCat = cat;
        catForm = { name: cat.name, description: cat.description, status: cat.status, adminNote: cat.adminNote || '' };
        formError = '';
        showCatModal = true;
    }

    function saveCat() {
        if (!catForm.name.trim()) { formError = 'Nama kategori wajib diisi.'; return; }
        if (!catForm.description.trim()) { formError = 'Deskripsi wajib diisi.'; return; }
        if (!catForm.adminNote.trim()) { formError = 'Catatan admin wajib.'; return; }
        
        const isDuplicate = categories.some(c => c.name.toLowerCase() === catForm.name.toLowerCase() && (!isEditing || c.id !== selectedCat?.id));
        if (isDuplicate) { formError = 'Nama kategori sudah ada.'; return; }

        const data = {
            name: catForm.name, slug: slugifyCategoryName(catForm.name),
            description: catForm.description, status: catForm.status,
            updatedBy: 'admin' as const, updatedAt: new Date().toISOString().slice(0, 10),
            adminNote: catForm.adminNote
        };

        if (isEditing && selectedCat) {
            const oldName = selectedCat.name;
            categories = categories.map(c => c.id === selectedCat!.id ? { ...c, ...data } : c);
            // Update paket yang pakai kategori ini jika nama berubah
            if (oldName !== data.name) {
                packages = packages.map(p => (p.packageCategory ?? p.category) === oldName ? { ...p, packageCategory: data.name, category: data.name } : p);
            }
        } else {
            const newCat: MockPackageCategory = {
                id: `cat-${Date.now()}`, createdBy: 'admin' as const, createdAt: new Date().toISOString().slice(0, 10),
                ...data
            };
            categories = [...categories, newCat];
        }
        showCatModal = false;
    }

    function toggleCatStatus(cat: MockPackageCategory) {
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        categories = categories.map(c => c.id === cat.id ? { 
            ...c, status: newStatus, updatedBy: 'admin', updatedAt: new Date().toISOString().slice(0, 10), 
            adminNote: `Status kategori diubah menjadi ${newStatus} oleh Admin.` 
        } : c);
    }
</script>

<div class="space-y-10 pb-24 relative">
    <header class="flex flex-col md:flex-row md:items-start justify-between gap-6" in:fly={{ y: -20, duration: 500 }}>
        <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Master Paket & Kategori 🎁</h1>
            <p class="text-zinc-500 font-medium mt-2">Kelola paket catering dan kategori layanan secara terpusat.</p>
        </div>
        <div class="flex flex-wrap gap-3">
            <button onclick={openAddCat} class="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                <span>➕</span> Kategori Baru
            </button>
            <button onclick={openAddPkg} class="px-6 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <span>📦</span> Paket Baru
            </button>
        </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Paket', value: stats().totalPkg, color: 'text-brand-charcoal dark:text-white' },
            { label: 'Paket Aktif', value: stats().activePkg, color: 'text-emerald-600' },
            { label: 'Total Kategori', value: stats().totalCat, color: 'text-blue-600' },
            { label: 'Kategori Aktif', value: stats().activeCat, color: 'text-purple-600' }
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
            {#each [
                { id: 'ALL_PKG', label: 'Semua Paket' },
                { id: 'ACTIVE_PKG', label: 'Paket Aktif' },
                { id: 'DRAFT_PKG', label: 'Draft/Nonaktif' },
                { id: 'CATEGORIES', label: 'Kategori Paket' }
            ] as tab}
                <button
                    onclick={() => activeTab = tab.id as TabType}
                    class="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                    {activeTab === tab.id ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
                >{tab.label}</button>
            {/each}
        </div>

        {#if activeTab !== 'CATEGORIES'}
            <!-- Filters for Packages -->
            <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Filter:</span>
                <select bind:value={categoryFilter} class="bg-transparent border-none text-xs font-black uppercase tracking-wider focus:ring-0 cursor-pointer">
                    <option value="ALL">Semua Kategori</option>
                    {#each categories as cat}
                        <option value={cat.name}>{cat.name} {cat.status === 'inactive' ? '(Nonaktif)' : ''}</option>
                    {/each}
                </select>
            </div>

            <!-- Package Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each filteredPackages() as pkg (pkg.id)}
                    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col" in:scale={{ start: 0.97, duration: 300 }}>
                        <div class="relative h-44">
                            {#if pkg.image}
                                <img src={pkg.image} alt={pkg.name} class="w-full h-full object-cover" />
                            {:else}
                                <div class="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">📦</div>
                            {/if}
                            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div class="absolute top-4 left-4 flex gap-2">
                                <span class="px-3 py-1 bg-white/90 dark:bg-zinc-900/90 rounded-full text-[9px] font-black uppercase text-brand-charcoal dark:text-white">{pkg.packageCategory ?? pkg.category}</span>
                            </div>
                            <div class="absolute bottom-4 left-5">
                                <p class="text-2xl font-black text-white italic">{formatPrice(pkg.basePrice)}<span class="text-xs not-italic opacity-60">/pax</span></p>
                            </div>
                        </div>
                        <div class="p-6 flex-1 flex flex-col space-y-4">
                            <div class="flex justify-between items-start">
                                <h3 class="text-sm font-black text-brand-charcoal dark:text-white leading-tight">{pkg.name}</h3>
                                <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase {pkg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'}">{pkg.isActive ? 'Aktif' : 'Nonaktif'}</span>
                            </div>
                            <p class="text-[10px] text-zinc-500 font-medium line-clamp-2">{pkg.description}</p>
                            <div class="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <button onclick={() => openEditPkg(pkg)} class="py-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-100 transition-all">Edit</button>
                                <button onclick={() => { selectedPkg = pkg; showDetailModal = true; }} class="py-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-100 transition-all">Detail</button>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p class="text-zinc-400 font-black">Tidak ada paket dalam filter ini</p>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Category Tab -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each categories as cat (cat.id)}
                    <div class="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 hover:shadow-md transition-all flex flex-col space-y-4" in:scale>
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-black italic tracking-tighter uppercase">{cat.name}</h3>
                                <p class="text-[10px] font-mono text-zinc-400">/{cat.slug}</p>
                            </div>
                            <button 
                                onclick={() => toggleCatStatus(cat)} 
                                aria-label="Toggle status kategori"
                                class="px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all {cat.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}"
                            >
                                {cat.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>
                        <p class="text-xs text-zinc-500 font-medium leading-relaxed">{cat.description}</p>
                        
                        <div class="pt-4 border-t border-zinc-50 dark:border-zinc-800 grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Paket</p>
                                <p class="text-sm font-black italic">{packages.filter(p => (p.packageCategory ?? p.category) === cat.name).length} Item</p>
                            </div>
                            <div class="flex justify-end items-end">
                                <button onclick={() => openEditCat(cat)} class="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-brand-charcoal dark:hover:text-white rounded-lg transition-colors">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                            </div>
                        </div>

                        {#if cat.updatedBy === 'admin'}
                            <div class="mt-2 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border-l-2 border-red-200">
                                <p class="text-[8px] font-black text-red-500 uppercase mb-1">Admin Note ({cat.updatedAt})</p>
                                <p class="text-[10px] text-zinc-500 italic">"{cat.adminNote}"</p>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Modal Paket -->
<Modal show={showPkgModal} title={isEditing ? "Edit Master Paket ✏️" : "Tambah Paket Baru 📦"} onClose={() => showPkgModal = false}>
    <div class="space-y-5">
        {#if isEditing}
            <div class="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                <span class="text-base">⚡</span>
                <p class="text-[10px] font-bold text-red-600">Perubahan akan dicatat sebagai aksi Admin.</p>
            </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 col-span-2">
                <label for="pName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Paket *</label>
                <input id="pName" type="text" bind:value={pkgForm.name} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="pCat" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori Paket *</label>
                <select id="pCat" bind:value={pkgForm.packageCategory} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary">
                    {#each activeCategories as c}<option value={c.name}>{c.name}</option>{/each}
                </select>
            </div>
            <div class="space-y-1">
                <label for="pPrice" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harga/Pax *</label>
                <input id="pPrice" type="number" bind:value={pkgForm.basePrice} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="pDesc" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi</label>
                <textarea id="pDesc" bind:value={pkgForm.description} rows="2" class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
            <div class="space-y-2">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Publik</p>
                <button onclick={() => pkgForm.isActive = !pkgForm.isActive} class="flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all {pkgForm.isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}">
                    <span class="text-xs font-bold">{pkgForm.isActive ? 'Aktif/Publik' : 'Draft/Internal'}</span>
                </button>
            </div>
            <div class="space-y-1">
                <label for="pMin" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Min. Pax</label>
                <input id="pMin" type="number" bind:value={pkgForm.minPax} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="pNote" class="text-[10px] font-black {isEditing ? 'text-red-500' : 'text-zinc-400'} uppercase tracking-widest">Catatan Admin {isEditing ? '*' : ''}</label>
                <textarea id="pNote" bind:value={pkgForm.adminNote} rows="2" placeholder="Catatan untuk riwayat audit..." class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
        </div>
        {#if formError}<p class="text-[10px] font-bold text-red-500">{formError}</p>{/if}
        <div class="flex gap-3 pt-4">
            <button onclick={() => showPkgModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
            <button onclick={savePkg} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase rounded-2xl shadow-xl">{isEditing ? 'Update Paket' : 'Simpan Paket'}</button>
        </div>
    </div>
</Modal>

<!-- Modal Kategori -->
<Modal show={showCatModal} title={isEditing ? "Edit Kategori Paket ✏️" : "Kategori Paket Baru ➕"} onClose={() => showCatModal = false}>
    <div class="space-y-5">
        <div class="space-y-1">
            <label for="cName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Kategori *</label>
            <input id="cName" type="text" bind:value={catForm.name} placeholder="Contoh: Paket Harian" class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div class="space-y-1">
            <label for="cDesc" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi *</label>
            <textarea id="cDesc" bind:value={catForm.description} rows="3" class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</p>
                <select bind:value={catForm.status} class="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
            </div>
        </div>
        <div class="space-y-1">
            <label for="cNote" class="text-[10px] font-black text-red-500 uppercase tracking-widest">Catatan Admin *</label>
            <textarea id="cNote" bind:value={catForm.adminNote} rows="2" placeholder="Alasan perubahan/pembuatan..." class="w-full px-5 py-4 bg-red-50/30 dark:bg-red-900/10 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-400 resize-none"></textarea>
        </div>
        {#if formError}<p class="text-[10px] font-bold text-red-500">{formError}</p>{/if}
        <div class="flex gap-3 pt-4">
            <button onclick={() => showCatModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
            <button onclick={saveCat} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase rounded-2xl shadow-xl">Simpan Kategori</button>
        </div>
    </div>
</Modal>

<!-- Modal Detail Pkg (Existing) -->
<Modal show={showDetailModal} title="Detail Paket 🎁" onClose={() => showDetailModal = false}>
    {#if selectedPkg}
        <div class="space-y-6">
            {#if selectedPkg.image}<img src={selectedPkg.image} alt={selectedPkg.name} class="w-full h-48 object-cover rounded-2xl" />{/if}
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Nama</p><p class="font-black text-lg italic">{selectedPkg.name}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Kategori</p><p class="text-sm font-bold">{selectedPkg.packageCategory ?? selectedPkg.category}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Harga/Pax</p><p class="text-sm font-black text-brand-charcoal dark:text-white">{formatPrice(selectedPkg.basePrice)}</p></div>
            </div>
            <div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <p class="text-[9px] font-black text-zinc-400 uppercase mb-2">Deskripsi</p>
                <p class="text-sm font-medium">{selectedPkg.description}</p>
            </div>
            {#if (selectedPkg as any).adminNote}
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border-l-4 border-red-500">
                    <p class="text-[9px] font-black text-red-500 uppercase mb-1">Admin Log ({selectedPkg.updatedAt})</p>
                    <p class="text-xs italic">"{selectedPkg.adminNote}"</p>
                </div>
            {/if}
        </div>
    {/if}
</Modal>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

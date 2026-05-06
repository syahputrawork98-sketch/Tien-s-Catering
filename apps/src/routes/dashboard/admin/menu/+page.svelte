<script lang="ts">
    import { fly, fade, scale } from 'svelte/transition';
    import { mockCatalogItems, type CatalogItem } from '$lib/mock/catalog';
    import Modal from '$lib/components/ui/Modal.svelte';

    type TabType = 'ALL' | 'ACTIVE' | 'DRAFT' | 'SOLD_OUT';

    let menus = $state<(CatalogItem & { adminNote?: string; updatedBy?: string })[]>(
        mockCatalogItems.filter(i => i.type === 'menu').map(i => ({ ...i }))
    );

    let activeTab = $state<TabType>('ALL');
    let showDetailModal = $state(false);
    let showEditModal = $state(false);
    let selectedMenu = $state<typeof menus[0] | null>(null);
    let editForm = $state({ name: '', description: '', category: '', basePrice: 0, isActive: true, isAvailable: true, activeDate: '', dailyStock: 0, stockLabel: '', image: '', adminNote: '' });
    let editError = $state('');

    const filteredMenus = $derived(() => {
        switch (activeTab) {
            case 'ACTIVE': return menus.filter(m => m.isActive && m.isAvailable && m.status === 'active');
            case 'DRAFT': return menus.filter(m => !m.isActive || m.status === 'draft' || m.status === 'inactive');
            case 'SOLD_OUT': return menus.filter(m => m.status === 'sold_out' || !m.isAvailable);
            default: return menus;
        }
    });

    const stats = $derived(() => ({
        total: menus.length,
        active: menus.filter(m => m.isActive && m.status === 'active').length,
        draft: menus.filter(m => !m.isActive || m.status === 'draft').length,
        soldOut: menus.filter(m => m.status === 'sold_out').length
    }));

    function formatPrice(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    }

    function openDetail(menu: typeof menus[0]) { selectedMenu = menu; showDetailModal = true; }

    function openEdit(menu: typeof menus[0]) {
        selectedMenu = menu;
        editForm = { name: menu.name, description: menu.description, category: menu.category, basePrice: menu.basePrice, isActive: menu.isActive, isAvailable: menu.isAvailable, activeDate: menu.activeDate ?? '', dailyStock: menu.dailyStock ?? 0, stockLabel: menu.stockLabel ?? '', image: menu.image ?? '', adminNote: (menu as any).adminNote ?? '' };
        editError = '';
        showEditModal = true;
    }

    function saveEdit() {
        if (!editForm.name.trim()) { editError = 'Nama menu wajib diisi.'; return; }
        if (!editForm.category) { editError = 'Kategori wajib dipilih.'; return; }
        if (editForm.basePrice <= 0) { editError = 'Harga harus lebih dari 0.'; return; }
        if (!selectedMenu) return;
        menus = menus.map(m => m.id === selectedMenu!.id
            ? { ...m, ...editForm, updatedBy: 'admin', updatedAt: new Date().toISOString().slice(0, 10) }
            : m
        );
        showEditModal = false;
    }

    function toggleActive(id: string) {
        menus = menus.map(m => m.id === id ? { ...m, isActive: !m.isActive, updatedBy: 'admin', status: !m.isActive ? 'active' : 'inactive' } : m);
    }

    function toggleAvailable(id: string) {
        menus = menus.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable, updatedBy: 'admin', status: !m.isAvailable ? 'active' : 'sold_out', dailyStock: !m.isAvailable ? m.dailyStock : 0 } : m);
    }

    const tabs: { id: TabType; label: string; count: () => number }[] = [
        { id: 'ALL', label: 'Semua Menu', count: () => stats().total },
        { id: 'ACTIVE', label: 'Aktif', count: () => stats().active },
        { id: 'DRAFT', label: 'Draft/Nonaktif', count: () => stats().draft },
        { id: 'SOLD_OUT', label: 'Habis', count: () => stats().soldOut }
    ];

    const categories = ['Nasi Box', 'Snack Box', 'Prasmanan', 'Minuman', 'Lauk Tambahan', 'Custom'];
</script>

<div class="space-y-10 pb-24 relative">
    <header in:fly={{ y: -20, duration: 500 }}>
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Control</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Master Menu 🍱</h1>
        <p class="text-zinc-500 font-medium mt-2">Kelola menu utama, harga, status publik, dan ketersediaan menu.</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Menu', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
            { label: 'Aktif', value: stats().active, color: 'text-emerald-600' },
            { label: 'Draft/Nonaktif', value: stats().draft, color: 'text-zinc-500' },
            { label: 'Habis', value: stats().soldOut, color: 'text-red-500' }
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
            {#each tabs as tab}
                <button
                    onclick={() => activeTab = tab.id}
                    class="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
                    {activeTab === tab.id ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
                >
                    {tab.label}
                    <span class="px-2 py-0.5 rounded-md text-[9px] {activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">{tab.count()}</span>
                </button>
            {/each}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each filteredMenus() as menu (menu.id)}
                <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300" in:scale={{ start: 0.97, duration: 300 }}>
                    <div class="relative h-48">
                        {#if menu.image}
                            <img src={menu.image} alt={menu.name} class="w-full h-full object-cover" />
                        {:else}
                            <div class="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <span class="text-4xl">🍱</span>
                            </div>
                        {/if}
                        <div class="absolute top-4 left-4 flex gap-2 flex-wrap">
                            <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase text-brand-charcoal shadow">{menu.category}</span>
                            {#if (menu as any).updatedBy === 'admin'}
                                <span class="px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase text-white shadow">⚡ Admin</span>
                            {/if}
                        </div>
                    </div>

                    <div class="p-6 space-y-4">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="text-base font-black text-brand-charcoal dark:text-white leading-tight">{menu.name}</h3>
                                <p class="text-xl font-black text-brand-charcoal dark:text-white italic mt-1">{formatPrice(menu.basePrice)}</p>
                            </div>
                            <div class="flex flex-col items-end gap-2">
                                <span class="text-[9px] font-black uppercase {menu.isActive ? 'text-emerald-500' : 'text-zinc-400'}">{menu.isActive ? 'Aktif' : 'Nonaktif'}</span>
                                <button onclick={() => toggleActive(menu.id)} aria-label="Toggle aktif" class="w-10 h-5 rounded-full relative transition-all {menu.isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}">
                                    <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow {menu.isActive ? 'left-5' : 'left-0.5'}"></div>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase {menu.isAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}">
                                {menu.isAvailable ? 'Tersedia' : 'Habis'}
                            </span>
                            {#if menu.stockLabel}
                                <span class="text-[9px] text-zinc-400 font-medium">{menu.stockLabel}</span>
                            {/if}
                        </div>

                        <div class="grid grid-cols-2 gap-3 pt-2">
                            <button onclick={() => openDetail(menu)} class="py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-100 transition-all">Detail</button>
                            <button onclick={() => openEdit(menu)} class="py-3 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">Edit</button>
                            <button onclick={() => toggleAvailable(menu.id)} class="col-span-2 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all {menu.isAvailable ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'}">
                                {menu.isAvailable ? 'Tandai Habis' : 'Tandai Tersedia'}
                            </button>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="col-span-3 text-center py-20 text-zinc-400 font-black">Tidak ada menu di kategori ini</div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal Detail -->
<Modal show={showDetailModal} title="Detail Master Menu 🍱" onClose={() => showDetailModal = false}>
    {#if selectedMenu}
        <div class="space-y-5">
            {#if selectedMenu.image}
                <img src={selectedMenu.image} alt={selectedMenu.name} class="w-full h-48 object-cover rounded-2xl" />
            {/if}
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nama</p><p class="text-base font-black">{selectedMenu.name}</p></div>
                <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deskripsi</p><p class="text-sm">{selectedMenu.description}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Kategori</p><p class="text-sm font-bold">{selectedMenu.category}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Harga</p><p class="text-sm font-black">{formatPrice(selectedMenu.basePrice)}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p><p class="text-sm font-bold">{selectedMenu.status}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Stok Harian</p><p class="text-sm font-bold">{selectedMenu.dailyStock ?? '-'}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Aktif</p><p class="text-sm font-bold">{selectedMenu.activeDate ?? '-'}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Diperbarui</p><p class="text-sm font-bold">{selectedMenu.updatedAt}</p></div>
            </div>
            {#if (selectedMenu as any).adminNote}
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                    <p class="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Catatan Admin</p>
                    <p class="text-sm">{(selectedMenu as any).adminNote}</p>
                </div>
            {/if}
        </div>
    {/if}
</Modal>

<!-- Modal Edit -->
<Modal show={showEditModal} title="Edit Master Menu ✏️" onClose={() => showEditModal = false}>
    <div class="space-y-5">
        <div class="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
            <p class="text-[10px] font-bold text-red-600">Perubahan akan dicatat sebagai aksi Admin.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 col-span-2">
                <label for="eName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Menu *</label>
                <input id="eName" type="text" bind:value={editForm.name} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="eCat" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori *</label>
                <select id="eCat" bind:value={editForm.category} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary appearance-none">
                    <option value="">Pilih</option>
                    {#each categories as c}<option value={c}>{c}</option>{/each}
                </select>
            </div>
            <div class="space-y-1">
                <label for="ePrice" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harga (Rp) *</label>
                <input id="ePrice" type="number" bind:value={editForm.basePrice} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="eStock" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stok Harian</label>
                <input id="eStock" type="number" bind:value={editForm.dailyStock} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="eStockLabel" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Label Stok</label>
                <input id="eStockLabel" type="text" bind:value={editForm.stockLabel} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1">
                <label for="eDate" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal Aktif</label>
                <input id="eDate" type="date" bind:value={editForm.activeDate} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="eDesc" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi</label>
                <textarea id="eDesc" bind:value={editForm.description} rows="2" class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
            <div class="space-y-1 col-span-2">
                <label for="eImg" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL Gambar</label>
                <input id="eImg" type="text" bind:value={editForm.image} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div class="space-y-1 col-span-2">
                <label for="eNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan Admin</label>
                <textarea id="eNote" bind:value={editForm.adminNote} rows="2" placeholder="Alasan perubahan..." class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>
        </div>
        {#if editError}<p class="text-[10px] font-bold text-red-500">{editError}</p>{/if}
        <div class="flex gap-3 pt-2">
            <button onclick={() => showEditModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Batal</button>
            <button onclick={saveEdit} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Simpan Perubahan</button>
        </div>
    </div>
</Modal>

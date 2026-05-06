<script lang="ts">
    import { mockCatalogPackages, type CatalogItem } from '$lib/mock/catalog';
    import { fade, fly, scale } from 'svelte/transition';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

    type TabType = 'SEMUA' | 'NASI_BOX' | 'SNACK_BOX' | 'PRASMANAN' | 'CORPORATE' | 'WEDDING' | 'CUSTOM';
    
    // Local state for simulated edits
    let packages = $state<CatalogItem[]>([...mockCatalogPackages]);
    
    let activeTab = $state<TabType>('SEMUA');

    const tabs = [
        { id: 'SEMUA', label: 'Semua Paket', category: null },
        { id: 'NASI_BOX', label: 'Nasi Box', category: 'Nasi Box' },
        { id: 'SNACK_BOX', label: 'Snack Box', category: 'Snack Box' },
        { id: 'PRASMANAN', label: 'Prasmanan', category: 'Prasmanan' },
        { id: 'CORPORATE', label: 'Corporate', category: 'Meeting/Corporate' },
        { id: 'WEDDING', label: 'Wedding', category: 'Event/Wedding' },
        { id: 'CUSTOM', label: 'Custom', category: 'Custom' }
    ];

    const stats = $derived({
        total: packages.length,
        active: packages.filter(p => p.isActive).length,
        inactive: packages.filter(p => !p.isActive).length,
        categories: new Set(packages.map(p => p.packageCategory)).size
    });

    const filteredPackages = $derived(
        packages.filter(p => {
            const currentTab = tabs.find(t => t.id === activeTab);
            if (!currentTab || currentTab.id === 'SEMUA') return true;
            return p.packageCategory === currentTab.category;
        })
    );

    function getCount(tabId: TabType) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || tab.id === 'SEMUA') return packages.length;
        return packages.filter(p => p.packageCategory === tab.category).length;
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

    function handleDetail(name: string) {
        alert(`Detail Paket: ${name}\n\nFitur ini akan menampilkan rincian menu, syarat & ketentuan, serta galeri dokumentasi acara.`);
    }

    function handleEdit(name: string) {
        alert(`Edit Paket: ${name}\n\nBuka editor paket (Simulasi UI).`);
    }
</script>

<div class="space-y-12 pb-24 relative">
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div in:fly={{ y: -20, duration: 500 }}>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Kelola Paket Catering 🎁</h1>
            <p class="text-zinc-500 font-medium mt-2">Atur paket catering berdasarkan kategori dan kebutuhan acara pelanggan.</p>
        </div>
        <div class="flex gap-4" in:fly={{ x: 20, duration: 500 }}>
            <button onclick={() => alert('Tambah Paket Baru (Simulasi UI)')} class="px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Buat Paket Baru
            </button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6" in:fade={{ delay: 200 }}>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-brand-primary transition-colors">Total Paket</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 group-hover:text-emerald-500 transition-colors">Paket Aktif</p>
            <p class="text-4xl font-black text-emerald-600 italic">{stats.active}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Nonaktif</p>
            <p class="text-4xl font-black text-red-600 italic">{stats.inactive}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">Kategori</p>
            <p class="text-4xl font-black text-blue-600 italic">{stats.categories}</p>
        </div>
    </div>

    <!-- Navigation & Tabs -->
    <div class="space-y-8" in:fade={{ delay: 300 }}>
        <div class="flex overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
            <div class="flex gap-3 min-w-max">
                {#each tabs as tab}
                    <button 
                        onclick={() => activeTab = tab.id as TabType}
                        class="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4
                        {activeTab === tab.id 
                            ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'}"
                    >
                        {tab.label}
                        {#if getCount(tab.id as TabType) > 0}
                            <span class="px-2 py-0.5 rounded-md text-[9px] 
                                {activeTab === tab.id 
                                    ? 'bg-white/20 text-white dark:bg-brand-charcoal/10 dark:text-brand-charcoal' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                                {getCount(tab.id as TabType)}
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Package Grid -->
        <div class="min-h-[500px]">
            {#if filteredPackages.length > 0}
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
                                    <div class="w-full h-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                        <svg class="w-12 h-12 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                {/if}
                                <div class="absolute top-6 left-6 flex flex-col gap-2">
                                    <span class="px-4 py-1.5 bg-white/90 backdrop-blur-md dark:bg-zinc-900/90 rounded-full text-[9px] font-black uppercase tracking-widest text-brand-charcoal dark:text-white shadow-lg border border-white/20">
                                        {pkg.packageCategory}
                                    </span>
                                    {#if pkg.minPax}
                                        <span class="px-4 py-1.5 bg-brand-charcoal/80 backdrop-blur-md text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                                            Min. {pkg.minPax} Pax
                                        </span>
                                    {/if}
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                <div class="absolute bottom-6 left-8">
                                    <span class="text-xs font-black text-white/70 uppercase tracking-widest block mb-1">Mulai Dari</span>
                                    <span class="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg">{formatPrice(pkg.basePrice)}<span class="text-sm not-italic opacity-60">/pax</span></span>
                                </div>
                            </div>

                            <div class="p-8 flex flex-col flex-1">
                                <div class="mb-6">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-xl font-black text-brand-charcoal dark:text-white leading-tight">{pkg.name}</h3>
                                        <div class="flex flex-col items-end gap-2">
                                            <span class="text-[9px] font-black uppercase tracking-widest {pkg.isActive ? 'text-emerald-500' : 'text-red-500'}">
                                                {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                            <button 
                                                onclick={() => toggleActive(pkg.id)}
                                                class="w-10 h-5 rounded-full relative transition-all cursor-pointer {pkg.isActive ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}"
                                            >
                                                <div class="absolute top-1 w-3 h-3 bg-white rounded-full transition-all {pkg.isActive ? 'left-6' : 'left-1'} shadow-sm"></div>
                                            </button>
                                        </div>
                                    </div>
                                    <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{pkg.description}</p>
                                </div>

                                <div class="space-y-4 mb-8 flex-1">
                                    {#if pkg.suitableFor}
                                        <div class="flex flex-wrap gap-2">
                                            {#each pkg.suitableFor as tag}
                                                <span class="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded-lg uppercase tracking-wider">#{tag}</span>
                                            {/each}
                                        </div>
                                    {/if}
                                    
                                    <div class="space-y-2">
                                        <p class="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Key Features:</p>
                                        <div class="grid grid-cols-1 gap-1.5">
                                            {#each (pkg.features || []).slice(0, 3) as feat}
                                                <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                                                    <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                                    {feat}
                                                </div>
                                            {/each}
                                            {#if (pkg.features?.length || 0) > 3}
                                                <p class="text-[9px] font-bold text-zinc-400 italic">+{pkg.features!.length - 3} fitur lainnya...</p>
                                            {/if}
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4 mt-auto">
                                    <button 
                                        onclick={() => handleDetail(pkg.name)}
                                        class="py-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all border border-zinc-100 dark:border-zinc-800"
                                    >
                                        Detail
                                    </button>
                                    <button 
                                        onclick={() => handleEdit(pkg.name)}
                                        class="py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Edit Paket
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-32 px-8 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center" in:fade>
                    <div class="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-8">
                        <svg class="w-12 h-12 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">
                        Belum ada paket di kategori ini.
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        Coba pilih kategori lain atau tambahkan paket baru untuk kategori ini.
                    </p>
                    <button onclick={() => activeTab = 'SEMUA'} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Lihat Semua Paket</button>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

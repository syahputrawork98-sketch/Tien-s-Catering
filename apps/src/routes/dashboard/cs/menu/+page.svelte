<script lang="ts">
    import { mockCsMenus, type MockCsMenu } from '$lib/mock/cs';
    import { fade, fly, scale } from 'svelte/transition';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

    const TODAY = '2026-05-06';
    
    type TabType = 'TODAY' | 'HISTORY';
    
    // Local state
    let menus = $state<MockCsMenu[]>([...mockCsMenus]);
    let activeTab = $state<TabType>('TODAY');
    let historyDateFilter = $state<string>('');
    
    const stats = $derived({
        total: menus.length,
        today: menus.filter(m => m.activeDate === TODAY).length,
        available: menus.filter(m => m.activeDate === TODAY && m.isAvailable).length,
        soldOut: menus.filter(m => m.activeDate === TODAY && !m.isAvailable).length
    });

    const filteredMenus = $derived(
        menus.filter(menu => {
            if (activeTab === 'TODAY') {
                return menu.activeDate === TODAY;
            } else {
                if (!historyDateFilter) return menu.activeDate !== TODAY;
                return menu.activeDate === historyDateFilter;
            }
        })
    );

    function toggleAvailability(id: string) {
        menus = menus.map(m => {
            if (m.id === id) {
                const newStatus = !m.isAvailable;
                return { 
                    ...m, 
                    isAvailable: newStatus,
                    stockLabel: newStatus ? 'Tersedia' : 'Habis'
                };
            }
            return m;
        });
    }

    function resetFilter() {
        historyDateFilter = '';
    }

    function handleDetail(name: string) {
        alert(`Detail Menu: ${name}\n\nFitur ini akan menampilkan informasi lengkap, deskripsi, dan bahan baku menu.`);
    }

    function handleEdit(name: string) {
        alert(`Edit Menu: ${name}\n\nModal edit akan muncul di sini (Simulasi UI).`);
    }
</script>

<div class="space-y-12 pb-24 relative">
    <!-- Header Section -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div in:fly={{ y: -20, duration: 500 }}>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Kelola Menu Harian 🍱</h1>
            <p class="text-zinc-500 font-medium mt-2">Atur menu yang tampil hari ini dan kelola riwayat menu sebelumnya.</p>
        </div>
        <div class="flex gap-4" in:fly={{ x: 20, duration: 500 }}>
            <button onclick={() => alert('Fitur Tambah Menu Baru (Simulasi UI)')} class="px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Menu Baru
            </button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6" in:fade={{ delay: 200 }}>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-brand-primary transition-colors">Total Menu</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">Menu Hari Ini</p>
            <p class="text-4xl font-black text-blue-600 italic">{stats.today}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 group-hover:text-emerald-500 transition-colors">Tersedia</p>
            <p class="text-4xl font-black text-emerald-600 italic">{stats.available}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3 group-hover:text-red-500 transition-colors">Habis</p>
            <p class="text-4xl font-black text-red-600 italic">{stats.soldOut}</p>
        </div>
    </div>

    <!-- Navigation & Tabs -->
    <div class="space-y-8" in:fade={{ delay: 300 }}>
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex gap-4">
                <button 
                    onclick={() => activeTab = 'TODAY'}
                    class="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all
                    {activeTab === 'TODAY' 
                        ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                        : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
                >
                    Menu Hari Ini
                </button>
                <button 
                    onclick={() => { activeTab = 'HISTORY'; resetFilter(); }}
                    class="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all
                    {activeTab === 'HISTORY' 
                        ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                        : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
                >
                    History Menu
                </button>
            </div>

            {#if activeTab === 'HISTORY'}
                <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 p-3 pl-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm w-fit" in:fly={{ y: 10 }}>
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Filter Tanggal:</span>
                    <input 
                        type="date" 
                        bind:value={historyDateFilter}
                        class="bg-transparent border-none focus:ring-0 text-sm font-bold text-brand-charcoal dark:text-white cursor-pointer"
                    />
                    {#if historyDateFilter}
                        <button onclick={resetFilter} class="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-black text-zinc-400 uppercase rounded-lg hover:text-red-500 transition-all">Reset</button>
                    {/if}
                </div>
            {/if}
        </div>

        <!-- Menu List Grid -->
        <div class="min-h-[500px]">
            {#if filteredMenus.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {#each filteredMenus as menu (menu.id)}
                        <div 
                            class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                            in:scale={{ start: 0.95, duration: 400 }}
                        >
                            <div class="relative h-64 overflow-hidden">
                                {#if menu.image}
                                    <img src={menu.image} alt={menu.name} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                {:else}
                                    <div class="w-full h-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                        <svg class="w-12 h-12 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                {/if}
                                <div class="absolute top-6 left-6 flex flex-col gap-2">
                                    <span class="px-4 py-1.5 bg-white/90 backdrop-blur-md dark:bg-zinc-900/90 rounded-full text-[9px] font-black uppercase tracking-widest text-brand-charcoal dark:text-white shadow-lg border border-white/20">
                                        {menu.category}
                                    </span>
                                    {#if menu.activeDate === TODAY}
                                        <span class="px-4 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                                            Aktif Hari Ini
                                        </span>
                                    {/if}
                                </div>
                                <div class="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                                    <span class="text-2xl font-black text-white italic tracking-tighter drop-shadow-lg">{formatPrice(menu.price)}</span>
                                </div>
                            </div>

                            <div class="p-8">
                                <div class="flex justify-between items-start mb-6">
                                    <h3 class="text-xl font-black text-brand-charcoal dark:text-white leading-tight">{menu.name}</h3>
                                    <div class="flex flex-col items-end gap-2">
                                        <span class="text-[10px] font-black uppercase tracking-widest {menu.isAvailable ? 'text-emerald-500' : 'text-red-500'}">
                                            {menu.isAvailable ? 'Tersedia' : 'Habis'}
                                        </span>
                                        <button 
                                            onclick={() => toggleAvailability(menu.id)}
                                            class="w-12 h-6 rounded-full relative transition-all cursor-pointer {menu.isAvailable ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}"
                                        >
                                            <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all {menu.isAvailable ? 'left-7' : 'left-1'} shadow-sm"></div>
                                        </button>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <button 
                                        onclick={() => handleDetail(menu.name)}
                                        class="py-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                                    >
                                        Detail
                                    </button>
                                    <button 
                                        onclick={() => handleEdit(menu.name)}
                                        class="py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Edit
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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">
                        {activeTab === 'HISTORY' && historyDateFilter 
                            ? 'Tidak ada riwayat menu pada tanggal ini.' 
                            : 'Belum ada menu di kategori ini.'}
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        {activeTab === 'HISTORY' && historyDateFilter 
                            ? 'Coba pilih tanggal lain atau reset filter untuk melihat semua data.' 
                            : 'Menu akan muncul otomatis ketika data mock sesuai dengan tab ini.'}
                    </p>
                    <button onclick={() => { activeTab = 'TODAY'; resetFilter(); }} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Kembali ke Menu Hari Ini</button>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style>

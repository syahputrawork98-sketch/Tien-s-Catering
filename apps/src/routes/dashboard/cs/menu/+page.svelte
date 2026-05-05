<script lang="ts">
    import { mockCsMenus, type MockCsMenu } from '$lib/mock/cs';
    import { fade } from 'svelte/transition';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

    let menus = $state([...mockCsMenus]);

    const stats = $derived({
        total: menus.length,
        available: menus.filter(m => m.isAvailable).length,
        unavailable: menus.filter(m => !m.isAvailable).length
    });

    function toggleAvailability(id: string) {
        menus = menus.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m);
    }
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Kelola Menu 🍱</h1>
            <p class="text-zinc-500 font-medium mt-1">Atur ketersediaan dan harga menu katering harian.</p>
        </div>
        <button class="bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Menu Baru
        </button>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Total Menu</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Live / Ready</p>
            <p class="text-4xl font-black text-emerald-600 italic">{stats.available}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Sold Out / Hidden</p>
            <p class="text-4xl font-black text-red-500 italic">{stats.unavailable}</p>
        </div>
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Menu Details</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harga</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stok / Status</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each menus as menu (menu.id)}
                        <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                            <td class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-black text-brand-charcoal dark:text-white">{menu.name}</span>
                                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Updated: {menu.updatedAt}</span>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <span class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-lg uppercase tracking-wider">{menu.category}</span>
                            </td>
                            <td class="px-8 py-6">
                                <span class="text-sm font-black text-brand-charcoal dark:text-white">{formatPrice(menu.price)}</span>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex items-center gap-3">
                                    <span class="text-xs font-bold {menu.isAvailable ? 'text-emerald-500' : 'text-red-400'}">{menu.stockLabel}</span>
                                    <div 
                                        role="button"
                                        tabindex="0"
                                        onclick={() => toggleAvailability(menu.id)}
                                        onkeydown={(e) => e.key === 'Enter' && toggleAvailability(menu.id)}
                                        class="w-10 h-5 rounded-full relative transition-all cursor-pointer {menu.isAvailable ? 'bg-emerald-500' : 'bg-zinc-200'}"
                                    >
                                        <div class="absolute top-1 w-3 h-3 bg-white rounded-full transition-all {menu.isAvailable ? 'left-6' : 'left-1'} shadow-sm"></div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button class="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:text-brand-primary transition-all shadow-sm">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

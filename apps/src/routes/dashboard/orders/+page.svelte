<script lang="ts">
    import { dashboardOrders } from '$lib/mock/orders_dashboard';
    import OrderTabs from '$lib/components/dashboard/OrderTabs.svelte';
    import ActiveOrdersList from '$lib/components/dashboard/ActiveOrdersList.svelte';
    import HistoryOrdersList from '$lib/components/dashboard/HistoryOrdersList.svelte';
    import { fade } from 'svelte/transition';

    let activeTab = $state<'ACTIVE' | 'HISTORY'>('ACTIVE');

    function handleDetail(id: string) {
        alert(`Membuka detail pesanan #${id} (Simulasi).`);
    }

    const stats = $derived({
        total: dashboardOrders.length,
        active: dashboardOrders.filter(o => o.type === 'active').length,
        completed: dashboardOrders.filter(o => o.status === 'COMPLETED').length,
        cancelled: dashboardOrders.filter(o => o.status === 'CANCELLED').length
    });
</script>

<div class="space-y-8">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter">Pesanan Saya 🛍️</h1>
            <p class="text-zinc-500 font-medium mt-2">Pantau status pesanan aktif dan lihat riwayat katering Anda.</p>
        </div>
        
        <div class="flex gap-4">
            <div class="bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Aktif: <span class="text-brand-charcoal dark:text-white ml-1">{stats.active}</span></span>
            </div>
            <div class="bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selesai: <span class="text-brand-charcoal dark:text-white ml-1">{stats.completed}</span></span>
            </div>
        </div>
    </header>

    <OrderTabs bind:activeTab />

    <div class="min-h-[400px]">
        {#if activeTab === 'ACTIVE'}
            <div in:fade={{ duration: 200 }}>
                <ActiveOrdersList orders={dashboardOrders} onDetail={handleDetail} />
            </div>
        {:else}
            <div in:fade={{ duration: 200 }}>
                <HistoryOrdersList orders={dashboardOrders} onDetail={handleDetail} />
            </div>
        {/if}
    </div>
</div>


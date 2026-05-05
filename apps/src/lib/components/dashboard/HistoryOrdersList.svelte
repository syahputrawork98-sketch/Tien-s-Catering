<script lang="ts">
    import OrderCard from './OrderCard.svelte';
    import EmptyState from './EmptyState.svelte';
    import type { Order } from '$lib/mock/orders_dashboard';

    let { orders = [], onDetail } = $props<{ orders: Order[], onDetail: (id: string) => void }>();

    let filter = $state('ALL'); // TODAY, WEEK, MONTH, ALL
    let searchQuery = $state('');

    const historyOrders = $derived(orders.filter((o: Order) => o.type === 'history'));

    const filteredOrders = $derived(historyOrders.filter((o: Order) => {
        const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             o.menuName.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        if (filter === 'ALL') return true;
        
        const orderDate = new Date(o.orderDate);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (filter === 'TODAY') {
            return orderDate.getTime() === today.getTime();
        }

        if (filter === 'WEEK') {
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 7);
            return orderDate >= lastWeek;
        }

        if (filter === 'MONTH') {
            return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
        }

        return true;
    }));

    const groupedOrders = $derived(filteredOrders.reduce((acc: Record<string, Order[]>, order: Order) => {
        const date = order.orderDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {} as Record<string, Order[]>));

    const sortedDates = $derived(Object.keys(groupedOrders).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()));

    function formatDateDisplay(dateStr: string) {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    }
</script>

<div class="space-y-8">
    <!-- Filter & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div class="flex flex-wrap gap-2">
            {#each ['ALL', 'TODAY', 'WEEK', 'MONTH'] as f}
                <button 
                    onclick={() => filter = f}
                    class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    {filter === f ? 'bg-brand-charcoal text-white dark:bg-brand-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}"
                >
                    {f === 'ALL' ? 'Semua' : f === 'TODAY' ? 'Hari Ini' : f === 'WEEK' ? 'Minggu Ini' : 'Bulan Ini'}
                </button>
            {/each}
        </div>

        <div class="relative w-full md:w-64">
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Cari nomor pesanan..." 
                class="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] font-bold border-none focus:ring-2 focus:ring-brand-primary/50"
            />
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
        </div>
    </div>

    {#if sortedDates.length > 0}
        <div class="space-y-10">
            {#each sortedDates as date}
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <h3 class="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">{formatDateDisplay(date)}</h3>
                        <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800"></div>
                    </div>
                    <div class="space-y-6">
                        {#each groupedOrders[date] as order (order.id)}
                            <OrderCard {order} {onDetail} />
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <EmptyState 
            message="Belum ada riwayat pesanan." 
            description={searchQuery ? "Tidak ditemukan pesanan dengan kata kunci tersebut." : "Pesanan yang sudah selesai atau dibatalkan akan muncul di sini."}
            icon="🕰️"
        />
    {/if}
</div>

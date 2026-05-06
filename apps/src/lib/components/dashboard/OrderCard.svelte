<script lang="ts">
    import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
    import { formatRupiah, type Order } from '$lib/mock/orders_dashboard';

    let { 
        order, 
        onDetail = (id: string) => {} 
    } = $props<{ order: Order, onDetail?: (id: string) => void }>();
</script>

<div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-brand-primary/30 transition-all">
    <div class="flex flex-col gap-4 flex-1">
        <div class="flex items-center flex-wrap gap-4">
            <span class="text-lg font-black text-brand-charcoal dark:text-white tracking-tighter">#{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                {order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                 order.paymentStatus === 'waiting_verification' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' : 
                 'bg-zinc-50 text-zinc-400 border border-zinc-100'}">
                {order.paymentStatus === 'waiting_verification' ? 'Verifikasi Bayar' : order.paymentStatus}
            </span>
        </div>
        
        <div class="space-y-1">
            <h4 class="text-xl font-black text-brand-charcoal dark:text-white leading-tight">{order.menuName}</h4>
            <div class="flex flex-wrap gap-x-6 gap-y-2">
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tanggal Order</p>
                    <p class="text-sm font-bold text-zinc-600 dark:text-zinc-400">{order.orderDate}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Jadwal Kirim</p>
                    <p class="text-sm font-bold text-brand-primary">{order.deliveryDate}</p>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap gap-2">
            {#each order.items as item}
                <span class="text-[10px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-100 dark:border-zinc-700">
                    {item.quantity}x {item.name}
                </span>
            {/each}
        </div>
    </div>

    <div class="flex flex-col lg:items-end gap-6">
        <div class="lg:text-right">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Pembayaran</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{formatRupiah(order.total)}</p>
        </div>
        <div class="flex gap-2">
            <button 
                onclick={() => onDetail(order.id)}
                class="px-8 py-3 bg-brand-charcoal text-white dark:bg-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-charcoal/10"
            >
                Lihat Detail
            </button>
        </div>
    </div>
</div>

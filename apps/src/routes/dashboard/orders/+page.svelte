<script lang="ts">
    import { mockUserOrders, formatRupiah } from '$lib/mock/user';
    import { fade } from 'svelte/transition';

    const stats = {
        total: mockUserOrders.length,
        active: mockUserOrders.filter(o => ['submitted', 'confirmed', 'processing', 'ready'].includes(o.status)).length,
        completed: mockUserOrders.filter(o => o.status === 'delivered').length,
        waiting: mockUserOrders.filter(o => o.paymentStatus === 'waiting_verification').length
    };

    function handleDetail(id: string) {
        alert(`Membuka detail pesanan #${id} (Simulasi).`);
    }
</script>

<div class="space-y-10">
    <header>
        <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Pesanan Saya 🛍️</h1>
        <p class="text-zinc-500 font-medium mt-1">Lacak status dan lihat riwayat katering Anda.</p>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
            <p class="text-xl font-black text-brand-charcoal dark:text-white">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Aktif</p>
            <p class="text-xl font-black text-blue-600">{stats.active}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Selesai</p>
            <p class="text-xl font-black text-emerald-600">{stats.completed}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-orange-600">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Verifikasi Bayar</p>
            <p class="text-xl font-black">{stats.waiting}</p>
        </div>
    </div>

    <div class="space-y-6">
        {#each mockUserOrders as order (order.id)}
            <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-brand-primary/30 transition-all">
                <div class="flex flex-col gap-4 flex-1">
                    <div class="flex items-center gap-4">
                        <span class="text-lg font-black text-brand-charcoal dark:text-white">#{order.id}</span>
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                            {order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 
                             order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                             'bg-blue-100 text-blue-600'}">
                            {order.status}
                        </span>
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {order.paymentStatus.replace('_', ' ')}
                        </span>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Waktu Order</p>
                            <p class="text-sm font-bold text-zinc-600 dark:text-zinc-400">{order.date}</p>
                        </div>
                        <div>
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Rencana Kirim</p>
                            <p class="text-sm font-bold text-brand-primary">{order.deliveryDate}</p>
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
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Tagihan</p>
                        <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{formatRupiah(order.total)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick={() => handleDetail(order.id)} class="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Detail</button>
                        <button class="px-6 py-3 bg-brand-charcoal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Cetak Bon</button>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

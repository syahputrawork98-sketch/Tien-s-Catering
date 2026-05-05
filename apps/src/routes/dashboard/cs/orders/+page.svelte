<script lang="ts">
    import { mockCsOrders, type MockCsOrder } from '$lib/mock/cs';
    import { fade, fly } from 'svelte/transition';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

    const stats = {
        total: mockCsOrders.length,
        new: mockCsOrders.filter(o => o.status === 'new').length,
        waiting: mockCsOrders.filter(o => o.paymentStatus === 'waiting_verification').length,
        processing: mockCsOrders.filter(o => o.status === 'processing').length
    };

    function handleAction(action: string, orderId: string) {
        alert(`Aksi [${action}] untuk Pesanan [${orderId}] berhasil disimulasikan.`);
    }
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Pesanan Masuk 📦</h1>
            <p class="text-zinc-500 font-medium mt-1">Monitoring dan konfirmasi pesanan terbaru.</p>
        </div>
        <div class="flex gap-2">
            <button class="px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">Filter</button>
            <button class="px-6 py-3 bg-brand-charcoal text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Export PDF</button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Pesanan</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2">Pesanan Baru</p>
            <p class="text-2xl font-black text-orange-600 italic">{stats.new}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Menunggu Bayar</p>
            <p class="text-2xl font-black text-blue-600 italic">{stats.waiting}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Siap/Proses</p>
            <p class="text-2xl font-black text-emerald-600 italic">{stats.processing}</p>
        </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID & Customer</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Waktu Kirim</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Items</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each mockCsOrders as order (order.id)}
                        <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all group">
                            <td class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-black text-brand-charcoal dark:text-white">#{order.id}</span>
                                    <span class="text-xs font-bold text-zinc-400">{order.customerName}</span>
                                    <a href="https://wa.me/{order.whatsapp}" class="text-[10px] text-brand-primary font-black mt-1 hover:underline">{order.whatsapp}</a>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-brand-charcoal dark:text-zinc-300">{order.deliveryDate}</span>
                                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter truncate max-w-[150px]">{order.address}</span>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex flex-col gap-1">
                                    {#each order.items as item}
                                        <span class="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md w-fit">
                                            {item.quantity}x {item.name}
                                        </span>
                                    {/each}
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <span class="text-sm font-black text-brand-charcoal dark:text-white">{formatPrice(order.total)}</span>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex flex-col gap-2">
                                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit
                                        {order.status === 'new' ? 'bg-orange-100 text-orange-600' : 
                                         order.status === 'confirmed' ? 'bg-blue-100 text-blue-600' : 
                                         order.status === 'processing' ? 'bg-indigo-100 text-indigo-600' : 
                                         'bg-emerald-100 text-emerald-600'}">
                                        {order.status}
                                    </span>
                                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit
                                        {order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 
                                         order.paymentStatus === 'waiting_verification' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 
                                         'bg-red-50 text-red-500 border border-red-100'}">
                                        {order.paymentStatus.replace('_', ' ')}
                                    </span>
                                </div>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button onclick={() => handleAction('Detail', order.id)} class="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:text-brand-primary transition-all shadow-sm">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button onclick={() => handleAction('Konfirmasi', order.id)} class="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">Konfirmasi</button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

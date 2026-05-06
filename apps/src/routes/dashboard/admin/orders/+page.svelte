<script lang="ts">
    import { fly, fade, scale } from 'svelte/transition';
    import { mockOrders, type MockOrder, type MockOrderStatus } from '$lib/mock/orders';
    import Modal from '$lib/components/ui/Modal.svelte';

    type TabType = 'ALL' | 'NEW' | 'PROCESS' | 'DONE' | 'CANCELLED';

    let orders = $state<(MockOrder & { adminNote?: string; updatedBy?: string })[]>(
        mockOrders.map(o => ({ ...o }))
    );

    let activeTab = $state<TabType>('ALL');
    let showDetailModal = $state(false);
    let showOverrideModal = $state(false);
    let showCancelModal = $state(false);
    let selectedOrder = $state<(MockOrder & { adminNote?: string; updatedBy?: string }) | null>(null);

    let overrideStatus = $state<MockOrderStatus>('confirmed');
    let overrideNote = $state('');
    let cancelReason = $state('');
    let overrideError = $state('');
    let cancelError = $state('');

    const statusOptions: { value: MockOrderStatus; label: string }[] = [
        { value: 'new', label: 'Pesanan Baru' },
        { value: 'confirmed', label: 'Dikonfirmasi' },
        { value: 'processing', label: 'Diproses' },
        { value: 'ready', label: 'Siap Antar' },
        { value: 'delivered', label: 'Dikirim' },
        { value: 'completed', label: 'Selesai' },
        { value: 'cancelled', label: 'Dibatalkan' }
    ];

    const filteredOrders = $derived(() => {
        switch (activeTab) {
            case 'NEW': return orders.filter(o => o.status === 'new');
            case 'PROCESS': return orders.filter(o => ['confirmed','processing','ready','delivered'].includes(o.status));
            case 'DONE': return orders.filter(o => o.status === 'completed');
            case 'CANCELLED': return orders.filter(o => o.status === 'cancelled');
            default: return orders;
        }
    });

    const stats = $derived(() => ({
        total: orders.length,
        new: orders.filter(o => o.status === 'new').length,
        process: orders.filter(o => ['confirmed','processing','ready','delivered'].includes(o.status)).length,
        done: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    }));

    function formatPrice(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    }

    function statusLabel(s: MockOrderStatus) {
        return statusOptions.find(x => x.value === s)?.label ?? s;
    }

    function statusColor(s: MockOrderStatus) {
        const map: Record<string, string> = {
            new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            ready: 'bg-purple-100 text-purple-700',
            delivered: 'bg-teal-100 text-teal-700',
            completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return map[s] ?? 'bg-zinc-100 text-zinc-600';
    }

    function paymentColor(p: string) {
        if (p === 'paid') return 'text-emerald-600';
        if (p === 'waiting_verification') return 'text-amber-600';
        return 'text-red-500';
    }

    function paymentLabel(p: string) {
        if (p === 'paid') return 'Lunas';
        if (p === 'waiting_verification') return 'Menunggu Verifikasi';
        if (p === 'refunded') return 'Direfund';
        return 'Belum Bayar';
    }

    function openDetail(order: typeof orders[0]) {
        selectedOrder = order;
        showDetailModal = true;
    }

    function openOverride(order: typeof orders[0]) {
        selectedOrder = order;
        overrideStatus = order.status;
        overrideNote = '';
        overrideError = '';
        showOverrideModal = true;
    }

    function openCancel(order: typeof orders[0]) {
        selectedOrder = order;
        cancelReason = '';
        cancelError = '';
        showCancelModal = true;
    }

    function confirmComplete(id: string) {
        orders = orders.map(o => o.id === id
            ? { ...o, completedConfirmedByAdmin: true, updatedBy: 'admin', adminNote: 'Dikonfirmasi selesai oleh Admin.' }
            : o
        );
    }

    function saveOverride() {
        if (!overrideNote.trim()) { overrideError = 'Catatan admin wajib diisi.'; return; }
        if (!selectedOrder) return;
        orders = orders.map(o => o.id === selectedOrder!.id
            ? { ...o, status: overrideStatus, updatedBy: 'admin', adminNote: overrideNote.trim() }
            : o
        );
        showOverrideModal = false;
    }

    function saveCancel() {
        if (!cancelReason.trim()) { cancelError = 'Alasan pembatalan wajib diisi.'; return; }
        if (!selectedOrder) return;
        orders = orders.map(o => o.id === selectedOrder!.id
            ? { ...o, status: 'cancelled', cancelledBy: 'admin', cancellationReason: cancelReason.trim(), updatedBy: 'admin' }
            : o
        );
        showCancelModal = false;
    }

    const tabs: { id: TabType; label: string; count: () => number }[] = [
        { id: 'ALL', label: 'Semua', count: () => stats().total },
        { id: 'NEW', label: 'Pesanan Baru', count: () => stats().new },
        { id: 'PROCESS', label: 'Diproses', count: () => stats().process },
        { id: 'DONE', label: 'Selesai', count: () => stats().done },
        { id: 'CANCELLED', label: 'Dibatalkan', count: () => stats().cancelled }
    ];
</script>

<div class="space-y-10 pb-24 relative">
    <header class="flex flex-col md:flex-row md:items-start justify-between gap-6" in:fly={{ y: -20, duration: 500 }}>
        <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Manajemen Pesanan 🧾</h1>
            <p class="text-zinc-500 font-medium mt-2">Pantau seluruh pesanan, validasi status, dan lakukan override jika diperlukan.</p>
        </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Pesanan', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
            { label: 'Pesanan Baru', value: stats().new, color: 'text-blue-600' },
            { label: 'Diproses', value: stats().process, color: 'text-amber-600' },
            { label: 'Selesai', value: stats().done, color: 'text-emerald-600' },
            { label: 'Dibatalkan', value: stats().cancelled, color: 'text-red-500' }
        ] as stat}
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <p class="text-3xl font-black {stat.color} italic">{stat.value}</p>
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
                    {#if tab.count() > 0}
                        <span class="px-2 py-0.5 rounded-md text-[9px] {activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">{tab.count()}</span>
                    {/if}
                </button>
            {/each}
        </div>

        <!-- Order List -->
        <div class="space-y-4">
            {#each filteredOrders() as order (order.id)}
                <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 p-8" in:scale={{ start: 0.98, duration: 300 }}>
                    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div class="flex-1 space-y-4">
                            <div class="flex flex-wrap items-center gap-3">
                                <span class="text-sm font-black text-brand-charcoal dark:text-white">{order.orderNumber}</span>
                                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {statusColor(order.status)}">{statusLabel(order.status)}</span>
                                <span class="text-[10px] font-black uppercase {paymentColor(order.paymentStatus)}">{paymentLabel(order.paymentStatus)}</span>
                                {#if order.updatedBy === 'admin'}
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider border border-red-200 dark:border-red-800">⚡ Admin Override</span>
                                {/if}
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Customer</p>
                                    <p class="text-sm font-bold text-brand-charcoal dark:text-white">{order.customerName}</p>
                                    <p class="text-xs text-zinc-400">{order.whatsapp}</p>
                                </div>
                                <div>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pengiriman</p>
                                    <p class="text-sm font-bold text-brand-charcoal dark:text-white">{order.deliveryDate}</p>
                                    <p class="text-xs text-zinc-400 line-clamp-1">{order.address}</p>
                                </div>
                                <div>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
                                    <p class="text-xl font-black text-brand-charcoal dark:text-white italic">{formatPrice(order.total)}</p>
                                </div>
                            </div>

                            <!-- Confirmation status -->
                            {#if order.status === 'processing' || order.status === 'completed'}
                                <div class="flex flex-wrap gap-2">
                                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase {order.completedConfirmedByUser ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}">
                                        {order.completedConfirmedByUser ? '✓' : '○'} User
                                    </span>
                                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase {order.completedConfirmedByCs ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}">
                                        {order.completedConfirmedByCs ? '✓' : '○'} CS
                                    </span>
                                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase {order.completedConfirmedByAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}">
                                        {order.completedConfirmedByAdmin ? '✓' : '○'} Admin
                                    </span>
                                </div>
                            {/if}
                        </div>

                        <!-- Actions -->
                        <div class="flex flex-wrap lg:flex-col gap-3 lg:min-w-[180px]">
                            <button onclick={() => openDetail(order)} class="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all">Detail</button>
                            <button onclick={() => openOverride(order)} class="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-all border border-amber-200 dark:border-amber-800">Override Status</button>
                            {#if !order.completedConfirmedByAdmin && order.status !== 'cancelled'}
                                <button onclick={() => confirmComplete(order.id)} class="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200 dark:border-emerald-800">Konfirmasi Selesai</button>
                            {/if}
                            {#if order.status !== 'cancelled'}
                                <button onclick={() => openCancel(order)} class="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all border border-red-200 dark:border-red-800">Batalkan</button>
                            {/if}
                        </div>
                    </div>

                    {#if order.adminNote}
                        <div class="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 bg-red-50/50 dark:bg-red-900/10 rounded-2xl px-6 py-4">
                            <p class="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Catatan Admin</p>
                            <p class="text-xs font-medium text-zinc-600 dark:text-zinc-400">{order.adminNote}</p>
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800" in:fade>
                    <p class="text-2xl font-black text-zinc-300 dark:text-zinc-700">Tidak ada pesanan</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal Detail -->
<Modal show={showDetailModal} title="Detail Pesanan 🧾" onClose={() => showDetailModal = false}>
    {#if selectedOrder}
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Order Number</p><p class="text-sm font-black text-brand-charcoal dark:text-white">{selectedOrder.orderNumber}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p><span class="px-3 py-1 rounded-full text-[10px] font-black {statusColor(selectedOrder.status)}">{statusLabel(selectedOrder.status)}</span></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Customer</p><p class="text-sm font-bold">{selectedOrder.customerName}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">WhatsApp</p><p class="text-sm font-bold">{selectedOrder.whatsapp}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Pesan</p><p class="text-sm font-bold">{selectedOrder.orderDate}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tgl Antar</p><p class="text-sm font-bold">{selectedOrder.deliveryDate}</p></div>
                <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Alamat</p><p class="text-sm font-bold">{selectedOrder.address}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p><p class="text-lg font-black text-brand-charcoal dark:text-white italic">{formatPrice(selectedOrder.total)}</p></div>
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pembayaran</p><p class="text-sm font-bold {paymentColor(selectedOrder.paymentStatus)}">{paymentLabel(selectedOrder.paymentStatus)}</p></div>
            </div>
            <div>
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Item Pesanan</p>
                <div class="space-y-2">
                    {#each selectedOrder.items as item}
                        <div class="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                            <span class="text-sm font-bold">{item.name} x{item.quantity}</span>
                            <span class="text-sm font-black">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    {/each}
                </div>
            </div>
            {#if selectedOrder.notes}
                <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Customer</p><p class="text-sm">{selectedOrder.notes}</p></div>
            {/if}
            <div class="grid grid-cols-3 gap-3">
                <div class="p-3 rounded-xl text-center {selectedOrder.completedConfirmedByUser ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-zinc-50 dark:bg-zinc-800'}">
                    <p class="text-lg">{selectedOrder.completedConfirmedByUser ? '✓' : '○'}</p>
                    <p class="text-[9px] font-black text-zinc-400 uppercase">Konfirmasi User</p>
                </div>
                <div class="p-3 rounded-xl text-center {selectedOrder.completedConfirmedByCs ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-zinc-50 dark:bg-zinc-800'}">
                    <p class="text-lg">{selectedOrder.completedConfirmedByCs ? '✓' : '○'}</p>
                    <p class="text-[9px] font-black text-zinc-400 uppercase">Konfirmasi CS</p>
                </div>
                <div class="p-3 rounded-xl text-center {selectedOrder.completedConfirmedByAdmin ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-zinc-50 dark:bg-zinc-800'}">
                    <p class="text-lg">{selectedOrder.completedConfirmedByAdmin ? '✓' : '○'}</p>
                    <p class="text-[9px] font-black text-zinc-400 uppercase">Konfirmasi Admin</p>
                </div>
            </div>
            {#if selectedOrder.adminNote}
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <p class="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Catatan Admin</p>
                    <p class="text-sm">{selectedOrder.adminNote}</p>
                </div>
            {/if}
            {#if selectedOrder.cancellationReason}
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                    <p class="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Alasan Pembatalan (oleh {selectedOrder.cancelledBy})</p>
                    <p class="text-sm">{selectedOrder.cancellationReason}</p>
                </div>
            {/if}
        </div>
    {/if}
</Modal>

<!-- Modal Override Status -->
<Modal show={showOverrideModal} title="Override Status Pesanan ⚡" onClose={() => showOverrideModal = false}>
    {#if selectedOrder}
        <div class="space-y-5">
            <div class="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
                <p class="text-xs font-bold text-amber-700 dark:text-amber-400">⚠️ Override akan mengubah status secara langsung dan dicatat sebagai aksi Admin.</p>
            </div>
            <div>
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pesanan</p>
                <p class="text-sm font-black">{selectedOrder.orderNumber} — {selectedOrder.customerName}</p>
            </div>
            <div class="space-y-2">
                <label for="overrideStatus" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Baru *</label>
                <select id="overrideStatus" bind:value={overrideStatus} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-400 transition-all">
                    {#each statusOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
                </select>
            </div>
            <div class="space-y-2">
                <label for="overrideNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan Admin *</label>
                <textarea id="overrideNote" bind:value={overrideNote} rows="3" placeholder="Jelaskan alasan override ini..." class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-400 transition-all resize-none"></textarea>
                {#if overrideError}<p class="text-[10px] font-bold text-red-500">{overrideError}</p>{/if}
            </div>
            <div class="flex gap-3 pt-2">
                <button onclick={() => showOverrideModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Batal</button>
                <button onclick={saveOverride} class="flex-1 py-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Simpan Override</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Modal Batalkan -->
<Modal show={showCancelModal} title="Batalkan Pesanan (Admin) 🚫" onClose={() => showCancelModal = false}>
    {#if selectedOrder}
        <div class="space-y-5">
            <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
                <p class="text-xs font-bold text-red-700 dark:text-red-400">Pesanan <strong>{selectedOrder.orderNumber}</strong> akan dibatalkan atas nama Admin.</p>
            </div>
            <div class="space-y-2">
                <label for="cancelReason" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alasan Pembatalan *</label>
                <textarea id="cancelReason" bind:value={cancelReason} rows="3" placeholder="Tuliskan alasan pembatalan..." class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-400 transition-all resize-none"></textarea>
                {#if cancelError}<p class="text-[10px] font-bold text-red-500">{cancelError}</p>{/if}
            </div>
            <div class="flex gap-3 pt-2">
                <button onclick={() => showCancelModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Batal</button>
                <button onclick={saveCancel} class="flex-1 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Batalkan Pesanan</button>
            </div>
        </div>
    {/if}
</Modal>

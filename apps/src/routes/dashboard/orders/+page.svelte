<script lang="ts">
    import { dashboardOrders as initialDashboardOrders, formatRupiah } from '$lib/mock/orders_dashboard';
    import { getPrimaryPaymentAccount } from '$lib/mock/paymentAccounts';
    import OrderTabs from '$lib/components/dashboard/OrderTabs.svelte';
    import ActiveOrdersList from '$lib/components/dashboard/ActiveOrdersList.svelte';
    import HistoryOrdersList from '$lib/components/dashboard/HistoryOrdersList.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import { fade, fly, scale } from 'svelte/transition';

    let orders = $state([...initialDashboardOrders]);
    let activeTab = $state<'ACTIVE' | 'HISTORY'>('ACTIVE');

    // Detail Modal State
    let showDetail = $state(false);
    let selectedOrder = $state<any>(null);
    let isUploading = $state(false);
    let uploadNote = $state('');

    const primaryPayment = getPrimaryPaymentAccount();

    function handleDetail(id: string) {
        selectedOrder = orders.find(o => o.id === id);
        showDetail = true;
    }

    const stats = $derived({
        total: orders.length,
        active: orders.filter(o => o.type === 'active').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length
    });

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0 || !selectedOrder) return;

        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar.');
            return;
        }

        isUploading = true;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxWidth = 800;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                // Update local state
                orders = orders.map(o => {
                    if (o.id === selectedOrder.id) {
                        return {
                            ...o,
                            paymentStatus: 'waiting_verification',
                            paymentProof: {
                                imageUrl: dataUrl,
                                fileName: file.name,
                                uploadedAt: new Date().toISOString(),
                                uploadedBy: 'user',
                                status: 'uploaded',
                                note: uploadNote
                            }
                        };
                    }
                    return o;
                });

                selectedOrder = orders.find(o => o.id === selectedOrder.id);
                isUploading = false;
                uploadNote = '';
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
</script>

<div class="space-y-8">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div in:fly={{ y: -20, duration: 500 }}>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter">Pesanan Saya 🛍️</h1>
            <p class="text-zinc-500 font-medium mt-2">Pantau status pesanan aktif dan lihat riwayat katering Anda.</p>
        </div>
        
        <div class="flex gap-4" in:fly={{ x: 20, duration: 500 }}>
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
                <ActiveOrdersList orders={orders} onDetail={handleDetail} />
            </div>
        {:else}
            <div in:fade={{ duration: 200 }}>
                <HistoryOrdersList orders={orders} onDetail={handleDetail} />
            </div>
        {/if}
    </div>
</div>

<!-- Modal Detail Pesanan & Pembayaran -->
<Modal show={showDetail} title="Detail Pesanan & Pembayaran" onClose={() => showDetail = false} maxWidth="max-w-3xl">
    {#if selectedOrder}
        <div class="space-y-8">
            <!-- Order Header -->
            <div class="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">#{selectedOrder.orderNumber}</h3>
                    <p class="text-sm text-zinc-500 font-medium">{selectedOrder.menuName}</p>
                </div>
                <div class="text-right">
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Tagihan</p>
                    <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{formatRupiah(selectedOrder.total)}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Order Items -->
                <div class="space-y-4">
                    <h4 class="text-xs font-black uppercase tracking-widest text-zinc-400">Daftar Menu</h4>
                    <div class="space-y-3">
                        {#each selectedOrder.items as item}
                            <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <span class="text-sm font-bold text-zinc-600 dark:text-zinc-300">{item.quantity}x {item.name}</span>
                                <span class="text-sm font-black italic">{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Payment Section -->
                <div class="space-y-6">
                    <h4 class="text-xs font-black uppercase tracking-widest text-zinc-400">Informasi Pembayaran</h4>
                    
                    {#if selectedOrder.paymentStatus === 'paid'}
                        <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl text-center">
                            <span class="text-3xl mb-3 block">✅</span>
                            <h5 class="text-lg font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Pembayaran Lunas</h5>
                            <p class="text-xs text-emerald-600 dark:text-emerald-500 font-medium mt-1">Terima kasih atas pembayaran Anda.</p>
                        </div>
                    {:else if selectedOrder.paymentStatus === 'waiting_verification'}
                        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl text-center">
                            <span class="text-3xl mb-3 block">⏳</span>
                            <h5 class="text-lg font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter">Menunggu Verifikasi</h5>
                            <p class="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1">Admin kami sedang memvalidasi bukti pembayaran Anda.</p>
                            
                            {#if selectedOrder.paymentProof}
                                <div class="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex flex-col items-center gap-3">
                                    <img src={selectedOrder.paymentProof.imageUrl} alt="Bukti Transfer" class="w-24 h-32 object-cover rounded-lg shadow-md" />
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">{selectedOrder.paymentProof.fileName}</p>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                            {#if primaryPayment}
                                <div class="space-y-4">
                                    <p class="text-xs font-bold text-zinc-500">Silakan transfer ke rekening berikut:</p>
                                    <div class="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                        <div class="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white text-xl">🏦</div>
                                        <div>
                                            <p class="text-xs font-black uppercase tracking-tighter">{primaryPayment.bankName}</p>
                                            <p class="text-lg font-black italic tracking-widest">{primaryPayment.accountNumber}</p>
                                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">a.n. {primaryPayment.accountHolder}</p>
                                        </div>
                                    </div>
                                    {#if primaryPayment.qrImageUrl}
                                        <div class="flex justify-center pt-2">
                                            <img src={primaryPayment.qrImageUrl} alt="QRIS" class="w-32 h-32 object-contain" />
                                        </div>
                                    {/if}
                                </div>
                            {/if}

                            <div class="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <label class="block">
                                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Catatan Pembayaran (Opsional)</span>
                                    <textarea bind:value={uploadNote} rows="2" class="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary" placeholder="Contoh: Transfer via m-BCA a.n. Budi..."></textarea>
                                </label>

                                <label class="relative block w-full group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onchange={handleFileUpload}
                                        class="sr-only"
                                        disabled={isUploading}
                                    />
                                    <div class="w-full py-5 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl flex items-center justify-center gap-3 cursor-pointer group-hover:scale-[1.02] transition-all shadow-xl">
                                        {#if isUploading}
                                            <span class="animate-spin text-xl">🌀</span>
                                            <span class="text-[11px] font-black uppercase tracking-widest">Memproses...</span>
                                        {:else}
                                            <span class="text-xl">📸</span>
                                            <span class="text-[11px] font-black uppercase tracking-widest">Upload Bukti Transfer</span>
                                        {/if}
                                    </div>
                                </label>
                                <p class="text-[9px] text-zinc-400 font-medium text-center italic">Format: JPG, PNG. Maksimal 5MB.</p>
                            </div>
                        </div>
                    {/if}

                    {#if selectedOrder.paymentProof?.status === 'rejected'}
                        <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl space-y-3">
                            <h5 class="text-sm font-black text-red-600 uppercase tracking-tighter">Bukti Ditolak ❌</h5>
                            <p class="text-xs text-red-700 dark:text-red-400 font-bold bg-white/50 dark:bg-black/20 p-3 rounded-xl border-l-4 border-red-400 italic">"{selectedOrder.paymentProof.rejectionReason}"</p>
                            <p class="text-[9px] text-zinc-400 font-medium">Silakan upload ulang bukti pembayaran yang valid.</p>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="flex gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button onclick={() => showDetail = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Tutup</button>
            </div>
        </div>
    {/if}
</Modal>


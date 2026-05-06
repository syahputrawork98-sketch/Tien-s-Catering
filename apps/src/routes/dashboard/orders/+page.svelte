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
    
    // New states for selection
    let selectedPlan = $state<import('$lib/mock/orders').MockPaymentPlan | null>(null);
    let selectedMethod = $state<import('$lib/mock/orders').MockPaymentMethod | null>(null);

    const primaryPayment = getPrimaryPaymentAccount();

    function handleDetail(id: string) {
        selectedOrder = orders.find(o => o.id === id);
        selectedPlan = selectedOrder?.paymentPlan || null;
        selectedMethod = selectedOrder?.paymentMethod || null;
        showDetail = true;
    }

    const stats = $derived({
        total: orders.length,
        active: orders.filter(o => o.type === 'active').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length
    });

    function setPaymentPlan(plan: any) {
        selectedPlan = plan;
        if (plan === 'cod_full') {
            selectedMethod = 'cod_cash';
        }
    }

    function confirmPaymentPlan() {
        if (!selectedOrder || !selectedPlan) return;
        
        orders = orders.map(o => {
            if (o.id === selectedOrder.id) {
                const breakdown = {
                    totalAmount: o.total,
                    paidAmount: 0,
                    remainingAmount: o.total,
                    dpRequired: selectedPlan === 'dp_then_remaining',
                    dpPercent: selectedPlan === 'dp_then_remaining' ? 30 : undefined,
                    dpAmount: selectedPlan === 'dp_then_remaining' ? Math.round(o.total * 0.3) : undefined
                };
                
                return {
                    ...o,
                    paymentPlan: selectedPlan,
                    paymentMethod: selectedMethod || (selectedPlan === 'cod_full' ? 'cod_cash' : 'bank_transfer'),
                    paymentStatus: selectedPlan === 'cod_full' ? 'cod_pending' : 'unpaid',
                    paymentBreakdown: breakdown,
                    codCollection: selectedPlan === 'cod_full' ? { expectedAmount: o.total } : undefined
                };
            }
            return o;
        });
        
        selectedOrder = orders.find(o => o.id === selectedOrder.id);
    }

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
                
                // Determine stage
                let stage: 'full' | 'dp' | 'remaining' = 'full';
                if (selectedOrder.paymentPlan === 'dp_then_remaining') {
                    stage = selectedOrder.paymentStatus === 'unpaid' ? 'dp' : 'remaining';
                }

                const newProof: import('../../../lib/mock/orders').MockPaymentProof = {
                    id: `PROOF-${Date.now()}`,
                    stage: stage,
                    imageUrl: dataUrl,
                    fileName: file.name,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: 'user',
                    amount: stage === 'dp' ? (selectedOrder.paymentBreakdown?.dpAmount || 0) : (selectedOrder.paymentBreakdown?.remainingAmount || selectedOrder.total),
                    method: (selectedOrder.paymentMethod === 'qris' ? 'qris' : 'bank_transfer') as 'bank_transfer' | 'qris',
                    status: 'uploaded',
                    note: uploadNote,
                    originalSizeKb: Math.round(file.size / 1024),
                    compressedSizeKb: Math.round(dataUrl.length * 0.75 / 1024),
                    resizedWidth: width,
                    resizedHeight: height
                };

                // Update local state
                orders = orders.map(o => {
                    if (o.id === selectedOrder.id) {
                        const existingProofs = o.paymentProofs || [];
                        return {
                            ...o,
                            paymentStatus: 'waiting_verification',
                            paymentProofs: [...existingProofs, newProof],
                            paymentProof: newProof // legacy
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
                    
                    {#if !selectedOrder.paymentPlan}
                        <!-- Plan Selection UI -->
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-8">
                            <div class="space-y-2">
                                <h5 class="text-sm font-black uppercase tracking-tighter">Pilih Metode Pembayaran</h5>
                                <p class="text-[10px] text-zinc-400 font-medium">Silakan pilih rencana pembayaran yang paling nyaman untuk Anda.</p>
                            </div>

                            <div class="grid grid-cols-1 gap-4">
                                <!-- Option: Full Prepaid -->
                                <button 
                                    onclick={() => setPaymentPlan('full_prepaid')}
                                    class="text-left p-6 rounded-2xl border-2 transition-all group
                                    {selectedPlan === 'full_prepaid' ? 'bg-brand-primary/5 border-brand-primary' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'}"
                                >
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-black uppercase tracking-widest {selectedPlan === 'full_prepaid' ? 'text-brand-primary' : 'text-zinc-400'}">Bayar Penuh Sekarang</span>
                                        {#if selectedPlan === 'full_prepaid'}<span class="text-brand-primary">✨</span>{/if}
                                    </div>
                                    <p class="text-[10px] font-medium text-zinc-500 leading-relaxed">Transfer/QRIS dan upload bukti pembayaran. Pesanan akan diproses setelah pembayaran divalidasi.</p>
                                </button>

                                <!-- Option: DP (Hanya untuk order >= 500k atau paket) -->
                                {#if selectedOrder.total >= 500000 || selectedOrder.items.some((i: any) => i.name.toLowerCase().includes('paket'))}
                                    <button 
                                        onclick={() => setPaymentPlan('dp_then_remaining')}
                                        class="text-left p-6 rounded-2xl border-2 transition-all group
                                        {selectedPlan === 'dp_then_remaining' ? 'bg-blue-50/50 border-blue-500' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'}"
                                    >
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs font-black uppercase tracking-widest {selectedPlan === 'dp_then_remaining' ? 'text-blue-500' : 'text-zinc-400'}">DP Dulu (30%)</span>
                                            {#if selectedPlan === 'dp_then_remaining'}<span class="text-blue-500">🛡️</span>{/if}
                                        </div>
                                        <p class="text-[10px] font-medium text-zinc-500 leading-relaxed">Bayar uang muka untuk mengamankan pesanan. Sisa pembayaran dapat dilunasi sebelum atau saat pengiriman.</p>
                                    </button>
                                {/if}

                                <!-- Option: COD (Hanya untuk order < 2jt) -->
                                {#if selectedOrder.total < 2000000}
                                    <button 
                                        onclick={() => setPaymentPlan('cod_full')}
                                        class="text-left p-6 rounded-2xl border-2 transition-all group
                                        {selectedPlan === 'cod_full' ? 'bg-amber-50/50 border-amber-500' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'}"
                                    >
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs font-black uppercase tracking-widest {selectedPlan === 'cod_full' ? 'text-amber-500' : 'text-zinc-400'}">Bayar di Tempat (COD)</span>
                                            {#if selectedPlan === 'cod_full'}<span class="text-amber-500">🚚</span>{/if}
                                        </div>
                                        <p class="text-[10px] font-medium text-zinc-500 leading-relaxed">Bayar tunai atau transfer saat pesanan diantar. Pembayaran akan dikonfirmasi oleh CS/Admin.</p>
                                    </button>
                                {/if}
                            </div>

                            {#if selectedPlan && selectedPlan !== 'cod_full'}
                                <div class="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800" in:fade>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Pilih Metode Transfer</p>
                                    <div class="flex gap-3">
                                        <button 
                                            onclick={() => selectedMethod = 'bank_transfer'}
                                            class="flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all
                                            {selectedMethod === 'bank_transfer' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}"
                                        >Bank Transfer</button>
                                        <button 
                                            onclick={() => selectedMethod = 'qris'}
                                            class="flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all
                                            {selectedMethod === 'qris' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}"
                                        >QRIS</button>
                                    </div>
                                </div>
                            {/if}

                            <button 
                                onclick={confirmPaymentPlan}
                                disabled={!selectedPlan || (selectedPlan !== 'cod_full' && !selectedMethod)}
                                class="w-full py-5 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                            >
                                Konfirmasi & Lanjutkan
                            </button>
                        </div>
                    {:else}
                        <!-- Payment Status & Actions -->
                        <div class="space-y-6">
                            <!-- Breakdown Card -->
                            <div class="bg-zinc-900 dark:bg-zinc-950 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                                <div class="absolute top-0 right-0 p-6 opacity-10 text-4xl">💰</div>
                                <div class="space-y-4 relative z-10">
                                    <div class="flex justify-between items-end border-b border-white/10 pb-4">
                                        <div>
                                            <p class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Status Pembayaran</p>
                                            <p class="text-lg font-black italic text-brand-primary uppercase tracking-tighter">
                                                {selectedOrder.paymentStatus === 'paid' ? 'Lunas' : 
                                                 selectedOrder.paymentStatus === 'partially_paid' ? 'DP Terbayar' : 
                                                 selectedOrder.paymentStatus === 'waiting_verification' ? 'Menunggu Verifikasi' : 
                                                 selectedOrder.paymentStatus === 'cod_pending' ? 'COD Pending' : 'Belum Bayar'}
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Tagihan</p>
                                            <p class="text-xl font-black italic">{formatRupiah(selectedOrder.total)}</p>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4 text-[10px]">
                                        <div class="bg-white/5 p-4 rounded-xl">
                                            <p class="text-white/40 font-black uppercase mb-1">Sudah Dibayar</p>
                                            <p class="text-emerald-400 font-black">{formatRupiah(selectedOrder.paymentBreakdown?.paidAmount || 0)}</p>
                                        </div>
                                        <div class="bg-white/5 p-4 rounded-xl">
                                            <p class="text-white/40 font-black uppercase mb-1">Sisa Tagihan</p>
                                            <p class="text-amber-400 font-black">{formatRupiah(selectedOrder.paymentBreakdown?.remainingAmount || selectedOrder.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {#if selectedOrder.paymentStatus === 'paid'}
                                <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl text-center">
                                    <span class="text-3xl mb-3 block">✅</span>
                                    <h5 class="text-lg font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Pembayaran Lunas</h5>
                                    <p class="text-xs text-emerald-600 dark:text-emerald-500 font-medium mt-1 italic">Terima kasih atas kepercayaan Anda.</p>
                                </div>
                            {:else if selectedOrder.paymentStatus === 'cod_pending'}
                                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[2.5rem] space-y-4">
                                    <div class="flex items-center gap-4">
                                        <span class="text-4xl">🚚</span>
                                        <div>
                                            <h5 class="text-base font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter">Metode COD Aktif</h5>
                                            <p class="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest italic">Bayar saat pesanan sampai</p>
                                        </div>
                                    </div>
                                    <p class="text-xs text-amber-700 dark:text-amber-500 font-medium leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-2xl border-l-4 border-amber-400">
                                        Silakan siapkan dana sebesar <span class="font-black italic">{formatRupiah(selectedOrder.total)}</span>. Pembayaran akan dikonfirmasi oleh kurir/CS setelah uang diterima.
                                    </p>
                                </div>
                            {:else}
                                <!-- Upload Section -->
                                <div class="bg-zinc-50 dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 space-y-8">
                                    {#if primaryPayment}
                                        <div class="space-y-4">
                                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Instruksi Pembayaran</p>
                                            <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                                <div class="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">🏦</div>
                                                <div class="flex-1">
                                                    <div class="flex justify-between items-start">
                                                        <p class="text-[10px] font-black uppercase tracking-tighter text-zinc-400">{primaryPayment.bankName}</p>
                                                        {#if selectedOrder.paymentMethod === 'qris'}
                                                            <span class="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase rounded">QRIS Aktif</span>
                                                        {/if}
                                                    </div>
                                                    <p class="text-xl font-black italic tracking-widest text-brand-charcoal dark:text-white mt-0.5">{primaryPayment.accountNumber}</p>
                                                    <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">a.n. {primaryPayment.accountHolder}</p>
                                                </div>
                                            </div>
                                            
                                            {#if selectedOrder.paymentMethod === 'qris' && primaryPayment.qrImageUrl}
                                                <div class="flex justify-center pt-4">
                                                    <div class="bg-white p-4 rounded-3xl border border-zinc-100 shadow-xl group">
                                                        <img src={primaryPayment.qrImageUrl} alt="QRIS" class="w-40 h-40 object-contain group-hover:scale-105 transition-transform" />
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}

                                    <div class="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <div class="flex items-center justify-between">
                                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Upload Bukti {selectedOrder.paymentStatus === 'partially_paid' ? 'Pelunasan' : 'Pembayaran'}</p>
                                            <p class="text-[10px] font-black text-brand-primary italic uppercase tracking-widest">
                                                {selectedOrder.paymentStatus === 'partially_paid' ? formatRupiah(selectedOrder.paymentBreakdown.remainingAmount) : formatRupiah(selectedOrder.paymentBreakdown?.dpAmount || selectedOrder.total)}
                                            </p>
                                        </div>
                                        
                                        <textarea bind:value={uploadNote} rows="2" class="w-full px-5 py-4 bg-white dark:bg-zinc-900 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-primary shadow-inner" placeholder="Catatan tambahan (opsional)..."></textarea>

                                        <label class="relative block w-full group">
                                            <input type="file" accept="image/*" onchange={handleFileUpload} class="sr-only" disabled={isUploading} />
                                            <div class="w-full py-5 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl flex items-center justify-center gap-4 cursor-pointer group-hover:scale-[1.02] transition-all shadow-2xl overflow-hidden relative">
                                                {#if isUploading}
                                                    <span class="animate-spin text-2xl">🌀</span>
                                                    <span class="text-xs font-black uppercase tracking-widest italic">Memproses Bukti...</span>
                                                {:else}
                                                    <span class="text-2xl">📤</span>
                                                    <span class="text-xs font-black uppercase tracking-widest italic">Kirim Bukti Pembayaran</span>
                                                {/if}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            {/if}

                            <!-- Proof History -->
                            {#if selectedOrder.paymentProofs && selectedOrder.paymentProofs.length > 0}
                                <div class="space-y-4">
                                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Riwayat Bukti Pembayaran</p>
                                    <div class="space-y-3">
                                        {#each selectedOrder.paymentProofs as proof}
                                            <div class="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group/proof hover:border-zinc-300 transition-all">
                                                <div class="w-16 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-inner flex-shrink-0 relative">
                                                    <img src={proof.imageUrl} alt="Proof" class="w-full h-full object-cover" />
                                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/proof:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span class="text-[8px] font-black text-white uppercase tracking-tighter">View</span>
                                                    </div>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex justify-between items-start mb-1">
                                                        <span class="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded
                                                            {proof.stage === 'dp' ? 'bg-blue-100 text-blue-600' : 
                                                             proof.stage === 'remaining' ? 'bg-purple-100 text-purple-600' : 
                                                             'bg-zinc-100 text-zinc-600'}">
                                                            {proof.stage === 'dp' ? 'Uang Muka' : proof.stage === 'remaining' ? 'Pelunasan' : 'Penuh'}
                                                        </span>
                                                        <span class="text-[8px] font-bold text-zinc-400 uppercase">{proof.uploadedAt.split('T')[0]}</span>
                                                    </div>
                                                    <p class="text-xs font-black italic text-brand-charcoal dark:text-white truncate">{formatRupiah(proof.amount)}</p>
                                                    <div class="flex items-center gap-2 mt-1">
                                                        <span class="text-[9px] font-black uppercase tracking-widest
                                                            {proof.status === 'verified' ? 'text-emerald-500' : 
                                                             proof.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}">
                                                            {proof.status === 'verified' ? 'Terverifikasi ✓' : proof.status === 'rejected' ? 'Ditolak ✗' : 'Menunggu •'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {#if proof.status === 'rejected'}
                                                <div class="px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 -mt-1 ml-4 border-l-4">
                                                    <p class="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Alasan Penolakan:</p>
                                                    <p class="text-xs font-medium text-red-700 dark:text-red-400 italic leading-relaxed">"{proof.rejectionReason}"</p>
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                </div>
                            {/if}
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


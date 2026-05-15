<script lang="ts">
    import { formatRupiah, type Order, type OrderStatus as UiOrderStatus } from '$lib/mock/orders_dashboard';
    import type { MockPaymentBreakdown, MockPaymentMethod, MockPaymentPlan, MockPaymentProof, MockPaymentStatus } from '$lib/mock/orders';
    import { getPrimaryPaymentAccount } from '$lib/mock/paymentAccounts';
    import OrderTabs from '$lib/components/dashboard/OrderTabs.svelte';
    import ActiveOrdersList from '$lib/components/dashboard/ActiveOrdersList.svelte';
    import HistoryOrdersList from '$lib/components/dashboard/HistoryOrdersList.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth.svelte';

    let orders = $state<Order[]>([]);
    let loading = $state(true);
    let error = $state('');
    let activeTab = $state<'ACTIVE' | 'HISTORY'>('ACTIVE');

    // Detail Modal State
    let showDetail = $state(false);
    let selectedOrder = $state<Order | null>(null);
    let isUploading = $state(false);
    let uploadNote = $state('');

    // New states for selection
    let selectedPlan = $state<MockPaymentPlan | null>(null);
    let selectedMethod = $state<MockPaymentMethod | null>(null);

    const primaryPayment = getPrimaryPaymentAccount();

    function mapStatus(status: string): UiOrderStatus {
        const s = status.toLowerCase();
        if (s === 'new' || s === 'confirmed') return 'PENDING';
        if (s === 'processing' || s === 'ready') return 'PROCESSING';
        if (s === 'delivered') return 'SHIPPED';
        if (s === 'completed') return 'COMPLETED';
        if (s === 'cancelled') return 'CANCELLED';
        return 'PENDING';
    }

    function mapPaymentStatus(status: string): MockPaymentStatus {
        const s = status.toLowerCase();
        if (s === 'unpaid') return 'unpaid';
        if (s === 'waiting_verification') return 'waiting_verification';
        if (s === 'paid') return 'paid';
        if (s === 'cod' || s === 'cod_pending') return 'cod_pending';
        if (s === 'rejected') return 'rejected';
        return 'unpaid';
    }

    function mapType(status: string): 'active' | 'history' {
        const s = status.toLowerCase();
        return ['completed', 'cancelled'].includes(s) ? 'history' : 'active';
    }

    function extractMenuName(items: any[]): string {
        if (!items.length) return 'Pesanan Catering';
        if (items.length === 1) return items[0].name;
        return `${items[0].name} +${items.length - 1} item`;
    }

    function mapApiOrderToUiOrder(apiOrder: any): Order {
        return {
            id: apiOrder.id,
            orderNumber: apiOrder.orderNumber,
            menuName: extractMenuName(apiOrder.items),
            orderDate: apiOrder.orderDate,
            deliveryDate: apiOrder.deliveryDate,
            status: mapStatus(apiOrder.status),
            total: apiOrder.total,
            items: apiOrder.items.map((i: any) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
            })),
            type: mapType(apiOrder.status),
            paymentStatus: mapPaymentStatus(apiOrder.paymentStatus),
            paymentMethod: apiOrder.paymentMethod === 'cod' ? 'cod_cash' :
                           apiOrder.paymentMethod === 'qris' ? 'qris' :
                           apiOrder.paymentMethod === 'transfer' ? 'bank_transfer' : 'bank_transfer',
            paymentBreakdown: {
                totalAmount: apiOrder.total,
                paidAmount: apiOrder.payment?.paidAmount ?? 0,
                remainingAmount: apiOrder.payment?.remainingAmount ?? apiOrder.total,
                dpRequired: false
            },
            paymentProofs: [],
            paymentProof: apiOrder.paymentProof ? {
                id: apiOrder.paymentProof.id,
                fileName: apiOrder.paymentProof.fileName,
                uploadedAt: apiOrder.paymentProof.uploadedAt,
                status: apiOrder.paymentProof.status,
                imageUrl: apiOrder.paymentProof.filePath, // filePath is data URL in this simulation
                method: apiOrder.paymentMethod === 'qris' ? 'qris' : 'bank_transfer',
                amount: apiOrder.total, // Simplified for now
                stage: 'full', // Default for simulation
                uploadedBy: 'user', // Default for simulation
                rejectionReason: apiOrder.paymentProof.verificationNote // Display admin note as rejection reason
            } : undefined,
            paymentPlan: apiOrder.paymentMethod === 'cod' ? 'cod_full' : 'full_prepaid',
            deliveryInfo: apiOrder.deliveryInfo ? {
                departmentOrUnit: apiOrder.deliveryInfo.departmentOrUnit || null,
                floor: apiOrder.deliveryInfo.floor || null,
                locationNote: apiOrder.deliveryInfo.locationNote || null,
                addressSummary: apiOrder.deliveryInfo.addressSummary || null
            } : undefined,
            userId: apiOrder.userId
        };
    }

    async function loadOrders() {
        loading = true;
        error = '';
        try {
            const query = authStore.isAuthenticated ? `?userId=${authStore.user?.id}` : '';
            const response = await fetch(`/api/orders${query}`);

            if (response.status === 401) {
                error = 'Sesi Anda telah berakhir. Silakan pilih kembali akun melalui Persona Switcher.';
                return;
            }

            if (!response.ok) throw new Error('Gagal mengambil data pesanan.');
            const data = await response.json();
            if (Array.isArray(data.items)) {
                orders = data.items.map(mapApiOrderToUiOrder);
            }
        } catch (e: any) {
            console.error(e);
            error = e.message || 'Terjadi kesalahan saat memuat data.';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadOrders();
    });

    function getOrderById(orderId: string): Order | null {
        return orders.find((order) => order.id === orderId) ?? null;
    }

    function getPaymentBreakdown(order: Order): MockPaymentBreakdown {
        return {
            totalAmount: order.paymentBreakdown?.totalAmount ?? order.total,
            paidAmount: order.paymentBreakdown?.paidAmount ?? 0,
            remainingAmount: order.paymentBreakdown?.remainingAmount ?? order.total,
            dpRequired: order.paymentBreakdown?.dpRequired ?? false,
            dpPercent: order.paymentBreakdown?.dpPercent,
            dpAmount: order.paymentBreakdown?.dpAmount
        };
    }

    function getOrderProofHistory(order: any): MockPaymentProof[] {
        if (order.paymentProofs && order.paymentProofs.length > 0) {
            return order.paymentProofs;
        }

        if (order.paymentProof) {
            return [order.paymentProof];
        }

        return [];
    }

    function hasPackageItem(order: Order): boolean {
        return order.items.some((item) => item.name.toLowerCase().includes('paket'));
    }

    function getUploadAmount(order: Order): number {
        const breakdown = getPaymentBreakdown(order);

        if (order.paymentStatus === 'partially_paid') {
            return breakdown.remainingAmount;
        }

        if (order.paymentPlan === 'dp_then_remaining') {
            return breakdown.dpAmount ?? breakdown.remainingAmount;
        }

        return breakdown.totalAmount;
    }

    const selectedOrderBreakdown = $derived(selectedOrder ? getPaymentBreakdown(selectedOrder) : null);
    const selectedOrderProofHistory = $derived(selectedOrder ? getOrderProofHistory(selectedOrder) : []);
    const selectedOrderHasPackageMenu = $derived(selectedOrder ? hasPackageItem(selectedOrder) : false);
    const selectedOrderUploadAmount = $derived(selectedOrder ? getUploadAmount(selectedOrder) : 0);

    function handleDetail(id: string) {
        selectedOrder = getOrderById(id);
        if (!selectedOrder) return;
        selectedPlan = selectedOrder?.paymentPlan ?? null;
        selectedMethod = selectedOrder?.paymentMethod ?? null;
        showDetail = true;
    }

    const stats = $derived({
        total: orders.length,
        active: orders.filter(o => o.type === 'active').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length
    });

    function setPaymentPlan(plan: MockPaymentPlan) {
        selectedPlan = plan;
        if (plan === 'cod_full') {
            selectedMethod = 'cod_cash';
        }
    }

    function confirmPaymentPlan() {
        if (!selectedOrder || !selectedPlan) return;

        const selectedOrderId = selectedOrder.id;
        const plan = selectedPlan;
        const method = selectedMethod;

        orders = orders.map((order) => {
            if (order.id === selectedOrderId) {
                const breakdown = {
                    totalAmount: order.total,
                    paidAmount: 0,
                    remainingAmount: order.total,
                    dpRequired: plan === 'dp_then_remaining',
                    dpPercent: plan === 'dp_then_remaining' ? 30 : undefined,
                    dpAmount: plan === 'dp_then_remaining' ? Math.round(order.total * 0.3) : undefined
                };

                return {
                    ...order,
                    paymentPlan: plan,
                    paymentMethod: method || (plan === 'cod_full' ? 'cod_cash' : 'bank_transfer'),
                    paymentStatus: plan === 'cod_full' ? 'cod_pending' : 'unpaid',
                    paymentBreakdown: breakdown,
                    codCollection: plan === 'cod_full' ? { expectedAmount: order.total } : undefined
                };
            }
            return order;
        });

        selectedOrder = getOrderById(selectedOrderId);
    }

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0 || !selectedOrder) return;

        const selectedOrderId = selectedOrder.id;
        const file = input.files[0];

        // Validations
        if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
            alert('Harap unggah gambar (JPG/PNG/WEBP) atau PDF.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB.');
            return;
        }

        isUploading = true;

        try {
            const formData = new FormData();
            formData.append('proof', file);
            if (uploadNote) {
                formData.append('note', uploadNote);
            }

            const response = await fetch(`/api/orders/${selectedOrderId}/payment-proof`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.status === 401) {
                throw new Error('Sesi Anda telah berakhir. Silakan pilih kembali akun.');
            }

            if (response.status === 403) {
                throw new Error('Anda tidak memiliki akses untuk mengunggah bukti pada pesanan ini.');
            }

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengunggah bukti pembayaran.');
            }

            alert(result.message || 'Bukti pembayaran berhasil diunggah.');

            // Reload all orders to get updated status and proof metadata
            await loadOrders();

            // Refresh selected order in modal
            selectedOrder = getOrderById(selectedOrderId);
            uploadNote = '';
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Terjadi kesalahan saat mengunggah bukti pembayaran.');
        } finally {
            isUploading = false;
            // Clear input
            input.value = '';
        }
    }
</script>

<div class="space-y-8">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div in:fly={{ y: -20, duration: 500 }}>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full mb-3">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                <span class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic">Local SQLite Database Simulation</span>
            </div>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter uppercase italic">Pesanan <span class="text-brand-primary">Saya</span> 🛍️</h1>
            <p class="text-zinc-500 font-medium mt-1">Pantau status pesanan aktif dan lihat riwayat katering Anda.</p>
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
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20 space-y-4" in:fade>
                <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p class="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Memuat data pesanan...</p>
            </div>
        {:else if error}
            <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-10 rounded-[2.5rem] text-center space-y-4" in:fade>
                <span class="text-4xl block">⚠️</span>
                <h3 class="text-lg font-black text-red-700 dark:text-red-400 italic">Gagal Memuat Data</h3>
                <p class="text-sm text-red-600/70 font-medium">{error}</p>
                <button
                    onclick={loadOrders}
                    class="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                    Coba Lagi
                </button>
            </div>
        {:else}
            {#if activeTab === 'ACTIVE'}
                <div in:fade={{ duration: 200 }}>
                    <ActiveOrdersList orders={orders} onDetail={handleDetail} />
                </div>
            {:else}
                <div in:fade={{ duration: 200 }}>
                    <HistoryOrdersList orders={orders} onDetail={handleDetail} />
                </div>
            {/if}
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
                <div class="text-right flex flex-col items-end gap-2">
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Tagihan</p>
                    <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{formatRupiah(selectedOrder.total)}</p>
                    <a
                        href="/invoice/{selectedOrder.id}"
                        target="_blank"
                        class="px-4 py-1.5 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-primary/20 transition-all flex items-center gap-2"
                    >
                        📄 Lihat Invoice
                    </a>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Order Items & Delivery -->
                <div class="space-y-8">
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

                    {#if selectedOrder.deliveryInfo}
                        <div class="space-y-4">
                            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-400">Informasi Pengiriman</h4>
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 space-y-3">
                                <div class="flex items-start gap-3">
                                    <span class="text-xl">📍</span>
                                    <div>
                                        {#if selectedOrder.deliveryInfo.addressSummary}
                                            <p class="text-sm font-bold text-brand-charcoal dark:text-white">{selectedOrder.deliveryInfo.addressSummary}</p>
                                        {:else}
                                            <p class="text-sm font-bold text-brand-charcoal dark:text-white">
                                                {[
                                                    selectedOrder.deliveryInfo.departmentOrUnit,
                                                    selectedOrder.deliveryInfo.floor,
                                                    selectedOrder.deliveryInfo.locationNote
                                                ].filter(Boolean).join(', ') || 'Alamat tidak tersedia'}
                                            </p>
                                        {/if}
                                        <p class="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">Tgl Antar: {selectedOrder.deliveryDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
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
                                {#if selectedOrder.total >= 500000 || selectedOrderHasPackageMenu}
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
                                                 selectedOrder.paymentStatus === 'cod_pending' ? 'COD / Bayar di Tempat' : 'Belum Bayar'}
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
                                            <p class="text-emerald-400 font-black">{formatRupiah(selectedOrderBreakdown?.paidAmount ?? 0)}</p>
                                        </div>
                                        <div class="bg-white/5 p-4 rounded-xl">
                                            <p class="text-white/40 font-black uppercase mb-1">Sisa Tagihan</p>
                                            <p class="text-amber-400 font-black">{formatRupiah(selectedOrderBreakdown?.remainingAmount ?? selectedOrder.total)}</p>
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
                                            <h5 class="text-base font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter">COD / Bayar di Tempat</h5>
                                            <p class="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest italic">Bayar tunai/transfer saat pesanan sampai</p>
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
                                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Simulasi Bukti {selectedOrder.paymentStatus === 'partially_paid' ? 'Pelunasan' : 'Pembayaran'}</p>
                                            <p class="text-[10px] font-black text-brand-primary italic uppercase tracking-widest">
                                                {formatRupiah(selectedOrderUploadAmount)}
                                            </p>
                                        </div>

                                        <textarea bind:value={uploadNote} rows="2" class="w-full px-5 py-4 bg-white dark:bg-zinc-900 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-primary shadow-inner" placeholder="Catatan tambahan (opsional)..."></textarea>

                                        <label class="relative block w-full group">
                                            <input type="file" accept="image/*" onchange={handleFileUpload} class="sr-only" disabled={isUploading} />
                                            <div class="w-full py-5 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl flex items-center justify-center gap-4 cursor-pointer group-hover:scale-[1.02] transition-all shadow-2xl overflow-hidden relative">
                                                {#if isUploading}
                                                    <span class="animate-spin text-2xl">🌀</span>
                                                    <span class="text-xs font-black uppercase tracking-widest italic">Memproses (Simulasi)...</span>
                                                {:else}
                                                    <span class="text-2xl">📤</span>
                                                    <span class="text-xs font-black uppercase tracking-widest italic">Simulasi Kirim Bukti</span>
                                                {/if}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            {/if}

                            <!-- Proof History -->
                            {#if selectedOrderProofHistory.length > 0}
                                <div class="space-y-4">
                                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Riwayat Bukti Pembayaran</p>
                                    <div class="space-y-3">
                                        {#each selectedOrderProofHistory as proof}
                                            <div class="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group/proof hover:border-zinc-300 transition-all">
                                                <div class="w-16 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-inner flex-shrink-0 relative">
                                                    {#if proof.imageUrl}
                                                        <img src={proof.imageUrl} alt="Proof" class="w-full h-full object-cover" />
                                                    {:else}
                                                        <div class="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-black italic">No Image</div>
                                                    {/if}
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
                            {:else if selectedOrder.paymentPlan !== 'cod_full'}
                                <div class="bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-6 rounded-3xl text-center">
                                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Belum ada riwayat bukti pembayaran</p>
                                    <p class="text-xs text-zinc-500 mt-2 font-medium">Riwayat upload bukti akan muncul di sini setelah customer mengirim pembayaran.</p>
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

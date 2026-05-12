<script lang="ts">
    import { fade, fly, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import type { MockCsOrder } from '$lib/mock/cs';
    import type { MockPaymentBreakdown, MockPaymentProof } from '$lib/mock/orders';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}
    
    function getPaymentStatusClass(status: string, isDetailed = false) {
        if (isDetailed) {
            switch (status) {
                case 'paid': return 'bg-emerald-100 text-emerald-700';
                case 'partially_paid': return 'bg-indigo-100 text-indigo-700';
                case 'waiting_verification': return 'bg-amber-100 text-amber-700';
                case 'cod_pending': return 'bg-sky-100 text-sky-700';
                case 'rejected': return 'bg-red-100 text-red-700';
                default: return 'bg-zinc-100 text-zinc-400';
            }
        } else {
            switch (status) {
                case 'paid': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                case 'partially_paid': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
                case 'waiting_verification': return 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse';
                case 'cod_pending': return 'bg-sky-50 text-sky-600 border border-sky-100';
                case 'rejected': return 'bg-red-50 text-red-600 border border-red-100';
                default: return 'bg-zinc-50 text-zinc-400 border border-zinc-100';
            }
        }
    }

    function getPaymentStatusText(status: string) {
        if (!status) return '-';
        if (status === 'cod_pending') return 'COD / Bayar di Tempat';
        if (status === 'waiting_verification') return 'Menunggu Verifikasi';
        if (status === 'paid') return 'Lunas';
        if (status === 'unpaid') return 'Belum Bayar';
        if (status === 'partially_paid') return 'DP Terbayar';
        if (status === 'rejected') return 'Pembayaran Ditolak';
        return status.replace('_', ' ').toUpperCase();
    }

    type TabType = 'NEW' | 'VERIFIKASI' | 'PROSES' | 'SELESAI' | 'BATAL' | 'HISTORY' | 'LUNAS' | 'BELUM_BAYAR';
    
    // DB-backed state
    let orders = $state<any[]>([]);
    let loading = $state(true);
    let error = $state('');
    let isActionLoading = $state(false);

    let activeTab = $state<TabType>('NEW');
    let historyDateFilter = $state<string>('');
    let searchQuery = $state('');
    
    // Modal State
    let selectedOrder = $state<MockCsOrder | null>(null);
    let showModal = $state(false);
    let showCancelReason = $state(false);
    let showRejectionReason = $state(false); // New
    let cancellationReason = $state('');
    let rejectionReason = $state(''); // New
    let verificationNote = $state(''); // New
    let completionNoteInput = $state('');

    const tabs: Array<{ id: TabType; label: string; color: string }> = [
        { id: 'NEW', label: 'Baru', color: 'orange' },
        { id: 'VERIFIKASI', label: 'Verifikasi Bayar', color: 'amber' },
        { id: 'PROSES', label: 'Proses', color: 'blue' },
        { id: 'LUNAS', label: 'Lunas', color: 'emerald' },
        { id: 'BELUM_BAYAR', label: 'Belum Bayar', color: 'zinc' },
        { id: 'SELESAI', label: 'Selesai', color: 'emerald' },
        { id: 'BATAL', label: 'Batal', color: 'red' },
        { id: 'HISTORY', label: 'History', color: 'zinc' }
    ];

    function getPaymentBreakdown(order: MockCsOrder): MockPaymentBreakdown {
        return {
            totalAmount: order.paymentBreakdown?.totalAmount ?? order.total,
            paidAmount: order.paymentBreakdown?.paidAmount ?? 0,
            remainingAmount: order.paymentBreakdown?.remainingAmount ?? order.total,
            dpRequired: order.paymentBreakdown?.dpRequired ?? false,
            dpPercent: order.paymentBreakdown?.dpPercent,
            dpAmount: order.paymentBreakdown?.dpAmount
        };
    }

    function getOrderProofHistory(order: MockCsOrder): MockPaymentProof[] {
        if (order.paymentProofs && order.paymentProofs.length > 0) {
            return order.paymentProofs;
        }

        return order.paymentProof ? [order.paymentProof] : [];
    }

    function getLatestProof(order: MockCsOrder): MockPaymentProof | null {
        const proofs = getOrderProofHistory(order);
        return proofs.length > 0 ? proofs[proofs.length - 1] : null;
    }

    function matchesSearch(order: MockCsOrder, keyword: string): boolean {
        if (!keyword) return true;

        const searchableValues = [
            order.id,
            order.customerName,
            order.whatsapp,
            order.address,
            order.notes,
            order.cancellationReason,
            ...order.items.map((item: any) => item.name)
        ];

        return searchableValues
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(keyword));
    }

    const selectedOrderPaymentBreakdown = $derived(selectedOrder ? getPaymentBreakdown(selectedOrder) : null);
    const selectedOrderProofHistory = $derived(selectedOrder ? getOrderProofHistory(selectedOrder) : []);

    const stats = $derived({
        total: orders.length,
        new: orders.filter(o => o.status === 'new').length,
        verifikasi: orders.filter(o => o.paymentStatus === 'waiting_verification').length,
        proses: orders.filter(o => {
            const isProsesStatus = o.status === 'confirmed' || o.status === 'processing' || o.status === 'ready' || o.status === 'delivered';
            const isConfirmedCompleted = !!(o.completedConfirmedByCs || o.completedConfirmedByUser || o.completedConfirmedByAdmin);
            return isProsesStatus && !isConfirmedCompleted;
        }).length,
        lunas: orders.filter(o => o.paymentStatus === 'paid').length,
        belumBayar: orders.filter(o => o.paymentStatus === 'unpaid' || o.paymentStatus === 'cod_pending').length,
        selesai: orders.filter(o => {
            const isCompletedStatus = o.status === 'completed';
            const isProsesStatus = o.status === 'confirmed' || o.status === 'processing' || o.status === 'ready' || o.status === 'delivered';
            const isConfirmedCompleted = !!(o.completedConfirmedByCs || o.completedConfirmedByUser || o.completedConfirmedByAdmin);
            return isCompletedStatus || (isProsesStatus && isConfirmedCompleted);
        }).length,
        batal: orders.filter(o => o.status === 'cancelled').length
    });

    const filteredOrders = $derived(
        orders.filter(order => {
            let matchesTab = false;
            const isCompletedStatus = order.status === 'completed';
            const isProsesStatus = order.status === 'confirmed' || order.status === 'processing' || order.status === 'ready' || order.status === 'delivered';
            const isConfirmedCompleted = !!(order.completedConfirmedByCs || order.completedConfirmedByUser || order.completedConfirmedByAdmin);
            const normalizedKeyword = searchQuery.trim().toLowerCase();

            switch (activeTab) {
                case 'NEW': 
                    matchesTab = order.status === 'new'; 
                    break;
                case 'VERIFIKASI':
                    matchesTab = order.paymentStatus === 'waiting_verification';
                    break;
                case 'LUNAS':
                    matchesTab = order.paymentStatus === 'paid';
                    break;
                case 'BELUM_BAYAR':
                    matchesTab = order.paymentStatus === 'unpaid' || order.paymentStatus === 'cod_pending';
                    break;
                case 'PROSES': 
                    matchesTab = isProsesStatus && !isConfirmedCompleted; 
                    break;
                case 'SELESAI': 
                    matchesTab = isCompletedStatus || (isProsesStatus && isConfirmedCompleted); 
                    break;
                case 'BATAL': 
                    matchesTab = order.status === 'cancelled'; 
                    break;
                case 'HISTORY': 
                    const isSelesai = isCompletedStatus || (isProsesStatus && isConfirmedCompleted);
                    matchesTab = isSelesai || order.status === 'cancelled'; 
                    break;
                default: 
                    matchesTab = true;
            }

            if (!matchesTab) return false;

            if (activeTab === 'HISTORY' && historyDateFilter) {
                if (order.deliveryDate !== historyDateFilter) {
                    return false;
                }
            }

            return matchesSearch(order, normalizedKeyword);
        })
    );

    function getCount(tabId: TabType) {
        switch (tabId) {
            case 'NEW': return stats.new;
            case 'VERIFIKASI': return stats.verifikasi;
            case 'PROSES': return stats.proses;
            case 'LUNAS': return stats.lunas;
            case 'BELUM_BAYAR': return stats.belumBayar;
            case 'SELESAI': return stats.selesai;
            case 'BATAL': return stats.batal;
            case 'HISTORY': return stats.selesai + stats.batal;
            default: return 0;
        }
    }

    function mapPaymentStatus(status: string): any {
        const s = status.toLowerCase();
        if (s === 'unpaid') return 'unpaid';
        if (s === 'waiting_verification') return 'waiting_verification';
        if (s === 'paid') return 'paid';
        if (s === 'cod' || s === 'cod_pending') return 'cod_pending';
        if (s === 'rejected') return 'rejected';
        return 'unpaid';
    }

    function mapApiOrderToCsOrder(apiOrder: any): any {
        return {
            id: apiOrder.id,
            customerName: apiOrder.customerName,
            whatsapp: apiOrder.whatsapp,
            deliveryDate: apiOrder.deliveryDate,
            address: apiOrder.deliveryInfo?.addressSummary || [
                apiOrder.deliveryInfo?.departmentOrUnit,
                apiOrder.deliveryInfo?.floor,
                apiOrder.deliveryInfo?.locationNote
            ].filter(Boolean).join(', ') || 'Alamat tidak tersedia',
            total: apiOrder.total,
            status: apiOrder.status,
            paymentStatus: mapPaymentStatus(apiOrder.paymentStatus),
            items: apiOrder.items.map((i: any) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
            })),
            notes: apiOrder.notes,
            paymentMethod: apiOrder.payment?.method || apiOrder.paymentMethod,
            paymentBreakdown: {
                totalAmount: apiOrder.payment?.totalAmount ?? apiOrder.total,
                paidAmount: apiOrder.payment?.paidAmount ?? 0,
                remainingAmount: apiOrder.payment?.remainingAmount ?? apiOrder.total,
                dpRequired: false
            },
            paymentProofs: [], 
            paymentProof: undefined,
            completedConfirmedByCs: false, // Simulation
            completedConfirmedByUser: false, // Simulation
            completedConfirmedByAdmin: false, // Simulation
            completionNote: undefined,
            sourceType: apiOrder.sourceType || 'catalog',
            sourceId: apiOrder.sourceId || null
        };
    }

    async function loadOrders() {
        loading = true;
        error = '';
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error('Gagal memuat data pesanan.');
            const data = await response.json();
            if (Array.isArray(data.items)) {
                orders = data.items.map(mapApiOrderToCsOrder);
            }
        } catch (e: any) {
            console.error(e);
            error = e.message || 'Terjadi kesalahan server.';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadOrders();
    });

    function openDetail(order: any) {
        selectedOrder = { ...order };
        showModal = true;
        showCancelReason = false;
        showRejectionReason = false;
        cancellationReason = '';
        rejectionReason = '';
        verificationNote = '';
        completionNoteInput = order.completionNote || '';
    }

    function closeModal() {
        showModal = false;
        selectedOrder = null;
    }

    async function handleConfirm() {
        if (!selectedOrder) return;
        isActionLoading = true;
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.id)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed' })
            });
            if (!response.ok) throw new Error('Gagal mengonfirmasi pesanan.');
            
            alert(`Pesanan #${selectedOrder.id} telah dikonfirmasi.`);
            await loadOrders();
            closeModal();
            activeTab = 'PROSES';
        } catch (e: any) {
            alert(e.message);
        } finally {
            isActionLoading = false;
        }
    }

    async function handleVerifyPayment(proofId?: string) {
        if (!selectedOrder) return;
        isActionLoading = true;
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.id)}/payment-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'paid' })
            });
            if (!response.ok) throw new Error('Gagal memverifikasi pembayaran.');
            
            alert(`Pembayaran untuk Pesanan #${selectedOrder.id} telah diverifikasi (Mode Lunas).`);
            await loadOrders();
            selectedOrder = orders.find(o => o.id === selectedOrder?.id) || null;
            verificationNote = '';
        } catch (e: any) {
            alert(e.message);
        } finally {
            isActionLoading = false;
        }
    }

    function handleRejectPayment(proofId?: string) {
        // Payment proof rejection is simulation only for now
        alert('Simulasi: Bukti pembayaran ditolak. (Fitur verifikasi proof real sedang Hold)');
        showRejectionReason = false;
        rejectionReason = '';
    }

    async function handleConfirmCod() {
        if (!selectedOrder) return;
        isActionLoading = true;
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.id)}/payment-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'paid' })
            });
            if (!response.ok) throw new Error('Gagal mengonfirmasi pembayaran COD.');
            
            alert(`Pembayaran COD untuk Pesanan #${selectedOrder.id} telah dikonfirmasi (Lunas).`);
            await loadOrders();
            selectedOrder = orders.find(o => o.id === selectedOrder?.id) || null;
        } catch (e: any) {
            alert(e.message);
        } finally {
            isActionLoading = false;
        }
    }

    async function handleCancel() {
        if (!selectedOrder) return;
        if (!cancellationReason) {
            alert('Silakan pilih atau isi alasan pembatalan.');
            return;
        }
        isActionLoading = true;
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(selectedOrder.id)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (!response.ok) throw new Error('Gagal membatalkan pesanan.');
            
            alert(`Pesanan #${selectedOrder.id} telah dibatalkan.`);
            await loadOrders();
            closeModal();
            activeTab = 'BATAL';
        } catch (e: any) {
            alert(e.message);
        } finally {
            isActionLoading = false;
        }
    }

    function confirmCompletionByCs() {
        if (!selectedOrder) return;
        const selectedOrderId = selectedOrder.id;
        
        orders = orders.map(o => 
            o.id === selectedOrderId
                ? { 
                    ...o, 
                    completedConfirmedByCs: true,
                    completionNote: completionNoteInput 
                  } 
                : o
        );
        
        alert(`Konfirmasi penyelesaian oleh CS untuk Pesanan #${selectedOrderId} berhasil.`);
        selectedOrder.completedConfirmedByCs = true;
        selectedOrder.completionNote = completionNoteInput;
        
        if (activeTab === 'PROSES') {
            closeModal();
            activeTab = 'SELESAI';
        }
    }

    function simulateUserConfirmation() {
        if (!selectedOrder) return;
        const selectedOrderId = selectedOrder.id;
        
        orders = orders.map(o => 
            o.id === selectedOrderId
                ? { ...o, completedConfirmedByUser: true } 
                : o
        );
        
        alert(`Simulasi: User telah mengonfirmasi penyelesaian untuk Pesanan #${selectedOrderId}.`);
        selectedOrder.completedConfirmedByUser = true;

        if (activeTab === 'PROSES') {
            closeModal();
            activeTab = 'HISTORY';
        }
    }

    function simulateAdminConfirmation() {
        if (!selectedOrder) return;
        const selectedOrderId = selectedOrder.id;
        
        orders = orders.map(o => 
            o.id === selectedOrderId
                ? { ...o, completedConfirmedByAdmin: true } 
                : o
        );
        
        alert(`Simulasi: Admin telah mengonfirmasi penyelesaian untuk Pesanan #${selectedOrderId}.`);
        selectedOrder.completedConfirmedByAdmin = true;

        if (activeTab === 'PROSES') {
            closeModal();
            activeTab = 'HISTORY';
        }
    }

    function resetHistoryFilter() {
        historyDateFilter = '';
    }

    function resetAllFilters() {
        searchQuery = '';
        historyDateFilter = '';
    }

    const cancelReasons = [
        'Stok/menu habis',
        'Area pengiriman tidak tersedia',
        'Jadwal penuh',
        'Data pesanan tidak valid'
    ];
</script>

<div class="space-y-12 pb-24 relative">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div in:fly={{ y: -20, duration: 500 }}>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Pesanan Masuk 📦</h1>
            <p class="text-zinc-500 font-medium mt-2">Kelola operasional pesanan dengan simpel dan efisien.</p>
        </div>
        <div class="flex gap-4" in:fly={{ x: 20, duration: 500 }}>
            <button class="px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">Filter</button>
            <button class="px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Export Report</button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-6" in:fade={{ delay: 200 }}>
        {#each tabs as tab}
            <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-brand-primary transition-colors">{tab.label}</p>
                <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">{getCount(tab.id)}</p>
            </div>
        {/each}
    </div>

    <!-- Tabs Navigation -->
    <div class="space-y-6" in:fade={{ delay: 300 }}>
        <div class="flex overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
            <div class="flex gap-3 min-w-max">
                {#each tabs as tab}
                    <button 
                        onclick={() => {
                            activeTab = tab.id;
                            if (tab.id !== 'HISTORY') resetHistoryFilter();
                        }}
                        class="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4
                        {activeTab === tab.id 
                            ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'}"
                    >
                        {tab.label}
                        {#if getCount(tab.id) > 0}
                            <span class="px-2.5 py-1 rounded-full text-[10px] 
                                {activeTab === tab.id 
                                    ? 'bg-white/20 text-white dark:bg-brand-charcoal/10 dark:text-brand-charcoal' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                                {getCount(tab.id)}
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <div class="relative w-full lg:max-w-xl">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Cari ID, customer, WhatsApp, alamat, atau nama menu..."
                    class="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary shadow-sm"
                />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔎</span>
            </div>

            {#if activeTab === 'HISTORY'}
                <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 p-3 pl-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm w-fit" in:fly={{ y: 10, duration: 300 }}>
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Filter Riwayat:</span>
                    <input 
                        type="date" 
                        bind:value={historyDateFilter}
                        class="bg-transparent border-none focus:ring-0 text-sm font-bold text-brand-charcoal dark:text-white cursor-pointer"
                    />
                    {#if historyDateFilter}
                        <button 
                            onclick={resetHistoryFilter}
                            class="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-black uppercase text-zinc-400 hover:text-red-500 rounded-lg transition-all"
                        >
                            Reset
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
        
        <!-- Orders List -->
        <div class="min-h-[500px] pt-4">
            {#if loading}
                <div class="flex flex-col items-center justify-center py-32 space-y-4" in:fade>
                    <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Memuat data pesanan...</p>
                </div>
            {:else if error}
                <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-20 rounded-[3.5rem] text-center space-y-6" in:fade>
                    <span class="text-5xl block">⚠️</span>
                    <h3 class="text-2xl font-black text-red-700 dark:text-red-400 italic">Gagal Memuat Data</h3>
                    <p class="text-zinc-500 font-medium">{error}</p>
                    <button 
                        onclick={loadOrders}
                        class="px-10 py-4 bg-brand-charcoal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                        Coba Lagi
                    </button>
                </div>
            {:else if filteredOrders.length > 0}
                <div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden" in:fade>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">ID & Customer</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Waktu Kirim</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Alamat</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Total</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Status & Konfirmasi</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {#each filteredOrders as order (order.id)}
                                    <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all group">
                                        <td class="px-10 py-8">
                                            <div class="flex flex-col">
                                                <span class="text-sm font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors italic truncate max-w-[150px]" title={order.id}>#{order.id.split('-')[0]}...</span>
                                                <span class="text-sm font-bold text-zinc-400">{order.customerName}</span>
                                                {#if order.sourceType === 'package_request'}
                                                    <div class="mt-1">
                                                        <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[8px] font-black uppercase rounded border border-indigo-100 dark:border-indigo-900/50">
                                                            🍱 Paket Katering
                                                        </span>
                                                    </div>
                                                {/if}
                                            </div>
                                        </td>
                                        <td class="px-10 py-8">
                                            <span class="text-sm font-bold text-brand-charcoal dark:text-zinc-300">{order.deliveryDate}</span>
                                        </td>
                                        <td class="px-10 py-8">
                                            <span class="text-xs font-medium text-zinc-500 truncate max-w-[200px] block">{order.address}</span>
                                        </td>
                                        <td class="px-10 py-8">
                                            <span class="text-base font-black text-brand-charcoal dark:text-white">{formatPrice(order.total)}</span>
                                        </td>
                                        <td class="px-10 py-8">
                                             <div class="flex flex-col gap-2">
                                                 <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit
                                                     {order.status === 'new' ? 'bg-orange-100 text-orange-600' : 
                                                      (order.status === 'confirmed' || order.status === 'processing' || order.status === 'ready' || order.status === 'delivered') ? 'bg-blue-100 text-blue-600' : 
                                                      (order.status === 'completed') ? 'bg-emerald-100 text-emerald-600' :
                                                      'bg-red-100 text-red-600'}">
                                                     {order.status === 'ready' ? 'siap kirim' : (order.status === 'delivered' ? 'terkirim' : order.status)}
                                                 </span>

                                                 <div class="flex items-center gap-2">
                                                     <span class="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest {getPaymentStatusClass(order.paymentStatus, false)}">
                                                         {getPaymentStatusText(order.paymentStatus)}
                                                     </span>
                                                 </div>
                                                 
                                                 {#if order.status !== 'new' && order.status !== 'cancelled'}
                                                     <div class="flex flex-wrap gap-1">
                                                         <span class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase rounded-md border border-zinc-200/50 dark:border-zinc-700">Simulasi Konfirmasi</span>
                                                     </div>
                                                 {/if}
                                             </div>
                                        </td>
                                        <td class="px-10 py-8 text-right">
                                            <button 
                                                onclick={() => openDetail(order)}
                                                class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Lihat Detail
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-32 px-8 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center" in:fade>
                    <div class="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-8">
                        <svg class="w-12 h-12 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">
                        {searchQuery.trim() && activeTab === 'HISTORY' && historyDateFilter
                            ? 'Tidak ada pesanan yang cocok dengan kata kunci dan tanggal ini.'
                            : searchQuery.trim()
                                ? 'Tidak ada pesanan yang cocok dengan pencarian.'
                                : activeTab === 'HISTORY' && historyDateFilter
                                    ? 'Tidak ada riwayat pesanan pada tanggal ini.'
                                    : 'Belum ada pesanan di kategori ini.'}
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        {searchQuery.trim()
                            ? 'Coba ubah kata kunci pencarian atau reset filter untuk melihat data yang tersedia.'
                            : activeTab === 'HISTORY' && historyDateFilter 
                                ? 'Coba pilih tanggal lain atau reset filter untuk melihat semua data.' 
                                : 'Pesanan akan muncul otomatis ketika statusnya sesuai dengan tahapan kerja.'}
                    </p>
                    {#if searchQuery.trim() || historyDateFilter}
                        <button onclick={resetAllFilters} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Reset Filter</button>
                    {:else}
                        <button onclick={() => { activeTab = 'NEW'; resetHistoryFilter(); }} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Lihat Pesanan Baru</button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Simulated Detail Modal -->
{#if showModal && selectedOrder}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-charcoal/40 backdrop-blur-sm" in:fade out:fade>
        <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800" in:scale={{ start: 0.9, duration: 400 }}>
            <!-- Modal Header -->
            <div class="px-10 py-8 border-b border-zinc-50 dark:divide-zinc-800 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">Detail Pesanan #{selectedOrder.id}</h2>
                    <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Status: <span class="text-brand-primary">{selectedOrder.status}</span></p>
                    {#if selectedOrder.sourceType === 'package_request'}
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase rounded-full border border-indigo-100 dark:border-indigo-900/50 tracking-widest">
                                🍱 Paket Katering
                            </span>
                        </div>
                    {/if}
                </div>
                <button onclick={closeModal} class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:text-red-500 transition-colors shadow-sm" aria-label="Tutup modal">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Content -->
            <div class="px-10 py-8 max-h-[65vh] overflow-y-auto no-scrollbar">
                <div class="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Customer</p>
                        <p class="font-black text-brand-charcoal dark:text-white">{selectedOrder.customerName}</p>
                        <p class="text-xs font-bold text-brand-primary mt-1">{selectedOrder.whatsapp}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Pengiriman</p>
                        <p class="font-black text-brand-charcoal dark:text-white">{selectedOrder.deliveryDate}</p>
                        <p class="text-xs font-medium text-zinc-400 mt-1 leading-relaxed">{selectedOrder.address}</p>
                    </div>
                </div>

                <!-- Confirmation Section for Proses/Selesai/History -->
                {#if selectedOrder.status !== 'new' && selectedOrder.status !== 'cancelled'}
                    <div class="mb-8 p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50">
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Konfirmasi Penyelesaian</p>
                                <div class="flex gap-4">
                                    <button 
                                        onclick={simulateUserConfirmation}
                                        class="text-[9px] font-black uppercase text-blue-500 hover:underline"
                                    >
                                        Simulasi User
                                    </button>
                                    <button 
                                        onclick={simulateAdminConfirmation}
                                        class="text-[9px] font-black uppercase text-purple-500 hover:underline"
                                    >
                                        Simulasi Admin
                                    </button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-3">
                                <!-- User -->
                                <div class="flex flex-col items-center gap-2 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border {selectedOrder.completedConfirmedByUser ? 'border-blue-200 dark:border-blue-900' : 'border-zinc-100 dark:border-zinc-700'}">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center {selectedOrder.completedConfirmedByUser ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-300'}">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                    </div>
                                    <p class="text-[9px] font-black uppercase text-zinc-400">User</p>
                                    <span class="text-[8px] font-black uppercase {selectedOrder.completedConfirmedByUser ? 'text-blue-500' : 'text-zinc-300'}">
                                        {selectedOrder.completedConfirmedByUser ? 'Sudah' : 'Belum'}
                                    </span>
                                </div>
                                
                                <!-- CS -->
                                <div class="flex flex-col items-center gap-2 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border {selectedOrder.completedConfirmedByCs ? 'border-emerald-200 dark:border-emerald-900' : 'border-zinc-100 dark:border-zinc-700'}">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center {selectedOrder.completedConfirmedByCs ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-300'}">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                    </div>
                                    <p class="text-[9px] font-black uppercase text-zinc-400">CS</p>
                                    <span class="text-[8px] font-black uppercase {selectedOrder.completedConfirmedByCs ? 'text-emerald-500' : 'text-zinc-300'}">
                                        {selectedOrder.completedConfirmedByCs ? 'Sudah' : 'Belum'}
                                    </span>
                                </div>

                                <!-- Admin -->
                                <div class="flex flex-col items-center gap-2 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border {selectedOrder.completedConfirmedByAdmin ? 'border-purple-200 dark:border-purple-900' : 'border-zinc-100 dark:border-zinc-700'}">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center {selectedOrder.completedConfirmedByAdmin ? 'bg-purple-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-300'}">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                    </div>
                                    <p class="text-[9px] font-black uppercase text-zinc-400">Admin</p>
                                    <span class="text-[8px] font-black uppercase {selectedOrder.completedConfirmedByAdmin ? 'text-purple-500' : 'text-zinc-300'}">
                                        {selectedOrder.completedConfirmedByAdmin ? 'Sudah' : 'Belum'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {#if !selectedOrder.completedConfirmedByCs}
                            <div class="mt-6 space-y-3" in:fade>
                                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Catatan Penyelesaian (Opsional)</p>
                                <textarea 
                                    bind:value={completionNoteInput}
                                    placeholder="Contoh: Pesanan sudah dikirim dan diterima oleh Bapak Budi..."
                                    class="w-full bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-xs font-medium p-4 focus:ring-2 focus:ring-emerald-500"
                                    rows="2"
                                ></textarea>
                                <button 
                                    onclick={confirmCompletionByCs}
                                    class="w-full py-4 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                >
                                    Konfirmasi Selesai oleh CS
                                </button>
                            </div>
                        {:else if selectedOrder.completionNote}
                            <div class="mt-6 p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Catatan CS:</p>
                                <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 italic">"{selectedOrder.completionNote}"</p>
                            </div>
                        {/if}
                    </div>
                {/if}

                <div class="mb-8">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Daftar Menu</p>
                    <div class="space-y-3">
                        {#each selectedOrder.items as item}
                            <div class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                                <span class="text-sm font-bold text-brand-charcoal dark:text-zinc-200">{item.quantity}x {item.name}</span>
                                <span class="text-sm font-black text-brand-charcoal dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="p-6 bg-brand-charcoal dark:bg-white rounded-[2rem] flex items-center justify-between shadow-xl">
                    <p class="text-xs font-black text-white/60 dark:text-brand-charcoal/60 uppercase tracking-widest">Total Bayar</p>
                    <p class="text-2xl font-black text-white dark:text-brand-charcoal italic">{formatPrice(selectedOrder.total)}</p>
                </div>

                <!-- Payment Orchestration Section (CS) -->
                <div class="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-800 space-y-8">
                    <div class="flex items-center justify-between">
                        <h4 class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Orkestrasi Pembayaran</h4>
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase {getPaymentStatusClass(selectedOrder.paymentStatus, true)}">
                            {getPaymentStatusText(selectedOrder.paymentStatus)}
                        </span>
                    </div>
                    <!-- Financial Summary -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Metode</p>
                            <p class="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase italic">{selectedOrder.paymentMethod || '-'}</p>
                        </div>
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
                            <p class="text-xs font-black italic">{formatPrice(selectedOrder.total)}</p>
                        </div>
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Terbayar</p>
                            <p class="text-xs font-black text-emerald-600 italic">{formatPrice(selectedOrderPaymentBreakdown?.paidAmount ?? 0)}</p>
                        </div>
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Sisa</p>
                            <p class="text-xs font-black text-amber-600 italic">{formatPrice(selectedOrderPaymentBreakdown?.remainingAmount ?? selectedOrder.total)}</p>
                        </div>
                    </div>
                </div>

                <!-- Proof Section Simulation -->
                <div class="space-y-6 mt-8">
                    <h4 class="text-xs font-black uppercase tracking-widest text-zinc-400">Verifikasi Pembayaran</h4>
                    
                    {#if selectedOrder.paymentStatus === 'paid'}
                        <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-[2.5rem] text-center space-y-3">
                            <span class="text-4xl block">✅</span>
                            <h5 class="text-lg font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter italic">Pembayaran Lunas</h5>
                            <p class="text-xs text-emerald-600/70 font-medium">Transaksi telah selesai diverifikasi.</p>
                        </div>
                    {:else if selectedOrder.paymentMethod === 'cod_cash' || selectedOrder.paymentMethod === 'cod_transfer'}
                        <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[2.5rem] space-y-4">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">🚚</span>
                                <div>
                                    <h5 class="text-base font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter italic">COD / Bayar di Tempat</h5>
                                    <p class="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest">Bayar tunai/transfer saat antar</p>
                                </div>
                            </div>
                            <button 
                                onclick={handleConfirmCod}
                                disabled={isActionLoading}
                                aria-label="Konfirmasi Terima Tunai/COD"
                                class="w-full py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isActionLoading ? 'Memproses...' : 'Tandai Lunas COD (Manual)'}
                            </button>
                        </div>
                    {:else}
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 space-y-6">
                            <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 pb-4">
                                <div>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Metode</p>
                                    <p class="text-sm font-black text-brand-charcoal dark:text-white uppercase italic">{selectedOrder.paymentMethod}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Sisa</p>
                                    <p class="text-sm font-black text-brand-primary italic">{formatPrice(selectedOrderPaymentBreakdown?.remainingAmount ?? selectedOrder.total)}</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest text-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg">Review Pembayaran Manual (Simulasi)</p>
                                <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-center">
                                    <p class="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Verifikasi bukti (proof) sedang Hold</p>
                                </div>
                                <button 
                                    onclick={() => handleVerifyPayment()}
                                    disabled={isActionLoading}
                                    aria-label="Tandai Lunas Manual (Simulasi)"
                                    class="w-full py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isActionLoading ? 'Memproses...' : 'Verifikasi Lunas Manual (Local)'}
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>

                {#if showCancelReason}
                    <div class="mt-8 p-8 bg-red-50 dark:bg-red-900/20 rounded-[2rem] border border-red-100 dark:border-red-800/30" in:fly={{ y: 20 }}>
                        <p class="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Alasan Pembatalan</p>
                        <div class="grid grid-cols-1 gap-2 mb-4">
                            {#each cancelReasons as reason}
                                <button 
                                    onclick={() => cancellationReason = reason}
                                    class="px-4 py-3 text-left text-xs font-bold rounded-xl transition-all
                                    {cancellationReason === reason ? 'bg-red-500 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-red-100 dark:hover:bg-red-900/40'}"
                                >
                                    {reason}
                                </button>
                            {/each}
                        </div>
                        <input 
                            type="text" 
                            placeholder="Alasan lainnya..." 
                            bind:value={cancellationReason}
                            class="w-full bg-white dark:bg-zinc-800 border-none rounded-xl text-xs font-bold p-4 focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                {/if}
            </div>

            <!-- Modal Actions -->
            <div class="px-10 py-8 bg-zinc-50 dark:bg-zinc-800/50 flex gap-4">
                {#if selectedOrder.status === 'new'}
                    {#if !showCancelReason}
                        <button 
                            onclick={() => showCancelReason = true}
                            disabled={isActionLoading}
                            class="flex-1 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                        >
                            Batalkan
                        </button>
                        <button 
                            onclick={handleConfirm}
                            disabled={isActionLoading}
                            class="flex-[2] py-4 bg-brand-charcoal dark:bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? 'Memproses...' : 'Konfirmasi Pesanan'}
                        </button>
                    {:else}
                        <button 
                            onclick={() => showCancelReason = false}
                            disabled={isActionLoading}
                            class="px-8 py-4 text-zinc-400 text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            Kembali
                        </button>
                        <button 
                            onclick={handleCancel}
                            disabled={isActionLoading}
                            class="flex-1 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? 'Memproses...' : 'Konfirmasi Pembatalan'}
                        </button>
                    {/if}
                {:else if selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed'}
                    {#if !showCancelReason}
                        <button 
                            onclick={() => showCancelReason = true}
                            disabled={isActionLoading}
                            class="flex-1 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                        >
                            Batalkan Pesanan
                        </button>
                        <button 
                            onclick={closeModal}
                            disabled={isActionLoading}
                            class="flex-[2] py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50"
                        >
                            Tutup
                        </button>
                    {:else}
                         <button 
                            onclick={() => showCancelReason = false}
                            disabled={isActionLoading}
                            class="px-8 py-4 text-zinc-400 text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            Kembali
                        </button>
                        <button 
                            onclick={handleCancel}
                            disabled={isActionLoading}
                            class="flex-1 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? 'Memproses...' : 'Konfirmasi Pembatalan'}
                        </button>
                    {/if}
                {:else}
                    <button 
                        onclick={closeModal}
                        class="w-full py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all"
                    >
                        Tutup
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

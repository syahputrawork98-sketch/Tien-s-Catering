<script lang="ts">
    import { mockCsOrders, type MockCsOrder } from '$lib/mock/cs';
    import { fade, fly, scale } from 'svelte/transition';

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

    type TabType = 'NEW' | 'PROSES' | 'SELESAI' | 'BATAL' | 'HISTORY';
    
    // Local state to simulate changes
    let orders = $state<MockCsOrder[]>([...mockCsOrders]);
    let activeTab = $state<TabType>('NEW');
    let historyDateFilter = $state<string>('');
    
    // Modal State
    let selectedOrder = $state<MockCsOrder | null>(null);
    let showModal = $state(false);
    let showCancelReason = $state(false);
    let cancellationReason = $state('');
    let completionNoteInput = $state('');

    const tabs = [
        { id: 'NEW', label: 'Pesanan Baru', color: 'orange' },
        { id: 'PROSES', label: 'Proses', color: 'blue' },
        { id: 'SELESAI', label: 'Selesai', color: 'emerald' },
        { id: 'BATAL', label: 'Pesanan Batal', color: 'red' },
        { id: 'HISTORY', label: 'History', color: 'zinc' }
    ];

    const stats = $derived({
        total: orders.length,
        new: orders.filter(o => o.status === 'new').length,
        proses: orders.filter(o => {
            const isProsesStatus = o.status === 'confirmed' || o.status === 'processing' || o.status === 'ready' || o.status === 'delivered';
            const isConfirmedCompleted = o.completedConfirmedByCs || o.completedConfirmedByUser || o.completedConfirmedByAdmin;
            return isProsesStatus && !isConfirmedCompleted;
        }).length,
        selesai: orders.filter(o => {
            const isCompletedStatus = o.status === 'completed';
            const isProsesStatus = o.status === 'confirmed' || o.status === 'processing' || o.status === 'ready' || o.status === 'delivered';
            const isConfirmedCompleted = o.completedConfirmedByCs || o.completedConfirmedByUser || o.completedConfirmedByAdmin;
            return isCompletedStatus || (isProsesStatus && isConfirmedCompleted);
        }).length,
        batal: orders.filter(o => o.status === 'cancelled').length
    });

    const filteredOrders = $derived(
        orders.filter(order => {
            let matchesTab = false;
            const isCompletedStatus = order.status === 'completed';
            const isProsesStatus = order.status === 'confirmed' || order.status === 'processing' || order.status === 'ready' || order.status === 'delivered';
            const isConfirmedCompleted = order.completedConfirmedByCs || order.completedConfirmedByUser || order.completedConfirmedByAdmin;

            switch (activeTab) {
                case 'NEW': 
                    matchesTab = order.status === 'new'; 
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
                return order.deliveryDate === historyDateFilter;
            }

            return true;
        })
    );

    function getCount(tabId: string) {
        switch (tabId) {
            case 'NEW': return stats.new;
            case 'PROSES': return stats.proses;
            case 'SELESAI': return stats.selesai;
            case 'BATAL': return stats.batal;
            case 'HISTORY': return stats.selesai + stats.batal;
            default: return 0;
        }
    }

    function openDetail(order: MockCsOrder) {
        selectedOrder = { ...order };
        showModal = true;
        showCancelReason = false;
        cancellationReason = '';
        completionNoteInput = order.completionNote || '';
    }

    function closeModal() {
        showModal = false;
        selectedOrder = null;
    }

    function handleConfirm() {
        if (!selectedOrder) return;
        
        orders = orders.map(o => 
            o.id === selectedOrder!.id 
                ? { ...o, status: 'confirmed' as const } 
                : o
        );
        
        alert(`Pesanan #${selectedOrder.id} telah dikonfirmasi dan masuk ke tab Proses.`);
        closeModal();
        activeTab = 'PROSES';
    }

    function handleCancel() {
        if (!cancellationReason) {
            alert('Silakan pilih atau isi alasan pembatalan.');
            return;
        }

        orders = orders.map(o => 
            o.id === selectedOrder!.id 
                ? { 
                    ...o, 
                    status: 'cancelled' as const, 
                    cancelledBy: 'cs', 
                    cancellationReason: cancellationReason 
                  } 
                : o
        );

        alert(`Pesanan #${selectedOrder!.id} telah dibatalkan.`);
        closeModal();
        activeTab = 'BATAL';
    }

    function confirmCompletionByCs() {
        if (!selectedOrder) return;
        
        orders = orders.map(o => 
            o.id === selectedOrder!.id 
                ? { 
                    ...o, 
                    completedConfirmedByCs: true,
                    completionNote: completionNoteInput 
                  } 
                : o
        );
        
        alert(`Konfirmasi penyelesaian oleh CS untuk Pesanan #${selectedOrder.id} berhasil.`);
        selectedOrder.completedConfirmedByCs = true;
        selectedOrder.completionNote = completionNoteInput;
        
        if (activeTab === 'PROSES') {
            closeModal();
            activeTab = 'SELESAI';
        }
    }

    function simulateUserConfirmation() {
        if (!selectedOrder) return;
        
        orders = orders.map(o => 
            o.id === selectedOrder!.id 
                ? { ...o, completedConfirmedByUser: true } 
                : o
        );
        
        alert(`Simulasi: User telah mengonfirmasi penyelesaian untuk Pesanan #${selectedOrder.id}.`);
        selectedOrder.completedConfirmedByUser = true;

        if (activeTab === 'PROSES') {
            closeModal();
            activeTab = 'SELESAI';
        }
    }

    function simulateAdminConfirmation() {
        if (!selectedOrder) return;
        
        orders = orders.map(o => 
            o.id === selectedOrder!.id 
                ? { ...o, completedConfirmedByAdmin: true } 
                : o
        );
        
        alert(`Simulasi: Admin telah mengonfirmasi penyelesaian untuk Pesanan #${selectedOrder.id}.`);
        selectedOrder.completedConfirmedByAdmin = true;

        if (activeTab === 'PROSES') {
            closeModal();
            activeTab = 'SELESAI';
        }
    }

    function resetHistoryFilter() {
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
                            activeTab = tab.id as TabType;
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

        <!-- History Filter (Below Tabs) -->
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

        <!-- Orders List -->
        <div class="min-h-[500px] pt-4">
            {#if filteredOrders.length > 0}
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
                                                <span class="text-base font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors italic">#{order.id}</span>
                                                <span class="text-sm font-bold text-zinc-400">{order.customerName}</span>
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
                                                 
                                                 {#if order.status !== 'new' && order.status !== 'cancelled'}
                                                     <div class="flex flex-wrap gap-1">
                                                         {#if !order.completedConfirmedByCs && !order.completedConfirmedByUser && !order.completedConfirmedByAdmin}
                                                             <span class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase rounded-md">Belum Konfirmasi</span>
                                                         {:else}
                                                             {#if order.completedConfirmedByUser}
                                                                 <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 text-[9px] font-black uppercase rounded-md border border-blue-100 dark:border-blue-800/50">User ✓</span>
                                                             {/if}
                                                             {#if order.completedConfirmedByCs}
                                                                 <span class="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 text-[9px] font-black uppercase rounded-md border border-emerald-100 dark:border-emerald-800/50">CS ✓</span>
                                                             {/if}
                                                             {#if order.completedConfirmedByAdmin}
                                                                 <span class="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-500 text-[9px] font-black uppercase rounded-md border border-purple-100 dark:border-purple-800/50">Admin ✓</span>
                                                             {/if}
                                                         {/if}
                                                     </div>
                                                 {/if}

                                                {#if order.status === 'cancelled'}
                                                    <div class="flex flex-col gap-1">
                                                        <span class="text-[9px] font-black uppercase text-zinc-400">
                                                            Oleh: <span class={order.cancelledBy === 'cs' ? 'text-red-500' : 'text-blue-500'}>{order.cancelledBy === 'cs' ? 'CS' : 'User'}</span>
                                                        </span>
                                                        {#if order.cancellationReason}
                                                            <span class="text-[10px] font-medium text-zinc-400 italic max-w-[150px] truncate" title={order.cancellationReason}>
                                                                "{order.cancellationReason}"
                                                            </span>
                                                        {/if}
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
                        {activeTab === 'HISTORY' && historyDateFilter 
                            ? 'Tidak ada riwayat pesanan pada tanggal ini.' 
                            : 'Belum ada pesanan di kategori ini.'}
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        {activeTab === 'HISTORY' && historyDateFilter 
                            ? 'Coba pilih tanggal lain atau reset filter untuk melihat semua data.' 
                            : 'Pesanan akan muncul otomatis ketika statusnya sesuai dengan tahapan kerja.'}
                    </p>
                    <button onclick={() => { activeTab = 'NEW'; resetHistoryFilter(); }} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Lihat Pesanan Baru</button>
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
                </div>
                <button onclick={closeModal} class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:text-red-500 transition-colors shadow-sm">
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
                            class="flex-1 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            Batalkan
                        </button>
                        <button 
                            onclick={handleConfirm}
                            class="flex-[2] py-4 bg-brand-charcoal dark:bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Konfirmasi Pesanan
                        </button>
                    {:else}
                        <button 
                            onclick={() => showCancelReason = false}
                            class="px-8 py-4 text-zinc-400 text-[11px] font-black uppercase tracking-widest"
                        >
                            Kembali
                        </button>
                        <button 
                            onclick={handleCancel}
                            class="flex-1 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Konfirmasi Pembatalan
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

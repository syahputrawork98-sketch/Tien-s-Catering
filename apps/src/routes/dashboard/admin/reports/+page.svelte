<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth.svelte';
    import { mockAdminMetrics, mockAdminSalesReports } from '$lib/mock/reports';
    import { mockAccounts } from '$lib/mock/accounts';
    import { mockCatalogItems } from '$lib/mock/catalog';
    import {
        computeReportingSummary,
        getOrderSourceLabel,
        isRevenueEligibleOrder,
        filterOrders,
        type ReportingOrderItem,
        type PeriodFilter
    } from '$lib/utils/reporting';
    import { fade } from 'svelte/transition';

    type ReportTabId = 'overview' | 'sales' | 'orders' | 'customers' | 'products' | 'finance';
    type PeriodFilter = 'today' | 'week' | 'month' | '3months' | 'year' | 'all';
    type SummaryCard = { label: string; count: number; color: string };

    // State
    let activeTab = $state<ReportTabId>('overview');
    let searchQuery = $state('');
    let periodFilter = $state<PeriodFilter>('month');
    let paymentStatusFilter = $state<string>('ALL');
    let dbOrders = $state<ReportingOrderItem[]>([]);
    let isLoading = $state(true);
    let fetchError = $state('');
    let reportNote = $state('Report berbasis data SQLite lokal. Revenue final mencakup pesanan PAID atau COMPLETED/DELIVERED.');

    const exportLabel = 'Export CSV basic untuk order/report foundation.';

    // Helper: format rupiah
    function formatRupiah(value: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    }

    async function fetchDbOrders() {
        isLoading = true;
        fetchError = '';
        try {
            const response = await fetch('/api/reports');

            if (response.status === 401) {
                fetchError = 'Sesi Anda telah berakhir. Silakan pilih kembali akun melalui Persona Switcher.';
                authStore.handleUnauthorized();
                return;
            }

            if (!response.ok) throw new Error('Gagal memuat data dari database.');
            const data = await response.json();
            dbOrders = Array.isArray(data.items) ? data.items : [];
            reportNote = data.note || reportNote;
        } catch (err: any) {
            console.error('Fetch error:', err);
            fetchError = err.message || 'Terjadi kesalahan saat memuat data.';
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchDbOrders();
    });

    // Tab items configuration
    const tabs: ReadonlyArray<{ id: ReportTabId; label: string; icon: string }> = [
        { id: 'overview', label: 'Ringkasan', icon: '📊' },
        { id: 'sales', label: 'Penjualan', icon: '💰' },
        { id: 'orders', label: 'Pesanan', icon: '📦' },
        { id: 'customers', label: 'Customer', icon: '👤' },
        { id: 'products', label: 'Produk', icon: '🍱' },
        { id: 'finance', label: 'Keuangan', icon: '🏦' }
    ];

    // Placeholder search logic (contextual)
    const searchPlaceholder = $derived(
        activeTab === 'overview' ? 'Cari metrik atau ringkasan...' :
        activeTab === 'sales' ? 'Cari order, customer, atau periode...' :
        activeTab === 'orders' ? 'Cari nomor pesanan, customer, atau status...' :
        activeTab === 'customers' ? 'Cari nama customer, email, atau WhatsApp...' :
        activeTab === 'products' ? 'Cari menu, paket, atau kategori...' :
        'Cari invoice, payment status, atau metode...'
    );


    function orderMatchesSearch(order: ReportingOrderItem, keyword: string): boolean {
        if (!keyword) return true;

        const searchableValues = [
            order.id,
            order.orderNumber || '',
            order.customerName || '',
            getOrderSourceLabel(order.sourceType),
            order.paymentStatus || '',
            order.status || '',
        ];

        return searchableValues.some((value) => String(value).toLowerCase().includes(keyword));
    }

    const normalizedSearchQuery = $derived(searchQuery.trim().toLowerCase());

    // Filtered data based on search and period (Prioritaskan DB if overview/orders/finance)
    let filteredOrders = $derived(
        filterOrders(dbOrders, {
            period: periodFilter,
            paymentStatus: paymentStatusFilter,
            search: normalizedSearchQuery
        })
    );

    const dbStats = $derived(computeReportingSummary(filteredOrders));

    let filteredAccounts = $derived(
        mockAccounts.filter(a =>
            a.name.toLowerCase().includes(normalizedSearchQuery) ||
            (a.email?.toLowerCase().includes(normalizedSearchQuery)) ||
            (a.whatsapp?.toLowerCase().includes(normalizedSearchQuery))
        )
    );

    let filteredProducts = $derived(
        mockCatalogItems.filter(p =>
            p.name.toLowerCase().includes(normalizedSearchQuery) ||
            p.category.toLowerCase().includes(normalizedSearchQuery)
        )
    );

    const orderSummaryCards = $derived<SummaryCard[]>([
        { label: 'Menunggu', count: filteredOrders.filter((o) => o.status === 'new').length, color: 'text-orange-500' },
        { label: 'Diproses', count: filteredOrders.filter((o) => o.status === 'processing' || o.status === 'confirmed').length, color: 'text-blue-500' },
        {
            label: 'Selesai',
            count: filteredOrders.filter((o) => o.status === 'completed' || o.status === 'delivered' || o.status === 'ready').length,
            color: 'text-emerald-500'
        },
        { label: 'Dibatalkan', count: filteredOrders.filter((o) => o.status === 'cancelled').length, color: 'text-red-500' }
    ]);

    function orderStatusBadgeClass(status: string): string {
        if (status === 'completed' || status === 'delivered') return 'bg-emerald-100 text-emerald-600';
        if (status === 'new') return 'bg-orange-100 text-orange-600';
        if (status === 'cancelled') return 'bg-red-100 text-red-600';
        return 'bg-blue-100 text-blue-600';
    }

    function orderStatusLabel(status: string): string {
        const map: Record<string, string> = {
            new: 'Menunggu Konfirmasi',
            confirmed: 'Dikonfirmasi',
            processing: 'Diproses',
            ready: 'Siap Dikirim',
            delivered: 'Terkirim',
            completed: 'Selesai',
            cancelled: 'Dibatalkan'
        };

        return map[status] || status;
    }

    function paymentStatusLabel(status: string): string {
        const map: Record<string, string> = {
            unpaid: 'Belum Dibayar',
            waiting_verification: 'Menunggu Verifikasi',
            partially_paid: 'DP Terbayar',
            cod_pending: 'COD Pending',
            paid: 'Lunas',
            refunded: 'Refunded',
            cod: 'COD'
        };

        return map[status] || status;
    }

    function paymentStatusBadgeClass(status: string): string {
        if (status === 'paid') return 'bg-emerald-100 text-emerald-600';
        if (status === 'waiting_verification' || status === 'partially_paid') return 'bg-amber-100 text-amber-700';
        if (status === 'cod_pending' || status === 'cod') return 'bg-sky-100 text-sky-700';
        if (status === 'refunded') return 'bg-indigo-100 text-indigo-700';
        return 'bg-red-100 text-red-600';
    }

    function periodFilterLabel(period: PeriodFilter): string {
        const map: Record<PeriodFilter, string> = {
            today: 'Hari Ini',
            week: '7 Hari Terakhir',
            month: 'Bulan Ini',
            '3months': '3 Bulan Terakhir',
            year: 'Tahun Ini',
            all: 'Semua Waktu'
        };

        return map[period];
    }

    function paymentMethodLabel(method: string): string {
        if (!method) return '-';
        const normalized = method.toLowerCase();
        const map: Record<string, string> = {
            bank_transfer: 'Transfer',
            transfer: 'Transfer',
            qris: 'QRIS',
            cod_cash: 'COD Cash',
            cod_transfer: 'COD Transfer',
            cod: 'COD'
        };

        return map[normalized] ?? normalized.toUpperCase();
    }

    function sourceTypeBadgeClass(sourceType: string | null | undefined): string {
        if (sourceType === 'package_request') return 'bg-indigo-100 text-indigo-700';
        if (sourceType === 'catalog') return 'bg-emerald-100 text-emerald-700';
        return 'bg-amber-100 text-amber-700';
    }

    function resetFilters() {
        searchQuery = '';
        periodFilter = 'month';
        paymentStatusFilter = 'ALL';
    }

    const hasOverviewSearchResult = $derived(
        normalizedSearchQuery.length === 0 ||
        mockAdminMetrics.some((metric) =>
            [metric.label, metric.value, metric.change].some((text) =>
                text.toLowerCase().includes(normalizedSearchQuery)
            )
        ) ||
        mockAdminSalesReports.some((report) =>
            [report.period, report.topMenu].some((text) =>
                text.toLowerCase().includes(normalizedSearchQuery)
            )
        )
    );

    const hasSearchResultInActiveTab = $derived(
        activeTab === 'overview' ? hasOverviewSearchResult :
        activeTab === 'sales' ? filteredOrders.length > 0 :
        activeTab === 'orders' ? filteredOrders.length > 0 :
        activeTab === 'customers' ? filteredAccounts.filter((account) => account.role === 'USER').length > 0 :
        activeTab === 'products' ? filteredProducts.length > 0 :
        filteredOrders.length > 0
    );
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <div class="flex flex-wrap gap-2 mb-4">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Local SQLite Reporting Foundation</span>
                </div>
            </div>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Laporan Bisnis 📈</h1>
            <p class="text-zinc-500 font-medium mt-1">
                Monitoring performa bisnis dari database lokal. <span class="text-brand-primary">Revenue Final</span> dihitung dari pesanan Lunas atau Selesai.
            </p>
        </div>
        <div class="flex flex-col items-start md:items-end gap-2">
            <div class="flex items-center gap-2">
                <button
                    onclick={fetchDbOrders}
                    disabled={isLoading}
                    class="bg-white dark:bg-zinc-900 text-brand-charcoal dark:text-white p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                    title="Refresh Data"
                >
                    <svg class="w-5 h-5 {isLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <a
                    href={`/api/reports/export.csv?period=${periodFilter}&paymentStatus=${paymentStatusFilter}&search=${encodeURIComponent(normalizedSearchQuery)}`}
                    aria-label={exportLabel}
                    title={exportLabel}
                    class="bg-brand-charcoal dark:bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-brand-charcoal dark:border-brand-primary flex items-center gap-2 hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-lg shadow-brand-charcoal/10"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                </a>
            </div>
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Format: tc-report-orders-YYYYMMDD.csv
            </p>
        </div>
    </header>

    <!-- Top Controls -->
    <div class="grid lg:grid-cols-4 gap-6">
        <!-- Search -->
        <div class="lg:col-span-2 relative group">
            <span class="absolute inset-y-0 left-6 flex items-center text-zinc-400 group-focus-within:text-brand-primary transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder={searchPlaceholder}
                class="w-full pl-16 pr-8 py-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-brand-charcoal dark:text-white transition-all shadow-sm"
            />
        </div>

        <!-- Period Filter -->
        <div class="relative">
            <select
                bind:value={periodFilter}
                class="w-full pl-8 pr-12 py-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-brand-charcoal dark:text-white transition-all shadow-sm appearance-none cursor-pointer"
            >
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="3months">3 Bulan Terakhir</option>
                <option value="year">Tahun Ini</option>
                <option value="all">Semua Waktu</option>
            </select>
            <span class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-zinc-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </span>
        </div>

        <!-- Status Filter -->
        <div class="relative">
            <select
                bind:value={paymentStatusFilter}
                class="w-full pl-8 pr-12 py-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-brand-charcoal dark:text-white transition-all shadow-sm appearance-none cursor-pointer"
            >
                <option value="ALL">Semua Status</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="waiting_verification">Menunggu Verifikasi</option>
                <option value="unpaid">Belum Lunas</option>
                <option value="cod_pending">COD Pending</option>
                <option value="rejected">Ditolak</option>
            </select>
            <span class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-zinc-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
            </span>
        </div>
    </div>

    <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-6 py-4 flex items-start gap-4">
        <span class="text-xl">ℹ️</span>
        <div>
            <p class="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">Metodologi Laporan</p>
            <p class="text-xs font-semibold text-amber-700/90 dark:text-amber-200/90 mt-0.5 italic">
                {reportNote}
            </p>
        </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
        {#each tabs as tab}
            <button
                onclick={() => activeTab = tab.id}
                class="flex items-center gap-3 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shrink-0
                    {activeTab === tab.id
                        ? 'bg-brand-charcoal text-white shadow-xl shadow-brand-charcoal/20 scale-105'
                        : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary/30 hover:text-brand-charcoal dark:hover:text-white'}"
            >
                <span class="text-base">{tab.icon}</span>
                {tab.label}
            </button>
        {/each}
    </div>

    <!-- Tab Contents -->
    <div class="space-y-10" in:fade>
        {#if isLoading}
            <div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-20 text-center shadow-sm" in:fade>
                <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">Menyusun laporan dari database lokal...</p>
            </div>
        {:else if fetchError}
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-[3rem] p-20 text-center shadow-sm" in:fade>
                <p class="text-sm font-bold text-red-600 dark:text-red-400 mb-6">{fetchError}</p>
                <div class="flex flex-col items-center gap-3">
                    <button onclick={fetchDbOrders} class="px-8 py-4 bg-brand-charcoal text-white rounded-2xl font-black text-xs uppercase tracking-widest">Coba Lagi</button>
                    <a
                        href="/api/reports/export.csv"
                        aria-label={exportLabel}
                        title={exportLabel}
                        class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                    >
                        Tetap coba Export CSV
                    </a>
                </div>
            </div>
        {:else}
            {#if activeTab === 'overview'}
            <!-- Tab: Ringkasan -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Revenue Final</p>
                    <p class="text-3xl font-black text-emerald-600 italic mb-2 tracking-tighter">{formatRupiah(dbStats.validRevenue)}</p>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic">Paid/Completed</p>
                    </div>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Non-Final / Pending</p>
                    <p class="text-3xl font-black text-amber-600 italic mb-2 tracking-tighter">{formatRupiah(dbStats.pendingRevenue)}</p>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <p class="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest italic">Belum Lunas/Baru</p>
                    </div>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Pesanan</p>
                    <p class="text-3xl font-black text-brand-charcoal dark:text-white italic mb-2 tracking-tighter">{dbStats.totalOrders}</p>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Database Lokal</p>
                    </div>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Wait Verification</p>
                    <p class="text-3xl font-black text-orange-600 italic mb-2 tracking-tighter">{dbStats.waitingVerificationOrders}</p>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <p class="text-[9px] font-black text-orange-500 uppercase tracking-widest italic italic">Butuh Review</p>
                    </div>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Batal / Ditolak</p>
                    <p class="text-3xl font-black text-red-600 italic mb-2 tracking-tighter">{dbStats.rejectedOrders + dbStats.cancelledOrders}</p>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <p class="text-[9px] font-black text-red-500 uppercase tracking-widest italic italic">Zero Revenue</p>
                    </div>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 class="text-lg font-black text-brand-charcoal dark:text-white tracking-tight uppercase italic">Financial Health Summary</h3>
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">Analisa kelayakan pendapatan berdasarkan status verifikasi pembayaran.</p>
                    </div>
                    <div class="px-6 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                        <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic">✓ Finance Approved Logic</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {#each [
                        { label: 'Revenue Final', value: formatRupiah(dbStats.validRevenue), tone: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950 dark:border-emerald-900', isLarge: true },
                        { label: 'Revenue Pending', value: formatRupiah(dbStats.pendingRevenue), tone: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950 dark:border-amber-900', isLarge: true },
                        { label: 'Paid Orders', value: dbStats.paidOrders, tone: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950 dark:border-blue-900' },
                        { label: 'Waiting Review', value: dbStats.waitingVerificationOrders, tone: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950 dark:border-orange-900' },
                        { label: 'Rejected/Void', value: dbStats.rejectedOrders + dbStats.cancelledOrders, tone: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950 dark:border-red-900' },
                        { label: 'Total Volume', value: dbStats.totalOrders, tone: 'text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700' }
                    ] as item}
                        <div class={`rounded-[2rem] border p-6 flex flex-col justify-between min-h-[120px] ${item.tone} ${item.isLarge ? 'lg:col-span-1' : ''}`}>
                            <p class="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">{item.label}</p>
                            <p class={`font-black italic tracking-tighter ${item.isLarge ? 'text-lg' : 'text-2xl'}`}>{item.value}</p>
                        </div>
                    {/each}
                </div>

                <div class="mt-8 grid lg:grid-cols-2 gap-8 items-center">
                    <div class="flex flex-wrap gap-2">
                        <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">Source Breakdown:</span>
                        <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Catalog: {dbStats.sourceBreakdown.catalog}</span>
                        <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Package: {dbStats.sourceBreakdown.packageRequest}</span>
                    </div>
                    <div class="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p class="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                            Revenue dianggap <span class="font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">Final</span> jika pesanan sudah berstatus <span class="text-emerald-600 font-bold">PAID</span> atau barang sudah diterima (<span class="text-emerald-600 font-bold">COMPLETED/DELIVERED</span>).
                        </p>
                    </div>
                </div>

                {#if filteredOrders.length === 0}
                    <div class="mt-8 p-10 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center">
                        <p class="text-xs font-bold text-zinc-400 italic uppercase tracking-widest">
                            Belum ada data pesanan pada filter "{periodFilterLabel(periodFilter)}" & "{paymentStatusFilter}".
                        </p>
                    </div>
                {/if}
            </section>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <div class="flex items-center gap-3">
                        <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase italic">Weekly Sales Trend</h2>
                        <span class="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[8px] font-black text-zinc-400 uppercase tracking-widest italic">Visual Simulasi</span>
                    </div>
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Periode: {periodFilterLabel(periodFilter)}</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Periode</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Revenue</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Orders</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Gross Profit</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Top Menu</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each mockAdminSalesReports as report}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6">
                                        <span class="text-sm font-black text-brand-charcoal dark:text-white">{report.period}</span>
                                    </td>
                                    <td class="px-8 py-6 text-right">
                                        <span class="text-sm font-black text-emerald-600 italic">{formatRupiah(report.revenue)}</span>
                                    </td>
                                    <td class="px-8 py-6 text-center">
                                        <span class="text-sm font-bold text-zinc-600 dark:text-zinc-400">{report.orders}</span>
                                    </td>
                                    <td class="px-8 py-6 text-right">
                                        <span class="text-sm font-black text-brand-charcoal dark:text-white">{formatRupiah(report.grossProfit)}</span>
                                    </td>
                                    <td class="px-8 py-6">
                                        <span class="text-[10px] font-black px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full uppercase tracking-widest">{report.topMenu}</span>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="5" class="px-8 py-10 text-center text-sm font-semibold text-zinc-400">
                                        Belum ada data tren penjualan pada periode simulasi ini.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'sales'}
            <!-- Tab: Penjualan -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative group overflow-hidden">
                    <p class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Valid Revenue (Paid)</p>
                    <p class="text-3xl font-black text-emerald-700 dark:text-emerald-300 italic tracking-tighter">{formatRupiah(dbStats.validRevenue)}</p>
                    <span class="absolute top-4 right-6 text-[8px] font-black text-emerald-400 uppercase tracking-widest italic opacity-60">Database Lokal</span>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 shadow-sm relative group overflow-hidden">
                    <p class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Paid Orders</p>
                    <p class="text-3xl font-black text-blue-700 dark:text-blue-300 italic tracking-tighter">{dbStats.paidOrders}</p>
                    <span class="absolute top-4 right-6 text-[8px] font-black text-blue-400 uppercase tracking-widest italic opacity-60">Database Lokal</span>
                </div>
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/30 shadow-sm relative group overflow-hidden">
                    <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Pending Revenue</p>
                    <p class="text-3xl font-black text-indigo-700 dark:text-indigo-300 italic tracking-tighter">{formatRupiah(dbStats.pendingRevenue)}</p>
                    <span class="absolute top-4 right-6 text-[8px] font-black text-indigo-400 uppercase tracking-widest italic opacity-60">Database Lokal</span>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest italic">Rincian Penjualan Terakhir</h3>
                    <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic tracking-[0.2em]">✓ Live Database Sync</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Source</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Revenue Rule</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status Bayar</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredOrders as order}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 font-black text-zinc-400 text-xs">#{order.id}</td>
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{order.customerName}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {sourceTypeBadgeClass(order.sourceType)}">
                                            {getOrderSourceLabel(order.sourceType)}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic">{order.orderDate}</td>
                                    <td class="px-8 py-6 text-right font-black text-emerald-600">{formatRupiah(order.total)}</td>
                                    <td class="px-8 py-6 text-center">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {isRevenueEligibleOrder(order) ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}">
                                            {isRevenueEligibleOrder(order) ? 'Masuk Revenue' : 'Belum Masuk'}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-center">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {paymentStatusBadgeClass(order.paymentStatus)}">
                                            {paymentStatusLabel(order.paymentStatus)}
                                        </span>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="7" class="px-8 py-10 text-center text-sm font-semibold text-zinc-400">
                                        Tidak ada data penjualan yang cocok dengan pencarian/filter periode.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'orders'}
            <!-- Tab: Pesanan -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {#each orderSummaryCards as stat}
                    <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 text-center relative overflow-hidden group">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p class="text-2xl font-black {stat.color} italic tracking-tighter">{stat.count}</p>
                        <span class="absolute -bottom-1 -right-1 text-[20px] opacity-5 grayscale transition-all group-hover:grayscale-0 group-hover:scale-120 group-hover:opacity-10 pointer-events-none">📦</span>
                    </div>
                {/each}
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest italic">Monitoring Pesanan Lokal</h3>
                    <p class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic tracking-[0.2em]">SOT: Local SQLite Database</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Source</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Delivery</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order Status</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredOrders as order}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 font-black text-zinc-400 text-xs">#{order.id}</td>
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{order.customerName}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {sourceTypeBadgeClass(order.sourceType)}">
                                            {getOrderSourceLabel(order.sourceType)}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic">{order.deliveryDate}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {orderStatusBadgeClass(order.status)}">
                                            {orderStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {paymentStatusBadgeClass(order.paymentStatus)}">
                                            {paymentStatusLabel(order.paymentStatus)}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-right font-black text-brand-charcoal dark:text-white">{formatRupiah(order.total)}</td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="7" class="px-8 py-10 text-center text-sm font-semibold text-zinc-400">
                                        Tidak ada data pesanan yang cocok dengan pencarian/filter periode.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'customers'}
            <!-- Tab: Customer -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-zinc-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                    <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Top Customers <span class="ml-2 text-[8px] text-zinc-600 italic">(Simulasi)</span></p>
                    <div class="space-y-4">
                        {#each mockAccounts.filter(a => a.role === 'USER' && (a.totalOrders ?? 0) > 0).sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, 3) as top}
                            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                                <span class="text-sm font-black italic">{top.name}</span>
                                <span class="text-xs font-bold text-brand-primary">{top.totalOrders} Pesanan</span>
                            </div>
                        {/each}
                    </div>
                </div>
                <div class="bg-brand-primary p-8 rounded-[2.5rem] text-white">
                    <p class="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">New Customers (Bulan Ini) <span class="ml-2 text-[8px] text-white/40 italic">(Simulasi)</span></p>
                    <p class="text-5xl font-black italic tracking-tighter">+{mockAccounts.filter(a => a.registrationStatus === 'approved').length}</p>
                    <p class="text-xs font-bold mt-2 text-white/80">Pertumbuhan yang sangat baik!</p>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest italic">Daftar Pelanggan Simulasi</h3>
                    <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic">Info: Data customer belum sinkron DB Pesanan</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Total Orders</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Login</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredAccounts.filter(a => a.role === 'USER') as customer}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-black text-brand-charcoal dark:text-white">{customer.name}</span>
                                            <span class="text-[10px] font-medium text-zinc-400">{customer.email || customer.whatsapp}</span>
                                        </div>
                                    </td>
                                    <td class="px-8 py-6 text-center text-sm font-black">{customer.totalOrders || 0}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {customer.registrationStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}">
                                            {customer.registrationStatus}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic">{customer.lastLogin || '-'}</td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="4" class="px-8 py-10 text-center text-sm font-semibold text-zinc-400">
                                        Tidak ada data customer yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'products'}
            <!-- Tab: Produk -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {#each [
                    { label: 'Total Catalog', count: mockCatalogItems.length, color: 'text-zinc-600' },
                    { label: 'Active Menu', count: mockCatalogItems.filter(p => p.type === 'menu' && p.isActive).length, color: 'text-emerald-600' },
                    { label: 'Active Package', count: mockCatalogItems.filter(p => p.type === 'package' && p.isActive).length, color: 'text-blue-600' },
                    { label: 'Sold Out / Draft', count: mockCatalogItems.filter(p => !p.isActive || p.status === 'sold_out').length, color: 'text-red-600' }
                ] as stat}
                    <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 text-center relative group">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p class="text-2xl font-black {stat.color} italic tracking-tighter">{stat.count}</p>
                        <span class="absolute top-2 right-4 text-[7px] font-black text-zinc-300 uppercase tracking-tighter italic opacity-40">Visual Data</span>
                    </div>
                {/each}
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest italic">Analisa Performa Produk (Simulasi)</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Produk/Menu</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Base Price</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredProducts as product}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{product.name}</td>
                                    <td class="px-8 py-6 text-xs font-bold text-zinc-500 italic uppercase tracking-tighter">{product.category}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {product.type === 'package' ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-600'}">
                                            {product.type}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-right font-black text-brand-charcoal dark:text-white">{formatRupiah(product.basePrice)}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {product.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}">
                                            {product.status}
                                        </span>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="5" class="px-8 py-10 text-center text-sm font-semibold text-zinc-400">
                                        Tidak ada data produk yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'finance'}
            <!-- Tab: Keuangan -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-sm text-white relative group">
                    <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Valid Revenue (Paid)</p>
                    <p class="text-2xl font-black text-brand-primary italic tracking-tighter">{formatRupiah(dbStats.validRevenue)}</p>
                    <span class="absolute top-4 right-6 text-[7px] font-black text-emerald-400 uppercase tracking-widest italic animate-pulse">DB Sync</span>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative">
                    <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Lunas / Paid (DB)</p>
                    <p class="text-2xl font-black text-emerald-600 italic tracking-tighter">{formatRupiah(dbStats.validRevenue)}</p>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative">
                    <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Belum Final / Pending (DB)</p>
                    <p class="text-2xl font-black text-orange-600 italic tracking-tighter">{formatRupiah(dbStats.pendingRevenue)}</p>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative">
                    <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Package Orders (DB)</p>
                    <p class="text-2xl font-black text-indigo-600 italic tracking-tighter">{dbStats.sourceBreakdown.packageRequest} Order</p>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest italic">Rincian Arus Kas Pesanan Lokal</h3>
                    <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">✓ Database Backed</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Source</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Status</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Method</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Revenue Rule</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredOrders as order}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 font-black text-zinc-400 text-xs">#{order.id}</td>
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{order.customerName}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {sourceTypeBadgeClass(order.sourceType)}">
                                            {getOrderSourceLabel(order.sourceType)}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-right font-black text-brand-charcoal dark:text-white">{formatRupiah(order.total)}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {paymentStatusBadgeClass(order.paymentStatus)}">
                                            {paymentStatusLabel(order.paymentStatus)}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic uppercase tracking-tighter">{paymentMethodLabel(order.paymentMethod || 'transfer')}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {isRevenueEligibleOrder(order) ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}">
                                            {isRevenueEligibleOrder(order) ? 'Paid Final' : 'Non Final'}
                                        </span>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="7" class="px-8 py-10 text-center text-sm font-semibold text-zinc-400">
                                        Tidak ada data keuangan yang cocok dengan pencarian/filter periode.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>
        {/if}
        {/if}

        <!-- Empty Search State -->
        {#if normalizedSearchQuery.length > 0 && !hasSearchResultInActiveTab}
            <div class="px-8 py-20 text-center">
                <div class="max-w-xs mx-auto space-y-4">
                    <div class="text-4xl">🔍</div>
                    <h3 class="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">Data tidak ditemukan</h3>
                    <p class="text-zinc-500 text-sm font-medium">Tidak ada hasil yang cocok dengan kata kunci "{searchQuery}" pada tab ini.</p>
                    <button
                        onclick={resetFilters}
                        class="text-brand-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                        Hapus Filter Pencarian
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

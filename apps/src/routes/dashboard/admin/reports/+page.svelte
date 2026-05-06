<script lang="ts">
    import { mockAdminMetrics, mockAdminSalesReports } from '$lib/mock/reports';
    import { mockOrders, getTotalRevenue } from '$lib/mock/orders';
    import { mockAccounts } from '$lib/mock/accounts';
    import { mockCatalogItems } from '$lib/mock/catalog';
    import { fade, fly } from 'svelte/transition';

    // State
    let activeTab = $state<'overview' | 'sales' | 'orders' | 'customers' | 'products' | 'finance'>('overview');
    let searchQuery = $state('');
    let periodFilter = $state('month');

    // Helper: format rupiah
    function formatRupiah(value: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    }

    // Tab items configuration
    const tabs = [
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

    // Filtered data based on search and tab (Simulasi)
    let filteredOrders = $derived(
        mockOrders.filter(o => 
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    let filteredAccounts = $derived(
        mockAccounts.filter(a => 
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    let filteredProducts = $derived(
        mockCatalogItems.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    function handleExport() {
        alert(`Laporan ${activeTab.toUpperCase()} berhasil diekspor (Simulasi PDF/CSV).`);
    }

    function resetFilters() {
        searchQuery = '';
        periodFilter = 'month';
    }
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Laporan <span class="text-brand-primary">Bisnis</span> 📈</h1>
            <p class="text-zinc-500 font-medium mt-1">Pantau penjualan, pesanan, customer, produk, dan keuangan Tien’s Catering.</p>
        </div>
        <div class="flex gap-3">
            <button onclick={handleExport} class="bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
            </button>
        </div>
    </header>

    <!-- Top Controls -->
    <div class="grid lg:grid-cols-3 gap-6">
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
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
        {#each tabs as tab}
            <button 
                onclick={() => activeTab = tab.id as any}
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
        {#if activeTab === 'overview'}
            <!-- Tab: Ringkasan -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {#each mockAdminMetrics as metric}
                    <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150"></div>
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{metric.label}</p>
                        <p class="text-3xl font-black text-brand-charcoal dark:text-white italic mb-2 tracking-tighter">{metric.value}</p>
                        <p class="text-[10px] font-bold {metric.tone === 'positive' ? 'text-emerald-500' : 'text-zinc-400'} uppercase tracking-widest">
                            {metric.change}
                        </p>
                    </div>
                {/each}
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase italic">Weekly Sales Trend</h2>
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{periodFilter} Report</span>
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
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>
        
        {:else if activeTab === 'sales'}
            <!-- Tab: Penjualan -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                    <p class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Total Revenue</p>
                    <p class="text-3xl font-black text-emerald-700 dark:text-emerald-300 italic tracking-tighter">{formatRupiah(getTotalRevenue())}</p>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 shadow-sm">
                    <p class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Total Transactions</p>
                    <p class="text-3xl font-black text-blue-700 dark:text-blue-300 italic tracking-tighter">{mockOrders.length}</p>
                </div>
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
                    <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Avg. Order Value</p>
                    <p class="text-3xl font-black text-indigo-700 dark:text-indigo-300 italic tracking-tighter">{formatRupiah(Math.round(getTotalRevenue() / mockOrders.length))}</p>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status Bayar</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredOrders as order}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 font-black text-zinc-400 text-xs">#{order.id}</td>
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{order.customerName}</td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic">{order.orderDate}</td>
                                    <td class="px-8 py-6 text-right font-black text-emerald-600">{formatRupiah(order.total)}</td>
                                    <td class="px-8 py-6 text-center">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}">
                                            {order.paymentStatus}
                                        </span>
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
                {#each [
                    { label: 'Pending', count: mockOrders.filter(o => o.status === 'pending').length, color: 'text-orange-500' },
                    { label: 'Processing', count: mockOrders.filter(o => o.status === 'processing').length, color: 'text-blue-500' },
                    { label: 'Completed', count: mockOrders.filter(o => o.status === 'completed').length, color: 'text-emerald-500' },
                    { label: 'Cancelled', count: mockOrders.filter(o => o.status === 'cancelled').length, color: 'text-red-500' }
                ] as stat}
                    <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 text-center">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p class="text-2xl font-black {stat.color} italic tracking-tighter">{stat.count}</p>
                    </div>
                {/each}
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Delivery</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order Status</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredOrders as order}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 font-black text-zinc-400 text-xs">#{order.id}</td>
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{order.customerName}</td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic">{order.deliveryDate}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                             order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                             order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-right font-black text-brand-charcoal dark:text-white">{formatRupiah(order.total)}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'customers'}
            <!-- Tab: Customer -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
                    <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Top Customers</p>
                    <div class="space-y-4">
                        {#each mockAccounts.filter(a => a.role === 'USER' && (a.totalOrders ?? 0) > 0).sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, 3) as top}
                            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                <span class="text-sm font-black italic">{top.name}</span>
                                <span class="text-xs font-bold text-brand-primary">{top.totalOrders} Pesanan</span>
                            </div>
                        {/each}
                    </div>
                </div>
                <div class="bg-brand-primary p-8 rounded-[2.5rem] text-white">
                    <p class="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">New Customers (Bulan Ini)</p>
                    <p class="text-5xl font-black italic tracking-tighter">+{mockAccounts.filter(a => a.registrationStatus === 'approved').length}</p>
                    <p class="text-xs font-bold mt-2 text-white/80">Pertumbuhan yang sangat baik!</p>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
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
                    <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 text-center">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p class="text-2xl font-black {stat.color} italic tracking-tighter">{stat.count}</p>
                    </div>
                {/each}
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
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
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

        {:else if activeTab === 'finance'}
            <!-- Tab: Keuangan -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-sm text-white">
                    <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Gross Revenue</p>
                    <p class="text-2xl font-black text-brand-primary italic tracking-tighter">{formatRupiah(getTotalRevenue())}</p>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Paid Amount</p>
                    <p class="text-2xl font-black text-emerald-600 italic tracking-tighter">{formatRupiah(mockOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0))}</p>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Unpaid / Pending</p>
                    <p class="text-2xl font-black text-orange-600 italic tracking-tighter">{formatRupiah(mockOrders.filter(o => o.paymentStatus === 'unpaid' || o.paymentStatus === 'waiting_verification').reduce((sum, o) => sum + o.total, 0))}</p>
                </div>
                <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Refunded</p>
                    <p class="text-2xl font-black text-indigo-600 italic tracking-tighter">{formatRupiah(mockOrders.filter(o => o.paymentStatus === 'refunded').reduce((sum, o) => sum + o.total, 0))}</p>
                </div>
            </div>

            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Status</th>
                                <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Method</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {#each filteredOrders as order}
                                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                                    <td class="px-8 py-6 font-black text-zinc-400 text-xs">#{order.id}</td>
                                    <td class="px-8 py-6 text-sm font-black text-brand-charcoal dark:text-white">{order.customerName}</td>
                                    <td class="px-8 py-6 text-right font-black text-brand-charcoal dark:text-white">{formatRupiah(order.total)}</td>
                                    <td class="px-8 py-6">
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            {order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}">
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td class="px-8 py-6 text-xs text-zinc-500 font-bold italic uppercase tracking-tighter">{order.paymentMethod || 'Transfer'}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>
        {/if}
    </div>

    <!-- Empty Search State -->
    {#if searchQuery && (
        (activeTab === 'overview' && mockAdminSalesReports.length === 0) ||
        (activeTab === 'sales' && filteredOrders.length === 0) ||
        (activeTab === 'orders' && filteredOrders.length === 0) ||
        (activeTab === 'customers' && filteredAccounts.length === 0) ||
        (activeTab === 'products' && filteredProducts.length === 0) ||
        (activeTab === 'finance' && filteredOrders.length === 0)
    )}
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

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

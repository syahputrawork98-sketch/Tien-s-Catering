<script lang="ts">
    import { mockAdminMetrics, mockAdminSalesReports, formatRupiah } from '$lib/mock/admin';
    import { fade } from 'svelte/transition';

    function handleExport() {
        alert("Laporan berhasil diekspor (Simulasi PDF).");
    }
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Laporan Bisnis 📈</h1>
            <p class="text-zinc-500 font-medium mt-1">Analisa performa penjualan dan operasional katering.</p>
        </div>
        <div class="flex gap-2">
            <button onclick={handleExport} class="bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
            </button>
        </div>
    </header>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each mockAdminMetrics as metric}
            <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150"></div>
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{metric.label}</p>
                <p class="text-2xl font-black text-brand-charcoal dark:text-white italic mb-2">{metric.value}</p>
                <p class="text-[10px] font-bold {metric.tone === 'positive' ? 'text-emerald-500' : 'text-zinc-400'} uppercase tracking-widest">
                    {metric.change}
                </p>
            </div>
        {/each}
    </div>

    <!-- Sales Report Table -->
    <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
            <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight">Penjualan Mingguan</h2>
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Mei 2026</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Periode</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Revenue</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Orders</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Gross Profit</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Top Menu</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Action</th>
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
                            <td class="px-8 py-6 text-right">
                                <button class="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-brand-primary transition-colors">Detail</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>
</div>

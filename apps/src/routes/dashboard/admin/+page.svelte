<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { mockOrders } from '$lib/mock/orders';
    import { mockAccounts } from '$lib/mock/accounts';
    import { mockAdminMetrics, mockAdminSalesReports } from '$lib/mock/admin';
    import { getRecentAudit } from '$lib/mock/audit';

    const metrics = mockAdminMetrics;
    const recentAudit = getRecentAudit(5);

    const orderStats = {
        total: mockOrders.length,
        new: mockOrders.filter(o => o.status === 'new').length,
        processing: mockOrders.filter(o => ['confirmed','processing','ready','delivered'].includes(o.status)).length,
        completed: mockOrders.filter(o => o.status === 'completed').length,
        cancelled: mockOrders.filter(o => o.status === 'cancelled').length
    };

    const customerStats = {
        total: mockAccounts.filter(a => a.role === 'USER').length,
        pending: mockAccounts.filter(a => a.role === 'USER' && a.registrationStatus === 'pending').length,
        approved: mockAccounts.filter(a => a.role === 'USER' && a.registrationStatus === 'approved').length
    };

    const quickActions = [
        { href: '/dashboard/admin/orders', icon: '🧾', label: 'Kelola Pesanan', desc: 'Monitoring & override pesanan', color: 'from-blue-500 to-indigo-600' },
        { href: '/dashboard/admin/menu', icon: '🍱', label: 'Kelola Menu', desc: 'Master menu & status publik', color: 'from-emerald-500 to-teal-600' },
        { href: '/dashboard/admin/packages', icon: '🎁', label: 'Kelola Paket', desc: 'Master paket catering', color: 'from-purple-500 to-violet-600' },
        { href: '/dashboard/admin/customers', icon: '👥', label: 'Kelola Customer', desc: 'Approval & manajemen akun', color: 'from-amber-500 to-orange-600' },
        { href: '/dashboard/admin/reports', icon: '📊', label: 'Laporan', desc: 'Rekap penjualan & performa', color: 'from-zinc-600 to-zinc-800' },
        { href: '/dashboard/admin/tax', icon: '🧾', label: 'Pajak & Invoice', desc: 'Atur pajak & aturan billing', color: 'from-red-500 to-rose-600' },
        { href: '/dashboard/admin/audit', icon: '🧭', label: 'Audit Log', desc: 'Riwayat perubahan sistem', color: 'from-zinc-700 to-zinc-900' }
    ];

    const actorDot = (actor: string) => ({ admin: 'bg-red-500', cs: 'bg-blue-500', user: 'bg-zinc-400' }[actor] ?? 'bg-zinc-400');

    function formatPrice(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    }
</script>

<div class="space-y-10 pb-24">
    <!-- Header -->
    <header in:fly={{ y: -20, duration: 500 }}>
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Control Center</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Admin Control Center 🚀</h1>
        <p class="text-zinc-500 font-medium mt-2">Pusat kontrol operasional, customer, katalog, dan laporan Tien's Catering.</p>
    </header>

    <!-- Key Metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 100 }}>
        {#each metrics as m}
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all group">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-brand-primary transition-colors">{m.label}</p>
                <p class="text-2xl font-black text-brand-charcoal dark:text-white italic mb-1">{m.value}</p>
                <p class="text-[10px] font-bold {m.tone === 'positive' ? 'text-emerald-500' : m.tone === 'negative' ? 'text-red-500' : 'text-zinc-400'}">{m.change}</p>
            </div>
        {/each}
    </div>

    <!-- Order & Customer Summary -->
    <div class="grid lg:grid-cols-2 gap-6" in:fade={{ delay: 150 }}>
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Ringkasan Pesanan</h2>
                <a href="/dashboard/admin/orders" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Lihat Semua →</a>
            </div>
            <div class="grid grid-cols-2 gap-4">
                {#each [
                    { label: 'Total', value: orderStats.total, color: 'text-brand-charcoal dark:text-white' },
                    { label: 'Baru', value: orderStats.new, color: 'text-blue-600' },
                    { label: 'Diproses', value: orderStats.processing, color: 'text-amber-600' },
                    { label: 'Selesai', value: orderStats.completed, color: 'text-emerald-600' }
                ] as s}
                    <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p class="text-2xl font-black {s.color} italic">{s.value}</p>
                    </div>
                {/each}
            </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Ringkasan Customer</h2>
                <a href="/dashboard/admin/customers" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Kelola →</a>
            </div>
            <div class="grid grid-cols-3 gap-4">
                {#each [
                    { label: 'Total', value: customerStats.total, color: 'text-brand-charcoal dark:text-white' },
                    { label: 'Aktif', value: customerStats.approved, color: 'text-emerald-600' },
                    { label: 'Pending', value: customerStats.pending, color: 'text-amber-600' }
                ] as s}
                    <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl text-center">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p class="text-2xl font-black {s.color} italic">{s.value}</p>
                    </div>
                {/each}
            </div>
            {#if customerStats.pending > 0}
                <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <p class="text-[10px] font-bold text-amber-700 dark:text-amber-400">⚠️ {customerStats.pending} customer menunggu persetujuan Admin.</p>
                </div>
            {/if}
        </div>
    </div>

    <!-- Quick Actions -->
    <div in:fade={{ delay: 200 }}>
        <h2 class="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {#each quickActions as action}
                <a href={action.href} class="group flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br {action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        {action.icon}
                    </div>
                    <p class="text-xs font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors">{action.label}</p>
                    <p class="text-[9px] text-zinc-400 mt-1 leading-relaxed">{action.desc}</p>
                </a>
            {/each}
        </div>
    </div>

    <!-- Audit Preview & Sales -->
    <div class="grid lg:grid-cols-3 gap-6" in:fade={{ delay: 250 }}>
        <!-- Sales Reports -->
        <div class="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div class="px-8 py-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex justify-between items-center">
                <h2 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Laporan Penjualan</h2>
                <a href="/dashboard/admin/reports" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Detail →</a>
            </div>
            <div class="divide-y divide-zinc-50 dark:divide-zinc-800">
                {#each mockAdminSalesReports as rep}
                    <div class="px-8 py-5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <div>
                            <p class="text-xs font-black text-brand-charcoal dark:text-white">{rep.period}</p>
                            <p class="text-[10px] text-zinc-400">{rep.orders} order · Top: {rep.topMenu}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-black text-emerald-600">{formatPrice(rep.revenue)}</p>
                            <p class="text-[10px] text-zinc-400">Profit: {formatPrice(rep.grossProfit)}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Audit Preview -->
        <div class="bg-zinc-900 dark:bg-zinc-950 rounded-[2.5rem] p-8 text-white">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-sm font-black text-brand-primary uppercase tracking-widest italic">Audit Terbaru</h3>
                <a href="/dashboard/admin/audit" class="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-brand-primary transition-colors">Semua →</a>
            </div>
            <div class="space-y-5">
                {#each recentAudit as log}
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full {actorDot(log.actor)}"></div>
                        <div>
                            <p class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{log.actor} · {log.createdAt}</p>
                            <p class="text-xs font-bold text-zinc-300 leading-relaxed mt-0.5">{log.action}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

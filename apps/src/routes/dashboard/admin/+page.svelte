<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { mockAccounts } from '$lib/mock/accounts';
    import { getRecentAudit } from '$lib/mock/audit';
    import { authStore } from '$lib/stores/auth.svelte';
    import { canAccess } from '$lib/utils/roleGuard';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let orders = $state<any[]>([]);
    let loading = $state(true);
    let error = $state('');

    const isPersonaMode = browser && !!localStorage.getItem('tiens_persona_mode');
    const allowed = $derived(canAccess(authStore.user, 'ADMIN', isPersonaMode));

    async function loadOperationalData() {
        loading = true;
        error = '';
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                orders = data.items || [];
            } else {
                error = 'Data operasional gagal dimuat. Silakan cek koneksi atau API lokal.';
                orders = [];
            }
        } catch (e) {
            error = 'Terjadi kesalahan sistem saat mengambil data. Pastikan server API berjalan.';
            orders = [];
        } finally {
            loading = false;
        }
    }

    // Monitoring Derivations
    const stats = $derived({
        totalActive: orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length,
        waitingVerification: orders.filter(o => o.paymentStatus === 'waiting_verification').length,
        paid: orders.filter(o => o.paymentStatus === 'paid' || o.status === 'completed').length,
        problematic: orders.filter(o => o.paymentStatus === 'rejected' || o.status === 'cancelled').length,
        unpaid: orders.filter(o => o.paymentStatus === 'unpaid').length
    });

    const needsAttention = $derived(orders.filter(o =>
        o.paymentStatus === 'waiting_verification' ||
        o.paymentStatus === 'rejected' ||
        (o.paymentStatus === 'unpaid' && o.status !== 'cancelled') ||
        o.paymentStatus === 'cod_pending'
    ).slice(0, 6));

    const recentActivity = $derived([...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 5));

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

    function getPaymentStatusLabel(status: string) {
        const map: any = {
            'unpaid': 'Belum Lunas',
            'waiting_verification': 'Menunggu Verifikasi',
            'paid': 'Lunas',
            'cod_pending': 'COD Pending',
            'rejected': 'Ditolak'
        };
        return map[status] || status;
    }

    function getPaymentStatusColor(status: string) {
        const map: any = {
            'unpaid': 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400',
            'waiting_verification': 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
            'paid': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
            'cod_pending': 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400',
            'rejected': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
        };
        return map[status] || 'text-zinc-500 bg-zinc-50';
    }

    onMount(() => {
        loadOperationalData();
    });
</script>

<div class="space-y-10 pb-24">
    {#if !allowed && !isPersonaMode && authStore.isAuthenticated}
        <!-- Access denied for wrong-role authenticated users -->
        <div class="flex flex-col items-center justify-center py-24 text-center" in:fade>
            <div class="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-4xl mb-6">🚫</div>
            <h1 class="text-2xl font-black text-brand-charcoal dark:text-white tracking-tighter uppercase">Akses Ditolak</h1>
            <p class="text-zinc-500 font-medium mt-2 max-w-sm">Area ini hanya tersedia untuk Administrator. Role Anda saat ini tidak memiliki izin akses.</p>
            <a href="/dashboard" class="mt-8 px-8 py-4 bg-brand-charcoal text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all">
                Kembali ke Dashboard
            </a>
        </div>
    {:else}
        {#if isPersonaMode}
            <div class="mb-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3" in:fade>
                <span class="text-indigo-600 font-black text-xs">🎭</span>
                <p class="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Dev Persona Mode — Simulasi Admin Operasional</p>
            </div>
        {/if}

        <!-- Header -->
        <header in:fly={{ y: -20, duration: 500 }}>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Operational Monitoring Foundation</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Operational Monitor 🛰️</h1>
            <p class="text-zinc-500 font-medium mt-2">Pantau status pesanan, verifikasi pembayaran manual, dan kendali operasional internal.</p>
        </header>

        <!-- Operational Content Area -->
        {#if loading}
            <div class="py-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center space-y-4" in:fade>
                <div class="w-10 h-10 border-4 border-zinc-100 border-t-brand-primary rounded-full animate-spin"></div>
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Pusat Data...</p>
            </div>
        {:else if error}
            <div class="p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6" in:fade>
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
                <div class="flex-1 text-center md:text-left">
                    <p class="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Data Honesty Alert</p>
                    <p class="text-sm font-medium text-red-500 mt-1">{error}</p>
                </div>
                <button
                    onclick={loadOperationalData}
                    class="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                    Coba Hubungkan Ulang
                </button>
            </div>
        {:else}
            <!-- Success States -->
            {#if orders.length === 0}
                <div class="py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 border-dashed flex flex-col items-center justify-center text-center px-6" in:fade>
                    <div class="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-4xl mb-6 grayscale opacity-50">🍱</div>
                    <p class="text-sm font-black text-zinc-400 uppercase tracking-widest italic">Belum Ada Data Pesanan Operasional</p>
                    <p class="text-xs text-zinc-500 mt-2 max-w-xs">Data akan muncul secara otomatis ketika customer melakukan pemesanan melalui katalog.</p>
                </div>
            {:else}
                <!-- Monitoring Stats Cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 100 }}>
                    {#each [
                        { label: 'Total Pesanan Aktif', value: stats.totalActive, color: 'text-brand-charcoal dark:text-white', sub: 'Semua status non-final' },
                        { label: 'Menunggu Verifikasi', value: stats.waitingVerification, color: 'text-amber-600', sub: 'Bukti bayar butuh approval' },
                        { label: 'Total Lunas (Paid)', value: stats.paid, color: 'text-emerald-600', sub: 'Pembayaran terverifikasi' },
                        { label: 'Bermasalah / Dibatalkan', value: stats.problematic, color: 'text-red-600', sub: 'Status ditolak atau void' }
                    ] as m}
                        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all group">
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-brand-primary transition-colors">{m.label}</p>
                            <p class="text-3xl font-black {m.color} italic mb-1">{m.value}</p>
                            <p class="text-[9px] font-medium text-zinc-400 italic">{m.sub}</p>
                        </div>
                    {/each}
                </div>

                <!-- Middle Section: Needs Attention & Recent Activity -->
                <div class="grid lg:grid-cols-2 gap-6" in:fade={{ delay: 150 }}>
                    <!-- Needs Attention -->
                    <div class="bg-zinc-900 dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-xl p-8 text-white relative overflow-hidden">
                        <div class="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl"></div>
                        <div class="flex justify-between items-center mb-8 relative z-10">
                            <h2 class="text-base font-black text-brand-primary uppercase tracking-widest italic">⚠️ Perlu Perhatian (Needs Attention)</h2>
                            <span class="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase">{needsAttention.length} Items</span>
                        </div>

                        <div class="space-y-3 relative z-10">
                            {#each needsAttention as order}
                                <a href="/dashboard/admin/orders?search={order.orderNumber}" class="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                                            {order.paymentStatus === 'waiting_verification' ? '🧐' : order.paymentStatus === 'rejected' ? '❌' : '💰'}
                                        </div>
                                        <div>
                                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{order.orderNumber}</p>
                                            <p class="text-xs font-bold text-white group-hover:text-brand-primary transition-colors">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span class="px-2 py-1 rounded-lg text-[8px] font-black uppercase {getPaymentStatusColor(order.paymentStatus)}">
                                            {getPaymentStatusLabel(order.paymentStatus)}
                                        </span>
                                        <p class="text-[10px] font-black text-zinc-500 mt-1 italic">{formatPrice(order.total)}</p>
                                    </div>
                                </a>
                            {:else}
                                <div class="py-12 text-center">
                                    <span class="text-4xl mb-4 block">✨</span>
                                    <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Semua operasional terkendali.</p>
                                    <p class="text-[10px] text-zinc-600 mt-1 italic">Tidak ada pembayaran atau pesanan yang tertahan.</p>
                                </div>
                            {/each}
                        </div>
                        {#if needsAttention.length > 0}
                            <a href="/dashboard/admin/orders" class="mt-6 block text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-white/5">
                                Proses Semua di Manajemen Pesanan →
                            </a>
                        {/if}
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8">
                        <div class="flex justify-between items-center mb-8">
                            <h2 class="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Aktivitas Operasional Terbaru</h2>
                            <a href="/dashboard/admin/orders" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Lihat Semua →</a>
                        </div>

                        <div class="space-y-6">
                            {#each recentActivity as act}
                                <div class="flex items-start gap-4">
                                    <div class="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <div class="flex-1 border-b border-zinc-50 dark:border-zinc-800 pb-4">
                                        <div class="flex justify-between items-start mb-1">
                                            <p class="text-xs font-black text-brand-charcoal dark:text-white">{act.customerName}</p>
                                            <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{act.orderDate}</span>
                                        </div>
                                        <p class="text-[10px] text-zinc-500 font-medium">Order <span class="font-bold">{act.orderNumber}</span> sebesar {formatPrice(act.total)}</p>
                                        <div class="flex items-center gap-3 mt-2">
                                            <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase {getPaymentStatusColor(act.paymentStatus)}">
                                                {getPaymentStatusLabel(act.paymentStatus)}
                                            </span>
                                            <span class="text-[9px] font-bold text-zinc-400 italic">Antar: {act.deliveryDate}</span>
                                        </div>
                                    </div>
                                </div>
                            {:else}
                                <div class="py-12 text-center">
                                    <p class="text-xs font-bold text-zinc-300 uppercase tracking-widest italic">Belum ada aktivitas pesanan.</p>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
        {/if}

        <!-- Quick Actions -->
        <div in:fade={{ delay: 200 }}>
            <h2 class="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Navigasi Admin</h2>
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

        <!-- Footer Stats: Customer & Audit -->
        <div class="grid lg:grid-cols-3 gap-6" in:fade={{ delay: 250 }}>
            <!-- Customer Summary -->
            <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xs font-black text-zinc-400 uppercase tracking-widest">Summary Customer</h2>
                    <a href="/dashboard/admin/customers" class="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:underline">Kelola</a>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Akun</p>
                        <p class="text-2xl font-black italic">{customerStats.total}</p>
                    </div>
                    <div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pending</p>
                        <p class="text-2xl font-black italic text-amber-600">{customerStats.pending}</p>
                    </div>
                </div>
                {#if customerStats.pending > 0}
                    <div class="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p class="text-[9px] font-bold text-amber-700 dark:text-amber-400 italic">Customer baru menunggu approval.</p>
                    </div>
                {/if}
            </div>

            <!-- Audit Preview -->
            <div class="lg:col-span-2 bg-zinc-900 dark:bg-zinc-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                 <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-zinc-500/5 rounded-full blur-3xl"></div>
                <div class="flex justify-between items-center mb-6 relative z-10">
                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-widest italic">Audit Log Operasional</h3>
                    <a href="/dashboard/admin/audit" class="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-brand-primary transition-colors">Semua Log →</a>
                </div>
                <div class="grid md:grid-cols-2 gap-4 relative z-10">
                    {#each getRecentAudit(4) as log}
                        <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div class="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full {actorDot(log.actor)}"></div>
                            <div class="min-w-0">
                                <p class="text-[8px] font-black text-zinc-500 uppercase tracking-widest truncate">{log.actor} · {log.createdAt}</p>
                                <p class="text-[10px] font-bold text-zinc-300 leading-tight mt-1 line-clamp-1">{log.action}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

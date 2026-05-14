<script lang="ts">
    import { mockSession } from '$lib/stores/mockSession.svelte';
    import { authStore } from '$lib/stores/auth.svelte';
    import { canAccess, toAppRole } from '$lib/utils/roleGuard';
    import { browser } from '$app/environment';
    import { fade } from 'svelte/transition';

    const isPersonaMode = browser && !!localStorage.getItem('tiens_persona_mode');
    const allowed = $derived(canAccess(authStore.user, 'CS', isPersonaMode));
</script>

<div class="space-y-10">
    {#if !allowed && !isPersonaMode && authStore.isAuthenticated}
        <div class="flex flex-col items-center justify-center py-24 text-center" in:fade>
            <div class="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-4xl mb-6">🚫</div>
            <h1 class="text-2xl font-black text-brand-charcoal dark:text-white tracking-tighter uppercase">Akses Ditolak</h1>
            <p class="text-zinc-500 font-medium mt-2 max-w-sm">Area ini hanya tersedia untuk Customer Service atau Admin.</p>
            <a href="/dashboard" class="mt-8 px-8 py-4 bg-brand-charcoal text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all">
                Kembali ke Dashboard
            </a>
        </div>
    {:else}
    {#if isPersonaMode}
        <div class="mb-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3" in:fade>
            <span class="text-blue-600 font-black text-xs">🎭</span>
            <p class="text-[10px] font-black text-blue-700 uppercase tracking-widest">Dev Persona Mode — Simulasi CS, Bukan Akun Produksi</p>
        </div>
    {/if}
    <header>
        <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">CS Overview 🎧</h1>
        <p class="text-zinc-500 font-medium mt-1">Monitoring dan manajemen pesanan pelanggan.</p>
    </header>

    <div class="grid md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Pesanan Masuk</p>
            <p class="text-4xl font-black text-orange-600 italic">5 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">New</span></p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Perlu Diproses</p>
            <p class="text-4xl font-black text-blue-600 italic">12 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">Jobs</span></p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Cek Pembayaran</p>
            <p class="text-4xl font-black text-emerald-600 italic">3 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">Bills</span></p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Total Customer</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">42 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">Users</span></p>
        </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-10">
        <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-10">
            <h2 class="text-xl font-black text-brand-charcoal dark:text-white mb-6 tracking-tight">Shortcut Operasional</h2>
            <div class="grid grid-cols-1 gap-4">
                <a href="/dashboard/cs/orders" class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary transition-all group">
                    <p class="font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors">Kelola Pesanan</p>
                    <p class="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Konfirmasi dan update status order</p>
                </a>
                <a href="/dashboard/cs/menu" class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary transition-all group">
                    <p class="font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors">Posting Menu Harian</p>
                    <p class="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Update katalog menu live hari ini</p>
                </a>
                <a href="/dashboard/cs/customers" class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary transition-all group">
                    <p class="font-black text-brand-charcoal dark:text-white group-hover:text-brand-primary transition-colors">Manajemen Pelanggan</p>
                    <p class="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Kelola data instansi dan akun personal</p>
                </a>
            </div>
        </section>

        <section class="bg-brand-charcoal rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-charcoal/30">
            <h2 class="text-xl font-black mb-6 tracking-tight italic">Status Sistem</h2>
            <div class="space-y-6">
                <div class="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-xs font-black uppercase tracking-widest text-zinc-400">Dapur Status</span>
                    <span class="flex items-center gap-2 text-xs font-black text-green-400 uppercase tracking-widest">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Operational
                    </span>
                </div>
                <div class="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span class="text-xs font-black uppercase tracking-widest text-zinc-400">Logistik</span>
                    <span class="flex items-center gap-2 text-xs font-black text-green-400 uppercase tracking-widest">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        On Ready
                    </span>
                </div>
                <div class="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Internal Note</p>
                    <p class="text-xs text-zinc-300 leading-relaxed italic">"Jangan lupa konfirmasi menu untuk acara Pemkot besok pagi sebelum jam 16:00."</p>
                </div>
            </div>
        </section>
    </div>
    {/if}
</div>

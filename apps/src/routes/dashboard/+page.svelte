<script lang="ts">
    import { mockSession } from '$lib/stores/mockSession.svelte';
</script>

<div class="space-y-10">
    <header>
        <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Halo, {mockSession.user.name.split(' ')[0]}! 👋</h1>
        <p class="text-zinc-500 font-medium mt-1">Selamat datang di dashboard katering pribadi Anda.</p>
    </header>

    <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Total Pesanan</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">12 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">Order</span></p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Dalam Proses</p>
            <p class="text-4xl font-black text-blue-600 italic">2 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">Sajian</span></p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Loyalty Points</p>
            <p class="text-4xl font-black text-brand-primary italic">850 <span class="text-xs not-italic text-zinc-400 font-bold uppercase tracking-widest ml-1">Pts</span></p>
        </div>
    </div>

    <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
            <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight">Pesanan Terakhir</h2>
            <a href="/dashboard/orders" class="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline">Lihat Semua</a>
        </div>
        <div class="p-8">
            <div class="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black">#GH</div>
                    <div>
                        <p class="font-black text-brand-charcoal dark:text-white">Pesanan Nasi Box Ayam</p>
                        <p class="text-xs text-zinc-400 font-bold uppercase tracking-widest">Status: Selesai</p>
                    </div>
                </div>
                <p class="font-black text-brand-charcoal dark:text-white italic">Rp 250.000</p>
            </div>
        </div>
    </section>

    <div class="pt-6">
        <a href="/" class="inline-flex items-center gap-3 bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Pesanan Baru
        </a>
    </div>
</div>

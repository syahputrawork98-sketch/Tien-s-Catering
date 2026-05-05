<script lang="ts">
    import { mockSession } from '$lib/stores/mockSession.svelte';
</script>

<div class="space-y-10">
    <header>
        <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Admin Control Center 🚀</h1>
        <p class="text-zinc-500 font-medium mt-1">Ringkasan performa bisnis dan kontrol sistem.</p>
    </header>

    <div class="grid md:grid-cols-4 gap-6">
        <div class="bg-brand-charcoal p-8 rounded-[2rem] text-white shadow-2xl shadow-brand-charcoal/30 border border-white/5">
            <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Omzet Bulan Ini</p>
            <p class="text-3xl font-black text-brand-primary italic">Rp 45.2M</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Total Orders</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">1.2k</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Active Clients</p>
            <p class="text-4xl font-black text-brand-charcoal dark:text-white italic">156</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">System Health</p>
            <p class="text-4xl font-black text-emerald-500 italic">99%</p>
        </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-10">
            <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight">Performa Penjualan (Mock)</h2>
                </div>
                <div class="p-10 flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="flex items-end gap-3 h-32 mb-6">
                            <div class="w-8 bg-zinc-100 dark:bg-zinc-800 rounded-t-lg h-1/2"></div>
                            <div class="w-8 bg-brand-primary rounded-t-lg h-3/4"></div>
                            <div class="w-8 bg-brand-charcoal dark:bg-zinc-700 rounded-t-lg h-full"></div>
                            <div class="w-8 bg-zinc-100 dark:bg-zinc-800 rounded-t-lg h-2/3"></div>
                            <div class="w-8 bg-brand-primary rounded-t-lg h-full"></div>
                        </div>
                        <p class="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Grafik Pertumbuhan Real-time</p>
                    </div>
                </div>
            </section>

            <div class="grid md:grid-cols-2 gap-6">
                <a href="/dashboard/admin/reports" class="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary transition-all group">
                    <h3 class="text-xl font-black text-brand-charcoal dark:text-white mb-2 group-hover:text-brand-primary transition-colors">Reports</h3>
                    <p class="text-sm text-zinc-500 font-medium">Rekapitulasi data finansial dan logistik.</p>
                </a>
                <a href="/dashboard/admin/users" class="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary transition-all group">
                    <h3 class="text-xl font-black text-brand-charcoal dark:text-white mb-2 group-hover:text-brand-primary transition-colors">User Management</h3>
                    <p class="text-sm text-zinc-500 font-medium">Atur hak akses dan role karyawan.</p>
                </a>
            </div>
        </div>

        <aside class="space-y-6">
            <div class="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
                <h3 class="text-lg font-black mb-6 uppercase tracking-widest italic text-brand-primary">Audit Log</h3>
                <div class="space-y-6">
                    <div class="border-l-2 border-brand-primary pl-4 py-1">
                        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Just Now</p>
                        <p class="text-xs font-bold text-zinc-300">Admin logged in from Surabaya</p>
                    </div>
                    <div class="border-l-2 border-white/20 pl-4 py-1">
                        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">10m ago</p>
                        <p class="text-xs font-bold text-zinc-300">New menu "Nasi Liwet" added by CS</p>
                    </div>
                    <div class="border-l-2 border-white/20 pl-4 py-1">
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">1h ago</p>
                        <p class="text-xs font-bold text-zinc-300">Payment #GH229 confirmed</p>
                    </div>
                </div>
            </div>

            <div class="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest mb-4">Settings</h3>
                <a href="/dashboard/admin/settings" class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 transition-all">
                    <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">System Config</span>
                    <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </aside>
    </div>
</div>

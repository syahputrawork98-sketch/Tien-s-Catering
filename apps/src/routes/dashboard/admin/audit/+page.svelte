<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { mockAuditLogs, type MockAuditLog, type MockAuditActor } from '$lib/mock/audit';

    type TabType = 'ALL' | MockAuditActor;

    let logs = $state<MockAuditLog[]>([...mockAuditLogs]);
    let activeTab = $state<TabType>('ALL');
    let searchQuery = $state('');

    const filteredLogs = $derived(() => {
        let result = activeTab === 'ALL' ? logs : logs.filter(l => l.actor === activeTab);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(l =>
                l.action.toLowerCase().includes(q) ||
                l.actorName.toLowerCase().includes(q) ||
                l.targetId.toLowerCase().includes(q) ||
                (l.note ?? '').toLowerCase().includes(q)
            );
        }
        return result;
    });

    const stats = $derived(() => ({
        total: logs.length,
        admin: logs.filter(l => l.actor === 'admin').length,
        cs: logs.filter(l => l.actor === 'cs').length,
        user: logs.filter(l => l.actor === 'user').length
    }));

    const actorColor = (actor: MockAuditActor) => ({
        admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        cs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        user: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
    }[actor]);

    const actorDotColor = (actor: MockAuditActor) => ({
        admin: 'bg-red-500',
        cs: 'bg-blue-500',
        user: 'bg-zinc-400'
    }[actor]);

    const targetTypeIcon = (t: string) => ({
        order: '🧾', menu: '🍱', package: '🎁', customer: '👤', user: '👥', settings: '⚙️'
    }[t] ?? '📋');

    const tabs: { id: TabType; label: string; count: () => number }[] = [
        { id: 'ALL', label: 'Semua', count: () => stats().total },
        { id: 'admin', label: 'Admin', count: () => stats().admin },
        { id: 'cs', label: 'CS', count: () => stats().cs },
        { id: 'user', label: 'User', count: () => stats().user }
    ];
</script>

<div class="space-y-10 pb-24">
    <header in:fly={{ y: -20, duration: 500 }}>
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Only</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Audit Log 🧭</h1>
        <p class="text-zinc-500 font-medium mt-2">Pantau riwayat perubahan penting yang dilakukan user, CS, dan admin.</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Aktivitas', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
            { label: 'Aktivitas Admin', value: stats().admin, color: 'text-red-600' },
            { label: 'Aktivitas CS', value: stats().cs, color: 'text-blue-600' },
            { label: 'Aktivitas User', value: stats().user, color: 'text-zinc-500' }
        ] as s}
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{s.label}</p>
                <p class="text-3xl font-black {s.color} italic">{s.value}</p>
            </div>
        {/each}
    </div>

    <!-- Filter & Tabs -->
    <div class="space-y-6" in:fade={{ delay: 200 }}>
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {#each tabs as tab}
                    <button onclick={() => activeTab = tab.id}
                        class="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
                        {activeTab === tab.id ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}">
                        {tab.label}
                        <span class="px-2 py-0.5 rounded-md text-[9px] {activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">{tab.count()}</span>
                    </button>
                {/each}
            </div>
            <div class="flex items-center gap-3 bg-white dark:bg-zinc-900 px-5 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" bind:value={searchQuery} placeholder="Cari aktivitas..." class="bg-transparent border-none focus:ring-0 text-sm font-medium w-48 placeholder:text-zinc-400" />
            </div>
        </div>

        <!-- Audit Log List -->
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            {#if filteredLogs().length > 0}
                <div class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each filteredLogs() as log (log.id)}
                        <div class="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors" in:fade>
                            <div class="flex items-start gap-5">
                                <!-- Actor dot -->
                                <div class="flex-shrink-0 mt-1">
                                    <div class="w-3 h-3 rounded-full {actorDotColor(log.actor)}"></div>
                                </div>

                                <div class="flex-1 space-y-2">
                                    <div class="flex flex-wrap items-center gap-3">
                                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase {actorColor(log.actor)}">{log.actor}</span>
                                        <span class="text-sm font-black text-brand-charcoal dark:text-white">{log.actorName}</span>
                                        <span class="text-[9px] font-bold text-zinc-400 uppercase">{log.createdAt}</span>
                                    </div>

                                    <p class="text-sm font-bold text-zinc-700 dark:text-zinc-300">{log.action}</p>

                                    <div class="flex items-center gap-3">
                                        <span class="text-base">{targetTypeIcon(log.targetType)}</span>
                                        <span class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-zinc-500 rounded-lg">{log.targetType}</span>
                                        <span class="text-[10px] font-mono text-zinc-400">{log.targetId}</span>
                                    </div>

                                    {#if log.note}
                                        <p class="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border-l-2 border-zinc-300 dark:border-zinc-600">{log.note}</p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-24 text-center">
                    <p class="text-4xl mb-4">🔍</p>
                    <p class="text-xl font-black text-zinc-300 dark:text-zinc-700">Tidak ada log ditemukan</p>
                    <p class="text-zinc-400 text-sm mt-2">Coba ubah filter atau kata kunci pencarian</p>
                </div>
            {/if}
        </div>
    </div>
</div>

<script lang="ts">
    import { mockAdminSettings } from '$lib/mock/admin';
    import { fade } from 'svelte/transition';

    let settings = $state([...mockAdminSettings]);

    function saveSettings() {
        alert("Konfigurasi sistem berhasil disimpan (Simulasi).");
    }

    const categories = ['business', 'notification', 'system'];
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Settings ⚙️</h1>
            <p class="text-zinc-500 font-medium mt-1">Konfigurasi parameter bisnis dan preferensi sistem.</p>
        </div>
        <button onclick={saveSettings} class="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all">
            Simpan Perubahan
        </button>
    </header>

    <div class="grid lg:grid-cols-3 gap-10">
        <aside class="lg:col-span-1">
            <nav class="sticky top-10 space-y-2">
                {#each categories as category}
                    <button class="w-full text-left px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all
                        {category === 'business' ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-brand-primary'}">
                        {category}
                    </button>
                {/each}
            </nav>
        </aside>

        <div class="lg:col-span-2 space-y-8">
            {#each categories as cat}
                <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
                        <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase italic">{cat} Configuration</h2>
                    </div>
                    <div class="p-10 space-y-8">
                        {#each settings.filter(s => s.category === cat) as setting}
                            <div class="flex flex-col gap-4">
                                <div>
                                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white">{setting.name}</h3>
                                    <p class="text-xs text-zinc-400 font-medium">{setting.description}</p>
                                </div>
                                <div class="relative group">
                                    <input 
                                        type="text" 
                                        bind:value={setting.value} 
                                        class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                                    />
                                    <button class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-brand-primary transition-colors">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    </div>
</div>

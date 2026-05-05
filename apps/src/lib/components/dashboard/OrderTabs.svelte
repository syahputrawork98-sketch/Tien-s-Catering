<script lang="ts">
    let { activeTab = $bindable('ACTIVE') } = $props<{ activeTab: 'ACTIVE' | 'HISTORY' }>();
</script>

<div class="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit mb-10 shadow-inner">
    <button 
        onclick={() => activeTab = 'ACTIVE'}
        class="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
        {activeTab === 'ACTIVE' ? 'bg-white dark:bg-zinc-700 text-brand-charcoal dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}"
    >
        Pesanan Sekarang
    </button>
    <button 
        onclick={() => activeTab = 'HISTORY'}
        class="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
        {activeTab === 'HISTORY' ? 'bg-white dark:bg-zinc-700 text-brand-charcoal dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}"
    >
        History Pesanan
    </button>
</div>

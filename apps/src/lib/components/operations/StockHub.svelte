<script lang="ts">
  import { enhance } from '$app/forms';
  import { fade, fly } from 'svelte/transition';
  
  let { data, form, basePath = '/cs' } = $props();
  let loadingId = $state(0);

  function formatPrice(val: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  }
</script>

<div class="space-y-8 px-6 py-8" in:fade>
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
      <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter">Inventory Control</h1>
      <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Kelola ketersediaan porsi menu untuk setiap tanggal layanan.</p>
    </div>
    
    <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-sm">
      <input 
        type="date" 
        value={data.selectedDate} 
        onchange={(e) => window.location.href = `?date=${e.currentTarget.value}`}
        class="bg-transparent border-none outline-none font-black text-brand-charcoal dark:text-white px-4 cursor-pointer"
      />
    </div>
  </div>

  {#if form?.message}
    <div 
      in:fly={{ y: -20 }}
      class="p-4 rounded-xl font-bold text-sm border {form.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}"
    >
      {form.message}
    </div>
  {/if}

  <!-- Stock Grid -->
  {#if data.schedules.length === 0}
    <div class="py-32 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-white/10">
      <h3 class="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Belum Ada Jadwal</h3>
      <p class="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Pilih tanggal lain atau jadwalkan menu baru.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each data.schedules as item}
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all group overflow-hidden relative">
          <div class="flex items-center gap-6 mb-8">
            <div class="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-2xl overflow-hidden shadow-inner border border-zinc-50 dark:border-white/5">
              <img src={item.menu.image} alt="" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded-md">{item.menu.category}</span>
              <h3 class="text-xl font-bold text-brand-charcoal dark:text-white leading-tight mt-1">{item.menu.name}</h3>
            </div>
          </div>

          <form 
            method="POST" 
            action="{basePath}/stock?/updateStock" 
            use:enhance={() => {
              loadingId = item.id;
              return async ({ update }) => {
                loadingId = 0;
                update();
              };
            }}
            class="space-y-4"
          >
            <input type="hidden" name="id" value={item.id} />
            <div class="relative">
                 <input 
                  type="number" 
                  name="stock" 
                  value={item.currentStock} 
                  required
                  class="w-full pl-6 pr-20 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl font-black text-brand-charcoal dark:text-white text-lg focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                />
                <button 
                  disabled={loadingId === item.id}
                  class="absolute right-2 top-2 bottom-2 px-6 bg-brand-charcoal dark:bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all disabled:opacity-50"
                >
                  {loadingId === item.id ? 'Wait' : 'Update'}
                </button>
            </div>
          </form>
        </div>
      {/each}
    </div>
  {/if}
</div>

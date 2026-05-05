<script lang="ts">
  import { enhance } from '$app/forms';
  import { fade, fly, slide } from 'svelte/transition';
  import { 
    Search, 
    ChevronLeft, 
    X, 
    Trash2, 
    Eye, 
    Info, 
    Calendar,
    ArrowRight
  } from 'lucide-svelte';

  interface Menu {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    basePrice: string;
    typeId: string | null;
    categoryId: string | null;
    createdAt: Date;
    type?: { name: string } | null;
    category?: { name: string } | null;
  }

  let { data, basePath = '/cs' } = $props<{ 
    data: { menus: Menu[], types: any[], categories: any[] },
    basePath?: string 
  }>();

  // State
  let searchQuery = $state('');
  let selectedType = $state<string | null>(null);
  let selectedMenu = $state<Menu | null>(null);

  let isDeleting = $state<string | null>(null);
  let isEditing = $state(false);
  let isCreating = $state(false);

  // Derived filtered menus
  let filteredMenus = $derived(
    data.menus.filter((m: Menu) => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType ? m.typeId === selectedType : true;
      return matchSearch && matchType;
    })
  );

  function formatPrice(val: string) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(val));
  }
</script>

<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 transition-colors duration-300">
  <!-- Header & Navigation -->
  <div class="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-white/5 px-8 py-8">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <a href={basePath} class="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-brand-primary transition-colors mb-2">
          <ChevronLeft size={14} /> Kembali ke Dashboard
        </a>
        <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tight">Master Menu Hub</h1>
        <p class="text-zinc-400 font-medium mt-1">Kelola dan telusuri seluruh aset hidangan Gourmet Hub.</p>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <div class="relative w-full sm:w-80 group">
          <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary transition-colors" size={20} />
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Cari masakan..." 
            class="w-full pl-14 pr-8 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
          />
        </div>
        
        <button 
          onclick={() => isCreating = true}
          class="w-full sm:w-auto px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight class="rotate-[-90deg]" size={16} /> Tambah Menu Baru
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button 
        onclick={() => selectedType = null}
        class="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap {selectedType === null ? 'bg-brand-charcoal dark:bg-brand-primary text-white shadow-xl' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200'}"
      >
        Semua
      </button>
      {#each data.types as type}
        <button 
          onclick={() => selectedType = type.id}
          class="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap {selectedType === type.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200'}"
        >
          {type.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Content Grid -->
  <main class="max-w-7xl mx-auto px-8 mt-12">
    {#if filteredMenus.length === 0}
      <div class="flex flex-col items-center justify-center py-40 text-center" in:fade>
        <div class="w-24 h-24 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-300 mb-6">
          <Search size={48} />
        </div>
        <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">Tidak Ada Menu Ditemukan</h3>
        <p class="text-zinc-400 font-medium mt-2">Coba sesuaikan pencarian atau filter Anda.</p>
        <button onclick={() => { searchQuery = ''; selectedType = null; }} class="mt-8 text-brand-primary font-black uppercase text-[10px] tracking-widest underline underline-offset-8">Reset Semua Filter</button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {#each filteredMenus as menu (menu.id)}
          <div 
            transition:fly={{ y: 20, duration: 400 }}
            class="group bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all relative"
          >
            <!-- Card Image -->
            <div class="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
              <img 
                src={menu.image || '/images/placeholder-menu.jpg'} 
                alt={menu.name} 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />

              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 gap-4">
                <button 
                  onclick={() => selectedMenu = menu}
                  class="w-full py-4 bg-white text-brand-charcoal rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Eye size={14} /> Detail Hidangan
                </button>
                <form 
                  method="POST" 
                  action="?/deleteMenu" 
                  use:enhance={() => {
                    return async ({ result, update }) => {
                      if (result.type === 'success') {
                        isDeleting = null;
                        await update();
                      }
                    };
                  }}
                  class="w-full"
                >
                  <input type="hidden" name="id" value={menu.id} />
                  {#if isDeleting === menu.id}
                    <div class="flex gap-2" in:slide>
                        <button type="submit" class="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">Yakin?</button>
                        <button type="button" onclick={() => isDeleting = null} class="px-4 py-4 bg-white/20 backdrop-blur-md text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all">Batal</button>
                    </div>
                  {:else}
                    <button 
                      type="button"
                      onclick={() => isDeleting = menu.id}
                      class="w-full py-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:border-red-500 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                    >
                      <Trash2 size={14} /> Hapus Menu
                    </button>
                  {/if}
                </form>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-8">
              <div class="flex gap-2 mb-4">
                <span class="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[9px] font-black uppercase tracking-wider">{menu.type?.name}</span>
                <span class="px-3 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-wider">{menu.category?.name}</span>
              </div>
              <h3 class="text-2xl font-black text-brand-charcoal dark:text-white leading-tight mb-2 uppercase tracking-tight">{menu.name}</h3>
              <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium line-clamp-2 mb-6">{menu.description || 'Tidak ada deskripsi.'}</p>
              
              <div class="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-white/5">
                <div>
                  <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Base Price</p>
                  <p class="text-xl font-black text-brand-charcoal dark:text-white italic">{formatPrice(menu.basePrice)}</p>
                </div>
                <div class="w-12 h-12 bg-zinc-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:bg-brand-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                   <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <!-- Create Modal -->
  {#if isCreating}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="fixed inset-0 bg-brand-charcoal/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 md:p-8" 
      onclick={() => isCreating = false}
      transition:fade
    >
      <div 
        class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden p-10 relative"
        onclick={(e) => e.stopPropagation()}
        transition:fly={{ y: 50, duration: 500 }}
      >
        <button 
          onclick={() => isCreating = false}
          class="absolute top-6 right-6 w-10 h-10 bg-zinc-100 dark:bg-white/10 hover:bg-brand-primary hover:text-white rounded-full flex items-center justify-center transition-all dark:text-white"
        >
          <X size={20} />
        </button>

        <h2 class="text-3xl font-black text-brand-charcoal dark:text-white mb-8 uppercase tracking-tighter border-l-4 border-brand-primary pl-4">Tambah Menu Baru</h2>
        
        <form 
          method="POST" 
          action="?/createMenu" 
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === 'success') {
                isCreating = false;
                await update();
              }
            };
          }}
          class="space-y-6"
        >
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label for="new_name" class="block text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">Nama Masakan</label>
              <input id="new_name" name="name" type="text" placeholder="Contoh: Nasi Goreng Spesial" class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" required />
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label for="new_type" class="block text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">Tipe Menu</label>
              <select id="new_type" name="typeId" class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" required>
                {#each data.types as type}
                  <option value={type.id}>{type.name}</option>
                {/each}
              </select>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label for="new_category" class="block text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">Kategori</label>
              <select id="new_category" name="categoryId" class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" required>
                {#each data.categories as cat}
                  <option value={cat.id}>{cat.name}</option>
                {/each}
              </select>
            </div>
            <div class="col-span-2">
              <label for="new_price" class="block text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">Harga Dasar (Rp)</label>
              <input id="new_price" name="basePrice" type="number" placeholder="25000" class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" required />
            </div>
          </div>
          <div>
            <label for="new_desc" class="block text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">Deskripsi Singkat</label>
            <textarea id="new_desc" name="description" rows="3" class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white resize-none" placeholder="Jelaskan keunikan masakan ini..."></textarea>
          </div>
          <div>
            <label for="new_image" class="block text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">URL Gambar (Opsional)</label>
            <input id="new_image" name="image" type="text" placeholder="https://..." class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" />
          </div>
          
          <button type="submit" class="w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">Simpan Menu Baru</button>
        </form>
      </div>
    </div>
  {/if}

  <!-- Gourmet Modal (Detail & Edit) -->
  {#if selectedMenu}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="fixed inset-0 bg-brand-charcoal/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8" 
      onclick={() => { if(!isEditing) selectedMenu = null }}
      role="button"
      tabindex="-1"
      transition:fade
    >
      <div 
        class="bg-white dark:bg-zinc-900 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
        onclick={(e) => e.stopPropagation()}
        transition:fly={{ y: 50, duration: 500 }}
      >
        <button 
          onclick={() => { selectedMenu = null; isEditing = false; }}
          class="absolute top-6 right-6 w-10 h-10 bg-zinc-100 dark:bg-white/10 hover:bg-brand-primary hover:text-white rounded-full flex items-center justify-center transition-all z-20 dark:text-white"
        >
          <X size={20} />
        </button>

        <div class="w-full md:w-5/12 h-64 md:h-auto relative bg-zinc-100 dark:bg-zinc-800">
          <img src={selectedMenu.image} alt={selectedMenu.name} class="w-full h-full object-cover" />
        </div>

        <div class="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto scrollbar-none flex flex-col">
          {#if !isEditing}
            <div in:fade={{ duration: 300 }}>
              <div class="flex gap-2 mb-6">
                <span class="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedMenu.type?.name}</span>
                <span class="px-4 py-2 bg-zinc-100 dark:bg-white/5 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedMenu.category?.name}</span>
              </div>
              <h2 class="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white mb-4 leading-tight uppercase tracking-tighter">{selectedMenu.name}</h2>
              <p class="text-2xl font-black text-brand-primary italic mb-8">{formatPrice(selectedMenu.basePrice)}</p>
              <div class="space-y-8">
                <div>
                  <h4 class="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase mb-3 tracking-widest"><Info size={14} /> Deskripsi Menu</h4>
                  <p class="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium text-lg">{selectedMenu.description || 'Belum ada deskripsi.'}</p>
                </div>
              </div>
              <div class="mt-12 flex gap-4">
                <button onclick={() => isEditing = true} class="flex-1 py-5 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Edit Menu</button>
              </div>
            </div>
          {:else}
            <form method="POST" action="?/updateMenu" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { isEditing = false; selectedMenu = null; await update(); } }; }} class="flex-1 flex flex-col" in:fade={{ duration: 300 }}>
              <input type="hidden" name="id" value={selectedMenu.id} />
              <h3 class="text-2xl font-black text-brand-charcoal dark:text-white mb-8 uppercase tracking-tight border-l-4 border-brand-primary pl-4">Edit Detail Hidangan</h3>
              <div class="space-y-6 flex-1">
                <input name="name" type="text" value={selectedMenu.name} class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" required />
                <input name="basePrice" type="number" value={selectedMenu.basePrice} class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" required />
                <textarea name="description" rows="3" class="w-full px-6 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white resize-none" placeholder="Deskripsi...">{selectedMenu.description || ''}</textarea>
              </div>
              <div class="mt-8 flex gap-4">
                <button type="submit" class="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Simpan</button>
                <button type="button" onclick={() => isEditing = false} class="px-8 py-5 bg-zinc-100 dark:bg-white/10 text-zinc-500 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Batal</button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.scrollbar-none::-webkit-scrollbar) { display: none; }
  :global(.scrollbar-none) { -ms-overflow-style: none; scrollbar-width: none; }
</style>

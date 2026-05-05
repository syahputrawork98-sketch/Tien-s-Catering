<script lang="ts">
  import { enhance } from '$app/forms';
  import { fade, fly } from 'svelte/transition';
  
  let { data, form, basePath = '/cs' } = $props();
  let formLoading = $state(false);
  let loadingId = $state("");

  const statusColors: any = {
    ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
    PENDING: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  };
</script>

<div class="space-y-10 px-6 py-8" in:fade>
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
      <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter">Manajemen Client</h1>
      <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Kelola data mitra instansi dan pendaftaran akun B2B baru.</p>
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

  <div class="grid lg:grid-cols-3 gap-10">
    <!-- Registration Form -->
    <div class="lg:col-span-1">
      <div class="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-white/5 p-8 shadow-sm">
        <h2 class="text-xl font-black text-brand-charcoal dark:text-white mb-6 uppercase tracking-tight">Daftarkan Instansi</h2>
        
        <form 
          method="POST" 
          action="{basePath}/clients?/createClient" 
          use:enhance={() => {
            formLoading = true;
            return async ({ update }) => {
              formLoading = false;
              update();
            };
          }}
          class="space-y-4"
        >
          <div>
            <label for="pic_name" class="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-2 tracking-widest">Nama PIC</label>
            <input id="pic_name" type="text" name="name" required class="w-full px-5 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl font-bold text-brand-charcoal dark:text-white outline-none focus:border-brand-primary transition-all" />
          </div>
          <div>
            <label for="phone_number" class="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-2 tracking-widest">No. Telepon</label>
            <input id="phone_number" type="text" name="phone" required class="w-full px-5 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl font-bold text-brand-charcoal dark:text-white outline-none focus:border-brand-primary transition-all" />
          </div>
          <div>
            <label for="instansi_name" class="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-2 tracking-widest">Nama Instansi</label>
            <input id="instansi_name" type="text" name="instansiName" required class="w-full px-5 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl font-bold text-brand-charcoal dark:text-white outline-none focus:border-brand-primary transition-all" />
          </div>
          <div>
            <label for="initial_password" class="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-2 tracking-widest">Password</label>
            <input id="initial_password" type="password" name="password" required class="w-full px-5 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl font-bold text-brand-charcoal dark:text-white outline-none focus:border-brand-primary transition-all" />
          </div>
          
          <button 
            disabled={formLoading}
            class="w-full py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-brand-primary transition-all mt-4"
          >
            {formLoading ? 'Wait...' : 'Daftarkan Client'}
          </button>
        </form>
      </div>
    </div>

    <!-- Client List -->
    <div class="lg:col-span-2 space-y-4">
      {#each data.clients as client}
        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/5 p-6 shadow-sm flex items-center justify-between group hover:border-brand-primary/20 transition-all">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center text-xl font-black">
              {client.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 class="font-black text-brand-charcoal dark:text-white leading-tight">{client.instansiName}</h4>
              <p class="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">PIC: {client.name} • {client.phone}</p>
            </div>
          </div>

          <form 
            method="POST" 
            action="{basePath}/clients?/toggleStatus" 
            use:enhance={() => {
              loadingId = client.id;
              return async ({ update }) => {
                loadingId = "";
                update();
              };
            }}
          >
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="status" value={client.status} />
            <button class="px-4 py-2 bg-zinc-50 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 hover:bg-brand-charcoal hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
              {loadingId === client.id ? 'Wait...' : (client.status === 'ACTIVE' ? 'Suspend' : 'Activate')}
            </button>
          </form>
        </div>
      {/each}
    </div>
  </div>
</div>

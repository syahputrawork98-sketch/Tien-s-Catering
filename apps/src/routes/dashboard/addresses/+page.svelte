<script lang="ts">
    import { mockUserAddresses } from '$lib/mock/user';
    import { fade, fly } from 'svelte/transition';

    let addresses = $state([...mockUserAddresses]);

    function setDefault(id: string) {
        addresses = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    }

    function removeAddress(id: string) {
        if (confirm("Hapus alamat ini?")) {
            addresses = addresses.filter(a => a.id !== id);
        }
    }
</script>

<div class="space-y-10">
    <header in:fly={{ y: -20, duration: 500 }}>
        <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span class="text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Simulasi Alamat Lokal</span>
            </div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Alamat Saya 📍</h1>
            <p class="text-zinc-500 font-medium mt-1">Daftar lokasi pengiriman favorit. Berjalan dalam mode simulasi lokal.</p>
        </div>
        <button 
            onclick={() => alert("Fitur Tambah Alamat (Simulation Mode)\n\nLengkapi profil alamat pengiriman di mode lokal ini. Data belum tersimpan permanen ke DB.")}
            class="bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
        >
            + Tambah Alamat
        </button>
    </header>

    <div class="grid md:grid-cols-2 gap-8">
        {#each addresses as addr (addr.id)}
            <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border {addr.isDefault ? 'border-brand-primary' : 'border-zinc-100 dark:border-zinc-800'} shadow-sm p-10 relative group transition-all">
                {#if addr.isDefault}
                    <span class="absolute top-8 right-10 px-3 py-1 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">Default</span>
                {/if}

                <div class="mb-8">
                    <h3 class="text-xl font-black text-brand-charcoal dark:text-white mb-2">{addr.label}</h3>
                    <div class="space-y-1">
                        <p class="text-sm font-bold text-zinc-600 dark:text-zinc-400">{addr.recipientName}</p>
                        <p class="text-xs text-brand-primary font-bold">{addr.whatsapp}</p>
                    </div>
                </div>

                <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-8">
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{addr.address}</p>
                </div>

                <div class="flex items-center gap-4">
                    <button class="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-brand-charcoal transition-colors">Edit</button>
                    {#if !addr.isDefault}
                        <button onclick={() => setDefault(addr.id)} class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline transition-all">Set Default</button>
                    {/if}
                    <button onclick={() => removeAddress(addr.id)} class="text-[10px] font-black text-red-400 uppercase tracking-widest ml-auto hover:text-red-600 transition-colors">Hapus</button>
                </div>
            </div>
        {/each}
    </div>
</div>

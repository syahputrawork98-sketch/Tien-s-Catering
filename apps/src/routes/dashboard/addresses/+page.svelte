<script lang="ts">
    import { mockUserAddresses } from '$lib/mock/user';
    import { fade, fly } from 'svelte/transition';
    import Modal from '$lib/components/ui/Modal.svelte';

    let addresses = $state([...mockUserAddresses]);
    let showModal = $state(false);
    let modalMode = $state<'add' | 'edit'>('add');
    let currentAddress = $state({
        id: '',
        label: '',
        recipientName: '',
        whatsapp: '',
        address: '',
        isDefault: false
    });

    let showSuccess = $state(false);

    function setDefault(id: string) {
        addresses = addresses.map(a => ({ ...a, isDefault: a.id === id }));
        triggerSuccess();
    }

    function removeAddress(id: string) {
        if (confirm("Hapus alamat ini dari simulasi lokal?")) {
            addresses = addresses.filter(a => a.id !== id);
            triggerSuccess();
        }
    }

    function openAddModal() {
        modalMode = 'add';
        currentAddress = {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            recipientName: '',
            whatsapp: '',
            address: '',
            isDefault: addresses.length === 0
        };
        showModal = true;
    }

    function openEditModal(addr: any) {
        modalMode = 'edit';
        currentAddress = { ...addr };
        showModal = true;
    }

    function handleSave() {
        if (modalMode === 'add') {
            addresses = [...addresses, { ...currentAddress }];
        } else {
            addresses = addresses.map(a => a.id === currentAddress.id ? { ...currentAddress } : a);
        }

        if (currentAddress.isDefault) {
            addresses = addresses.map(a => ({ ...a, isDefault: a.id === currentAddress.id }));
        }

        showModal = false;
        triggerSuccess();
    }

    function triggerSuccess() {
        showSuccess = true;
        setTimeout(() => showSuccess = false, 3000);
    }
</script>

<div class="space-y-10">
    <header in:fly={{ y: -20, duration: 500 }}>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span class="text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Local Simulation Mode</span>
                </div>
                <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter uppercase italic">Alamat <span class="text-brand-primary">Saya</span> 📍</h1>
                <p class="text-zinc-500 font-medium mt-1 italic">Mode demo: Alamat hanya tersimpan sementara di sesi ini.</p>
            </div>
            
            <div class="flex items-center gap-4">
                {#if showSuccess}
                    <div in:fade out:fade class="hidden md:flex bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl items-center gap-2">
                        ✓ Berhasil
                    </div>
                {/if}
                <button 
                    onclick={openAddModal}
                    class="bg-brand-charcoal text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-primary transition-all flex items-center gap-2 group"
                >
                    <span class="group-hover:rotate-90 transition-transform">+</span> Tambah Alamat
                </button>
            </div>
        </div>
    </header>

    {#if addresses.length === 0}
        <div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 p-20 text-center" in:fade>
            <div class="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 grayscale opacity-50">
                📍
            </div>
            <h3 class="text-xl font-black text-brand-charcoal dark:text-white uppercase italic tracking-tighter">Belum Ada Alamat</h3>
            <p class="text-zinc-500 font-medium mt-2 max-w-xs mx-auto">Anda belum menambahkan alamat pengiriman di simulasi lokal ini.</p>
            <button onclick={openAddModal} class="mt-8 text-brand-primary font-black text-xs uppercase tracking-[0.2em] hover:underline">
                Klik Untuk Menambahkan
            </button>
        </div>
    {:else}
        <div class="grid md:grid-cols-2 gap-8" in:fade>
            {#each addresses as addr (addr.id)}
                <div class="bg-white dark:bg-zinc-900 rounded-[3rem] border-2 {addr.isDefault ? 'border-brand-primary' : 'border-zinc-100 dark:border-zinc-800'} shadow-sm p-10 relative group transition-all hover:shadow-xl">
                    {#if addr.isDefault}
                        <div class="absolute top-8 right-10 flex flex-col items-end gap-2">
                            <span class="px-4 py-1.5 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-primary/20 italic">Alamat Utama</span>
                            <span class="text-[8px] font-black text-brand-primary uppercase tracking-widest italic opacity-60">Selected for orders</span>
                        </div>
                    {/if}

                    <div class="mb-10">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="text-lg">{addr.label.toLowerCase().includes('rumah') ? '🏠' : addr.label.toLowerCase().includes('kantor') ? '🏢' : '📍'}</span>
                            <h3 class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter uppercase">{addr.label}</h3>
                        </div>
                        <div class="space-y-1 pl-8 border-l-2 border-brand-primary/10">
                            <p class="text-sm font-black text-zinc-700 dark:text-zinc-300">{addr.recipientName}</p>
                            <p class="text-xs text-brand-primary font-black tracking-widest">{addr.whatsapp}</p>
                        </div>
                    </div>

                    <div class="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-10 group-hover:bg-zinc-100 transition-colors">
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed italic">{addr.address}</p>
                    </div>

                    <div class="flex items-center gap-6 pt-2">
                        <button 
                            onclick={() => openEditModal(addr)}
                            class="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-brand-charcoal dark:hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                        </button>
                        
                        {#if !addr.isDefault}
                            <button 
                                onclick={() => setDefault(addr.id)} 
                                class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline transition-all"
                            >
                                Set Sebagai Utama
                            </button>
                        {/if}

                        <button 
                            onclick={() => removeAddress(addr.id)} 
                            class="text-[10px] font-black text-red-400 uppercase tracking-widest ml-auto hover:text-red-600 transition-colors flex items-center gap-1.5"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Hapus
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 p-8">
        <div class="flex items-start gap-4">
            <span class="text-xl">ℹ️</span>
            <div>
                <p class="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">Data Source Info</p>
                <p class="text-xs font-bold text-blue-700/70 dark:text-blue-400/70 leading-relaxed italic">
                    Dataset alamat ini dikelola secara frontend-only untuk kebutuhan demo navigasi dan checkout. Penambahan atau perubahan alamat tidak akan tersimpan secara permanen jika halaman di-refresh sepenuhnya. Shipping engine backend saat ini masih dalam status <strong>Hold Production</strong>.
                </p>
            </div>
        </div>
    </div>
</div>

<!-- Add/Edit Modal -->
<Modal show={showModal} title={modalMode === 'add' ? 'Tambah Alamat Baru' : 'Edit Alamat'} onClose={() => showModal = false} maxWidth="max-w-lg">
    <div class="space-y-6">
        <div class="space-y-2">
            <label for="addr-label" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Label Alamat (Rumah, Kantor, dll)</label>
            <input id="addr-label" type="text" bind:value={currentAddress.label} placeholder="Contoh: Rumah Jakarta" class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm" />
        </div>

        <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label for="addr-name" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nama Penerima</label>
                <input id="addr-name" type="text" bind:value={currentAddress.recipientName} class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm" />
            </div>
            <div class="space-y-2">
                <label for="addr-phone" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">WhatsApp Penerima</label>
                <input id="addr-phone" type="tel" bind:value={currentAddress.whatsapp} class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm" />
            </div>
        </div>

        <div class="space-y-2">
            <label for="addr-full" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Alamat Lengkap</label>
            <textarea id="addr-full" bind:value={currentAddress.address} rows="4" class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm resize-none"></textarea>
        </div>

        <div class="flex items-center gap-3 px-1">
            <input type="checkbox" id="addr-default" bind:checked={currentAddress.isDefault} class="w-5 h-5 accent-brand-primary rounded" />
            <label for="addr-default" class="text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">Jadikan Alamat Utama</label>
        </div>

        <button 
            onclick={handleSave}
            class="w-full py-6 bg-brand-charcoal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-charcoal/20 hover:bg-brand-primary transition-all mt-4"
        >
            Simpan Alamat Simulasi
        </button>
    </div>
</Modal>

<style>
    /* Custom checkmark if needed */
</style>

<script lang="ts">
    import { onMount } from 'svelte';
    import { mockAdminSettings } from '$lib/mock/admin';
    import { fade, fly, scale } from 'svelte/transition';

    let settings = $state([...mockAdminSettings]);
    let paymentSettings = $state({
        bankName: '',
        accountNumber: '',
        accountOwner: '',
        qrisImage: ''
    });
    let isLoading = $state(true);
    let isSaving = $state(false);

    async function loadPaymentSettings() {
        try {
            const res = await fetch('/api/settings/payment');
            if (res.ok) {
                paymentSettings = await res.json();
            }
        } catch (err) {
            console.error('Failed to load payment settings', err);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadPaymentSettings();
    });

    async function saveSettings() {
        if (activeCategory === 'payment') {
            isSaving = true;
            try {
                const res = await fetch('/api/settings/payment', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentSettings)
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Pengaturan pembayaran berhasil disimpan.");
                } else {
                    alert("Gagal menyimpan: " + data.message);
                }
            } catch (err) {
                alert("Terjadi kesalahan koneksi.");
            } finally {
                isSaving = false;
            }
        } else {
            alert("Konfigurasi sistem berhasil disimpan (Simulasi).");
        }
    }

    const categories = ['business', 'payment', 'notification', 'system'];
    let activeCategory = $state('business');

    function handleFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            paymentSettings.qrisImage = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
</script>


<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div in:fly={{ y: -20, duration: 500 }}>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                <span class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic">Local Settings Simulation</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Settings ⚙️</h1>
            <p class="text-zinc-500 font-medium mt-1">Konfigurasi parameter bisnis dan preferensi sistem dalam lingkungan simulasi lokal.</p>
        </div>
        <button
            onclick={saveSettings}
            disabled={isSaving}
            class="bg-brand-charcoal dark:bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
        >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

    </header>

    <div class="grid lg:grid-cols-3 gap-10">
        <aside class="lg:col-span-1">
            <nav class="sticky top-10 space-y-2">
                {#each categories as category}
                    <button
                        onclick={() => activeCategory = category}
                        class="w-full text-left px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all
                        {activeCategory === category ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-lg' : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-brand-primary'}">
                        {category}
                    </button>
                {/each}

            </nav>
        </aside>

        <div class="lg:col-span-2 space-y-8">
            {#each categories as cat}
                {#if activeCategory === cat}
                <section in:fade={{ duration: 200 }} class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
                        <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase italic">{cat} Configuration</h2>
                    </div>
                    <div class="p-10 space-y-8">
                        {#if cat === 'payment'}
                            {#if isLoading}
                                <p class="text-zinc-400 font-bold animate-pulse text-xs uppercase tracking-widest">Memuat data...</p>
                            {:else}
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <!-- QRIS Section -->
                                    <div class="space-y-4 md:col-span-2">
                                        <h3 class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">QRIS Image</h3>
                                        <div class="flex flex-col md:flex-row items-center gap-8">
                                            <div class="w-48 h-48 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center group relative">
                                                {#if paymentSettings.qrisImage}
                                                    <img src={paymentSettings.qrisImage} alt="QRIS Preview" class="w-full h-full object-contain p-2" />
                                                    <button
                                                        onclick={() => paymentSettings.qrisImage = ''}
                                                        class="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-[10px] uppercase tracking-widest"
                                                    >
                                                        Hapus QRIS
                                                    </button>
                                                {:else}
                                                    <span class="text-[10px] font-black text-zinc-300 uppercase tracking-widest">No QRIS</span>
                                                {/if}
                                            </div>
                                            <div class="flex-1 space-y-4">
                                                <p class="text-xs text-zinc-500 font-medium leading-relaxed">
                                                    Upload gambar QRIS statis toko Anda. Pastikan gambar jelas agar mudah di-scan oleh customer.
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onchange={handleFileChange}
                                                    class="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 transition-all cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Bank Transfer Info -->
                                    <div class="space-y-4">
                                        <label for="bankName" class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Nama Bank</label>
                                        <input
                                            id="bankName"
                                            type="text"
                                            placeholder="Contoh: Bank BCA"
                                            bind:value={paymentSettings.bankName}
                                            class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                                        />
                                    </div>
                                    <div class="space-y-4">
                                        <label for="accOwner" class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Nama Pemilik Rekening</label>
                                        <input
                                            id="accOwner"
                                            type="text"
                                            placeholder="Contoh: Tien Syahputra"
                                            bind:value={paymentSettings.accountOwner}
                                            class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                                        />
                                    </div>
                                    <div class="space-y-4 md:col-span-2">
                                        <label for="accNumber" class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Nomor Rekening</label>
                                        <input
                                            id="accNumber"
                                            type="text"
                                            placeholder="Contoh: 1234567890"
                                            bind:value={paymentSettings.accountNumber}
                                            class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                                        />
                                    </div>
                                </div>
                            {/if}
                        {:else}
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
                                        <button aria-label="Edit Pengaturan" class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-brand-primary transition-colors">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </section>
                {/if}
            {/each}

        </div>
    </div>
</div>

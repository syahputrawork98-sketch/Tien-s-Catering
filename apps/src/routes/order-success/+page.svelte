<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import { browser } from '$app/environment';

    let order = $state<any>(null);

    onMount(() => {
        if (browser) {
            const saved = sessionStorage.getItem('lastOrder');
            if (saved) {
                order = JSON.parse(saved);
            }
        }
    });

    function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}
</script>

<svelte:head>
    <title>Pesanan Berhasil | Gourmet Hub</title>
</svelte:head>

<div class="min-h-screen bg-zinc-50 flex items-center justify-center p-6 dark:bg-zinc-950">
    <div class="max-w-md w-full text-center">
        <div class="mb-10 inline-flex items-center justify-center w-24 h-24 bg-green-500 text-white rounded-[2rem] shadow-2xl shadow-green-500/30" in:scale={{ duration: 600, start: 0.5 }}>
            <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
        </div>

        <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter mb-4" in:fly={{ y: 20, delay: 200 }}>Pesanan Diterima!</h1>
        <p class="text-zinc-500 font-medium mb-12" in:fly={{ y: 20, delay: 300 }}>
            Terima kasih telah memesan. Tim kami sedang menyiapkan hidangan terbaik untuk Anda.
        </p>

        {#if order}
            <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 shadow-xl mb-12 text-left" in:fly={{ y: 30, delay: 400 }}>
                <div class="flex justify-between items-center mb-6 pb-6 border-b border-zinc-50 dark:border-white/5">
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nomor Pesanan</span>
                    <span class="text-sm font-black text-brand-charcoal dark:text-white">#{order.id}</span>
                </div>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pemesan</span>
                    <span class="text-sm font-bold text-zinc-600 dark:text-zinc-300">{order.name}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Pembayaran</span>
                    <span class="text-xl font-black text-brand-primary italic">{formatPrice(order.total)}</span>
                </div>
            </div>
        {/if}

        <div class="space-y-4" in:fade={{ delay: 600 }}>
            <a href="/" class="block w-full py-5 bg-brand-charcoal text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all">Kembali Ke Beranda</a>
            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status pesanan akan diupdate via WhatsApp</p>
        </div>
    </div>
</div>

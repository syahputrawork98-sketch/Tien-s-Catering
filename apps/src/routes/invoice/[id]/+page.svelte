<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { getOrderSourceLabel } from '$lib/utils/reporting';
    import { mockBusinessProfile } from '$lib/mock/business';
    import { fade, fly } from 'svelte/transition';

    let orderId = $derived(page.params.id);
    let order = $state<any>(null);
    let loading = $state(true);
    let error = $state('');

    async function loadOrder() {
        if (!orderId) return;
        loading = true;
        error = '';
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(String(orderId))}`);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal memuat detail pesanan.');
            }
            const data = await response.json();
            order = data.order;
        } catch (e: any) {
            console.error(e);
            error = e.message || 'Terjadi kesalahan server.';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadOrder();
    });

    function formatRupiah(amount: number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    function generateInvoiceNumber(order: any) {
        if (!order) return '-';
        const date = new Date(order.orderDate || Date.now());
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const shortId = order.id.split('-')[0].toUpperCase();
        return `TC/INV/${dateStr}/${shortId}`;
    }

    function handlePrint() {
        window.print();
    }

    const invoiceDate = $derived(order ? new Date(order.orderDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '-');

    const paymentLabel = (status: string) => {
        const map: Record<string, string> = {
            unpaid: 'Belum Lunas',
            waiting_verification: 'Menunggu Verifikasi',
            paid: 'Lunas',
            cod_pending: 'COD (Pending)',
            rejected: 'Ditolak'
        };
        return map[status] || status.toUpperCase();
    };

    const paymentColor = (status: string) => {
        switch(status) {
            case 'paid': return 'text-emerald-600';
            case 'waiting_verification': return 'text-amber-600';
            case 'cod_pending': return 'text-sky-600';
            case 'rejected': return 'text-red-600';
            default: return 'text-zinc-500';
        }
    };
</script>

<svelte:head>
    <title>Invoice {order ? generateInvoiceNumber(order) : 'Loading...'} | Tien's Catering</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-4 md:p-12 print:p-0">
    <!-- Action Bar (Hidden when printing) -->
    <div class="flex items-center justify-between mb-8 print:hidden">
        <a href="/dashboard/orders" class="inline-flex items-center gap-2 text-zinc-500 hover:text-brand-charcoal font-black uppercase text-[10px] tracking-widest transition-colors">
            <span>⬅️</span> Kembali ke Dashboard
        </a>
        <button 
            onclick={handlePrint}
            class="px-8 py-3 bg-brand-charcoal dark:bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
            🖨️ Cetak Invoice
        </button>
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-32 space-y-4" in:fade>
            <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Menyiapkan Dokumen...</p>
        </div>
    {:else if error}
        <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-20 rounded-[3.5rem] text-center space-y-6" in:fade>
            <span class="text-5xl block">⚠️</span>
            <h3 class="text-2xl font-black text-red-700 dark:text-red-400 italic">Gagal Menampilkan Invoice</h3>
            <p class="text-zinc-500 font-medium">{error}</p>
        </div>
    {:else if order}
        <!-- Invoice Document -->
        <div 
            class="invoice-container bg-white dark:bg-zinc-900 print:bg-white print:text-black print:shadow-none shadow-2xl rounded-[3rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 print:border-none"
            in:fly={{ y: 20, duration: 600 }}
        >
            <!-- Header Section -->
            <div class="p-10 md:p-16 border-b border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row justify-between gap-10">
                <div class="space-y-6">
                    <div class="flex items-center gap-3">
                        <span class="text-5xl print:text-4xl">🍱</span>
                        <div class="flex flex-col">
                            <h1 class="text-3xl font-black italic tracking-tighter text-brand-charcoal dark:text-white print:text-black">Tien's Catering</h1>
                            <span class="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] -mt-1">Premium Katering & Snack</span>
                        </div>
                    </div>
                    <div class="text-sm font-medium text-zinc-500 space-y-1 print:text-zinc-600">
                        <p class="font-bold text-zinc-700 dark:text-zinc-300 print:text-black">{mockBusinessProfile.locationTitle}</p>
                        <p>{mockBusinessProfile.city}, {mockBusinessProfile.province}</p>
                        <p>WhatsApp: {mockBusinessProfile.whatsappDisplay}</p>
                        <p class="text-[10px] text-zinc-400 mt-2 italic">{mockBusinessProfile.serviceArea}</p>
                    </div>
                </div>

                <div class="text-right space-y-6">
                    <div class="space-y-1">
                        <h2 class="text-xs font-black uppercase tracking-widest text-zinc-400">Invoice Number</h2>
                        <p class="text-2xl font-black italic tracking-widest text-brand-charcoal dark:text-white print:text-black">
                            {generateInvoiceNumber(order)}
                        </p>
                    </div>
                    <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <h3 class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tanggal</h3>
                            <p class="text-xs font-bold text-zinc-700 dark:text-zinc-300 print:text-black">{invoiceDate}</p>
                        </div>
                        <div>
                            <h3 class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</h3>
                            <p class="text-xs font-black uppercase {paymentColor(order.paymentStatus)}">
                                {paymentLabel(order.paymentStatus)}
                            </p>
                        </div>
                        <div>
                            <h3 class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Source</h3>
                            <p class="text-xs font-black text-zinc-700 dark:text-zinc-300 print:text-black">
                                {getOrderSourceLabel(order.sourceType)}
                            </p>
                        </div>
                        <div>
                            <h3 class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Metode</h3>
                            <p class="text-xs font-black text-zinc-700 dark:text-zinc-300 print:text-black uppercase">
                                {order.paymentMethod || '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customer & Delivery -->
            <div class="p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-50/50 dark:bg-zinc-800/30 print:bg-zinc-50/30">
                <div class="space-y-4">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ditagihkan Kepada:</h3>
                    <div class="space-y-1">
                        <p class="text-xl font-black text-brand-charcoal dark:text-white print:text-black">{order.customerName}</p>
                        <p class="text-xs font-bold text-brand-primary">{order.whatsapp}</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Informasi Pengiriman:</h3>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Jadwal:</span>
                            <p class="text-xs font-bold text-zinc-700 dark:text-zinc-300 print:text-black">{order.deliveryDate}</p>
                        </div>
                        <p class="text-xs font-medium text-zinc-500 leading-relaxed print:text-zinc-600 bg-white/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 print:border-zinc-200">
                            {order.deliveryInfo?.addressSummary || 'Alamat tidak tersedia'}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="p-10 md:p-16">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-zinc-100 dark:border-zinc-800 print:border-zinc-200">
                            <th class="py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi Pesanan</th>
                            <th class="py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Jumlah</th>
                            <th class="py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Harga Satuan</th>
                            <th class="py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800 print:divide-zinc-100">
                        {#each order.items as item}
                            <tr>
                                <td class="py-8">
                                    <p class="text-sm font-black text-brand-charcoal dark:text-white print:text-black">{item.name}</p>
                                    {#if order.sourceType === 'package_request'}
                                        <span class="text-[8px] font-black uppercase text-indigo-500 tracking-tighter">🍱 Paket Katering</span>
                                    {/if}
                                </td>
                                <td class="py-8 text-center">
                                    <span class="text-sm font-bold text-zinc-500">{item.quantity}</span>
                                </td>
                                <td class="py-8 text-right">
                                    <span class="text-sm font-bold text-zinc-500">{formatRupiah(item.price)}</span>
                                </td>
                                <td class="py-8 text-right">
                                    <span class="text-sm font-black text-brand-charcoal dark:text-white print:text-black">{formatRupiah(item.subtotal)}</span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Totals Section -->
            <div class="p-10 md:p-16 bg-zinc-50/50 dark:bg-zinc-800/30 print:bg-zinc-50/30 border-t border-zinc-100 dark:border-zinc-800 print:border-zinc-200 flex justify-end">
                <div class="w-full md:w-80 space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subtotal</span>
                        <span class="text-sm font-bold text-zinc-700 dark:text-zinc-300 print:text-black">{formatRupiah(order.subtotal)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pajak (0%)</span>
                            <span class="text-[8px] font-medium text-zinc-400 italic">Pre-config</span>
                        </div>
                        <span class="text-sm font-bold text-zinc-700 dark:text-zinc-300 print:text-black">{formatRupiah(order.taxAmount)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ongkos Kirim</span>
                        <span class="text-sm font-bold text-zinc-700 dark:text-zinc-300 print:text-black">{formatRupiah(order.deliveryFee)}</span>
                    </div>
                    <div class="pt-4 border-t border-zinc-200 dark:border-zinc-700 print:border-zinc-300 flex justify-between items-center">
                        <span class="text-xs font-black uppercase tracking-widest text-brand-charcoal dark:text-white print:text-black">Total Akhir</span>
                        <span class="text-2xl font-black italic text-brand-primary tracking-tighter">{formatRupiah(order.total)}</span>
                    </div>
                </div>
            </div>

            <!-- Footer Section -->
            <div class="p-10 border-t border-zinc-50 dark:border-zinc-800 print:border-zinc-200 text-center space-y-4">
                <p class="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] italic">Terima kasih atas pesanan Anda</p>
                <div class="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 print:border-zinc-200 mx-auto max-w-lg">
                    <p class="text-[9px] font-medium text-zinc-400 leading-relaxed">
                        Dokumen ini adalah <span class="font-black text-zinc-500">Commercial Invoice Basic</span>. Bukti rincian pesanan yang sah untuk transaksi di Tien's Catering. 
                        Harap diperhatikan bahwa dokumen ini <span class="text-red-500 font-bold">bukan e-Faktur Pajak resmi</span> dan tidak menggantikan dokumen perpajakan legal.
                    </p>
                    <p class="text-[9px] font-medium text-zinc-400 leading-relaxed mt-3">
                        Status pembayaran mencerminkan data terakhir di sistem kami. Jika ada ketidaksesuaian, hubungi kami di {mockBusinessProfile.whatsappDisplay}.
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    @media print {
        :global(body) {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .max-w-4xl {
            max-width: 100% !important;
        }

        .invoice-container {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
        }
    }
</style>

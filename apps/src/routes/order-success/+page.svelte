<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';

	type LastOrderPayload = {
		id?: string;
		orderNumber?: string;
		name?: string;
		customerName?: string;
		paymentStatus?: string;
		status?: string;
		total?: number | string;
		[key: string]: unknown;
	};

	let order = $state<LastOrderPayload | null>(null);

	onMount(() => {
		if (!browser) return;

		const saved = sessionStorage.getItem('lastOrder');
		if (!saved) return;

		try {
			const parsed = JSON.parse(saved);
			if (parsed && typeof parsed === 'object') {
				order = parsed as LastOrderPayload;
			}
		} catch {
			order = null;
		}
	});

	function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

	function getSafeString(value: unknown, fallback = '-') {
		if (typeof value !== 'string') return fallback;
		const normalized = value.trim();
		return normalized.length > 0 ? normalized : fallback;
	}

	function getOrderReference(orderData: LastOrderPayload | null) {
		if (!orderData) return '-';
		return getSafeString(orderData.orderNumber, getSafeString(orderData.id));
	}

	function getCustomerLabel(orderData: LastOrderPayload | null) {
		if (!orderData) return '-';
		return getSafeString(orderData.customerName, getSafeString(orderData.name));
	}

	function getStatusLabel(value: unknown) {
		const rawStatus = getSafeString(value);
		if (rawStatus === '-') return rawStatus;
		return rawStatus.replaceAll('_', ' ').replaceAll('-', ' ').toUpperCase();
	}

	function getTotalAmount(orderData: LastOrderPayload | null) {
		if (!orderData) return 0;
		const parsed = Number(orderData.total);
		if (!Number.isFinite(parsed) || parsed < 0) return 0;
		return parsed;
	}
</script>

<svelte:head>
	<title>Pesanan Berhasil | Tien's Catering</title>
</svelte:head>

<div class="min-h-screen bg-zinc-50 flex items-center justify-center p-6 dark:bg-zinc-950">
	<div class="max-w-md w-full text-center">
		<div
			class="mb-10 inline-flex items-center justify-center w-24 h-24 bg-green-500 text-white rounded-[2rem] shadow-2xl shadow-green-500/30"
			in:scale={{ duration: 600, start: 0.5 }}
		>
			<svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
			</svg>
		</div>

		<h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter mb-4" in:fly={{ y: 20, delay: 200 }}>
			Pesanan Diterima!
		</h1>
		<p class="text-zinc-500 font-medium mb-12" in:fly={{ y: 20, delay: 300 }}>
			Terima kasih telah memesan. Tim kami sedang menyiapkan hidangan terbaik untuk Anda.
		</p>

		{#if order}
			<div
				class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 shadow-xl mb-12 text-left"
				in:fly={{ y: 30, delay: 400 }}
			>
				<div class="flex justify-between items-center mb-6 pb-6 border-b border-zinc-50 dark:border-white/5">
					<span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nomor Pesanan</span>
					<span class="text-sm font-black text-brand-charcoal dark:text-white">{getOrderReference(order)}</span>
				</div>

				<div class="flex justify-between items-center mb-4">
					<span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pemesan</span>
					<span class="text-sm font-bold text-zinc-600 dark:text-zinc-300">{getCustomerLabel(order)}</span>
				</div>

				<div class="flex justify-between items-center mb-4">
					<span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Pesanan</span>
					<span class="text-xs font-black text-zinc-700 dark:text-zinc-300">{getStatusLabel(order.status)}</span>
				</div>

				<div class="flex justify-between items-center mb-4">
					<span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Pembayaran</span>
					<span class="text-xs font-black text-zinc-700 dark:text-zinc-300">{getStatusLabel(order.paymentStatus)}</span>
				</div>

				<div class="flex justify-between items-center">
					<span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Pembayaran</span>
					<span class="text-xl font-black text-brand-primary italic">{formatPrice(getTotalAmount(order))}</span>
				</div>
			</div>
		{:else}
			<div
				class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 shadow-xl mb-12 text-left"
				in:fly={{ y: 30, delay: 400 }}
			>
				<p class="text-sm font-semibold text-zinc-500 dark:text-zinc-300">
					Data pesanan terakhir tidak ditemukan di sesi ini.
				</p>
			</div>
		{/if}

		<div class="space-y-4" in:fade={{ delay: 600 }}>
			<a
				href="/dashboard/orders"
				class="block w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
				>Pantau Di Dashboard Saya</a
			>
			<a
				href="/"
				class="block w-full py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
				>Kembali Ke Beranda</a
			>
			<div class="pt-4 flex flex-col items-center gap-3">
				<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
					Status pesanan akan diupdate via WhatsApp
				</p>
				<div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
					<span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
					<span class="text-[8px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Local Demo Flow Aktif</span>
				</div>
			</div>
		</div>
	</div>
</div>

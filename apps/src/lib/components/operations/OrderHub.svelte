<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
    import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';

	let { data, basePath = '/cs' } = $props();

	let searchQuery = $state('');
	let selectedStatus = $state('ALL');

	const todayStr = new Date().toISOString().split('T')[0];

	function formatPrice(val: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(val);
	}

	function formatDate(dateStr: string) {
		const d = new Date(dateStr);
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	let filteredOrders = $derived(
		(data.orders || []).filter((order: any) => {
			const matchesSearch = 
				order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
				order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
			return matchesSearch && matchesStatus;
		})
	);

	let stats = $derived({
		total: data.orders.length,
		pending: data.orders.filter((o: any) => o.status === 'PENDING').length,
		paid: data.orders.filter((o: any) => o.status === 'PAID').length,
		shipped: data.orders.filter((o: any) => o.status === 'SHIPPED').length,
		completed: data.orders.filter((o: any) => o.status === 'COMPLETED').length,
		cancelled: data.orders.filter((o: any) => o.status === 'CANCELLED').length,
		today: data.orders.filter((o: any) => o.deliveryDate === todayStr).length
	});

	let updatingId = $state<string | null>(null);
</script>

<div class="px-6 py-8 h-full overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/30">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
		<div>
			<h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tight">Order Monitor</h1>
			<p class="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Pantau dan kelola status pesanan katering secara real-time.</p>
		</div>

		<div class="flex items-center gap-4">
			<div class="relative w-full md:w-80 group">
				<input 
					type="text" 
					bind:value={searchQuery}
					placeholder="Cari ID atau Nama Pelanggan..."
					class="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[1.25rem] text-sm dark:text-white focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all shadow-sm font-medium"
				/>
				<svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
		<div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm">
			<p class="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Pesanan</p>
			<h3 class="text-3xl font-black text-brand-charcoal dark:text-white">{stats.total}</h3>
		</div>
		<div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm">
			<p class="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Butuh Verifikasi</p>
			<h3 class="text-3xl font-black text-brand-primary">{stats.pending}</h3>
		</div>
		<div class="bg-brand-charcoal p-6 rounded-3xl shadow-xl shadow-brand-charcoal/20 text-white relative overflow-hidden">
			<div class="relative z-10">
				<p class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Pengiriman Hari Ini</p>
				<h3 class="text-3xl font-black">{stats.today}</h3>
			</div>
			<svg class="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M11 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h8l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2h-1" />
			</svg>
		</div>
	</div>

	<!-- Order Tabs -->
	<div class="flex items-center gap-2 mb-8 overflow-x-auto pb-4 scrollbar-none">
		<button onclick={() => selectedStatus = 'ALL'} class="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 {selectedStatus === 'ALL' ? 'bg-brand-charcoal text-white shadow-xl shadow-brand-charcoal/20' : 'bg-white dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-white border border-zinc-100 dark:border-white/5'}">
			Semua Pesanan <span class="px-2 py-0.5 rounded-lg text-[9px] {selectedStatus === 'ALL' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}">{stats.total}</span>
		</button>
		
		<button onclick={() => selectedStatus = 'PENDING'} class="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 {selectedStatus === 'PENDING' ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-white dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-white border border-zinc-100 dark:border-white/5'}">
			Pesanan Masuk <span class="px-2 py-0.5 rounded-lg text-[9px] {selectedStatus === 'PENDING' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}">{stats.pending}</span>
		</button>

		<button onclick={() => selectedStatus = 'PAID'} class="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 {selectedStatus === 'PAID' ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'bg-white dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-white border border-zinc-100 dark:border-white/5'}">
			Sudah Bayar <span class="px-2 py-0.5 rounded-lg text-[9px] {selectedStatus === 'PAID' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}">{stats.paid}</span>
		</button>
	</div>

	<!-- Order Table -->
	<div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
						<th class="px-6 py-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">ID & Pelanggan</th>
						<th class="px-6 py-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Tanggal Kirim</th>
						<th class="px-6 py-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Total</th>
						<th class="px-6 py-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter text-right">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-zinc-50 dark:divide-white/5">
					{#each filteredOrders as order (order.id)}
						<tr class="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors {order.deliveryDate === todayStr ? 'bg-brand-primary/5' : ''}">
							<td class="px-6 py-5">
								<div class="flex flex-col">
									<span class="text-xs font-mono text-zinc-400 dark:text-zinc-500">#{order.id.slice(0, 8)}</span>
									<span class="text-sm font-bold text-brand-charcoal dark:text-white">{order.user?.name}</span>
								</div>
							</td>
							<td class="px-6 py-5">
								<span class="text-xs {order.deliveryDate === todayStr ? 'text-brand-primary font-black' : 'text-zinc-500 dark:text-zinc-400'}">
									{order.deliveryDate === todayStr ? 'HARI INI' : formatDate(order.deliveryDate)}
								</span>
							</td>
							<td class="px-6 py-5 font-bold text-sm text-brand-charcoal dark:text-white">
								{formatPrice(parseFloat(order.grandTotal))}
							</td>
							<td class="px-6 py-5 text-right">
								<form method="POST" action="{basePath}/orders?/updateStatus" use:enhance={() => { updatingId = order.id; return async () => { updatingId = null; }; }}>
									<input type="hidden" name="orderId" value={order.id} />
									<select name="status" value={order.status} onchange={(e) => e.currentTarget.form?.requestSubmit()} class="bg-zinc-100 dark:bg-white/10 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer dark:text-white">
										<option value="PENDING">Pending</option>
										<option value="PAID">Paid</option>
										<option value="SHIPPED">Shipped</option>
										<option value="COMPLETED">Completed</option>
										<option value="CANCELLED">Cancelled</option>
									</select>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

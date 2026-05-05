<script lang="ts">
    import { mockCsCustomers, type MockCsCustomer } from '$lib/mock/cs';
    import { fade } from 'svelte/transition';

    const stats = {
        total: mockCsCustomers.length,
        personal: mockCsCustomers.filter(c => c.type === 'personal').length,
        company: mockCsCustomers.filter(c => c.type === 'company').length,
        institution: mockCsCustomers.filter(c => c.type === 'institution').length
    };
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Data Customer 👥</h1>
            <p class="text-zinc-500 font-medium mt-1">Kelola direktori pelanggan dan instansi mitra.</p>
        </div>
        <button class="bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Daftarkan Akun Baru</button>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Customer</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Personal</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{stats.personal}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Company</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{stats.company}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Institution</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{stats.institution}</p>
        </div>
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama & Tipe</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alamat</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Order</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Order</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each mockCsCustomers as customer (customer.id)}
                        <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                            <td class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-black text-brand-charcoal dark:text-white">{customer.name}</span>
                                    <span class="text-[9px] font-black px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 w-fit mt-1 uppercase tracking-widest">{customer.type}</span>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <a href="https://wa.me/{customer.whatsapp}" class="text-xs font-bold text-brand-primary hover:underline">{customer.whatsapp}</a>
                            </td>
                            <td class="px-8 py-6">
                                <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] block">{customer.address}</span>
                            </td>
                            <td class="px-8 py-6">
                                <span class="text-sm font-black text-brand-charcoal dark:text-white italic">{customer.totalOrders} <small class="not-italic text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Orders</small></span>
                            </td>
                            <td class="px-8 py-6">
                                <span class="text-xs font-bold text-zinc-500 dark:text-zinc-400">{customer.lastOrderDate}</span>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button class="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:text-brand-primary transition-all shadow-sm">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

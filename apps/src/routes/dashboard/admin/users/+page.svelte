<script lang="ts">
    import { mockAdminUsers } from '$lib/mock/admin';
    import { fade } from 'svelte/transition';

    let users = $state([...mockAdminUsers]);

    const stats = $derived({
        total: users.length,
        admin: users.filter(u => u.role === 'ADMIN').length,
        cs: users.filter(u => u.role === 'CUSTOMER_SERVICE').length,
        customer: users.filter(u => u.role === 'USER').length,
        pending: users.filter(u => u.status === 'pending').length
    });

    function toggleStatus(id: string) {
        users = users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u);
    }
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Manajemen User 👤</h1>
            <p class="text-zinc-500 font-medium mt-1">Kelola akun karyawan dan hak akses pelanggan.</p>
        </div>
        <button class="bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            + Tambah User
        </button>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
            <p class="text-xl font-black text-brand-charcoal dark:text-white">{stats.total}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Admin</p>
            <p class="text-xl font-black text-indigo-600">{stats.admin}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">CS</p>
            <p class="text-xl font-black text-blue-600">{stats.cs}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Customer</p>
            <p class="text-xl font-black text-emerald-600">{stats.customer}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Pending</p>
            <p class="text-xl font-black text-orange-600">{stats.pending}</p>
        </div>
    </div>

    <!-- Users List Table -->
    <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User Details</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Login</th>
                        <th class="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each users as user (user.id)}
                        <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                            <td class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-black text-brand-charcoal dark:text-white">{user.name}</span>
                                    <span class="text-xs font-medium text-zinc-400">{user.email}</span>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                    {user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 
                                     user.role === 'CUSTOMER_SERVICE' ? 'bg-blue-100 text-blue-600' : 
                                     'bg-zinc-100 text-zinc-500'}">
                                    {user.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                    {user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                                     user.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                     'bg-red-100 text-red-600'}">
                                    {user.status}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <span class="text-xs font-bold text-zinc-400 italic">{user.lastLogin}</span>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button 
                                        onclick={() => toggleStatus(user.id)}
                                        class="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                                        title="Nonaktifkan/Aktifkan User"
                                    >
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </button>
                                    <button class="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400 hover:text-brand-primary transition-all">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>
</div>

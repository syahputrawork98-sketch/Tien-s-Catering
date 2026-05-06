<script lang="ts">
    import { mockAccounts, type MockAccount } from '$lib/mock/accounts';
    import { fade, fly } from 'svelte/transition';

    // State
    let users = $state([...mockAccounts]);
    let searchQuery = $state('');
    let activeTab = $state<'all' | 'admin' | 'cs' | 'customer' | 'pending' | 'inactive'>('all');

    // Counts derived from raw data
    const counts = $derived({
        all: mockAccounts.length,
        admin: mockAccounts.filter(u => u.role === 'ADMIN').length,
        cs: mockAccounts.filter(u => u.role === 'CUSTOMER_SERVICE').length,
        customer: mockAccounts.filter(u => u.role === 'USER').length,
        pending: mockAccounts.filter(u => u.status === 'pending').length,
        inactive: mockAccounts.filter(u => u.status === 'inactive' || u.status === 'rejected').length
    });

    // Filtered users
    let filteredUsers = $derived(
        users.filter(u => {
            // Tab filtering
            const matchesTab = 
                activeTab === 'all' ? true :
                activeTab === 'admin' ? u.role === 'ADMIN' :
                activeTab === 'cs' ? u.role === 'CUSTOMER_SERVICE' :
                activeTab === 'customer' ? u.role === 'USER' :
                activeTab === 'pending' ? u.status === 'pending' :
                activeTab === 'inactive' ? (u.status === 'inactive' || u.status === 'rejected') : true;

            if (!matchesTab) return false;

            // Search filtering
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                u.name.toLowerCase().includes(q) ||
                (u.email?.toLowerCase().includes(q)) ||
                (u.whatsapp?.includes(q)) ||
                u.role.toLowerCase().includes(q) ||
                u.status.toLowerCase().includes(q) ||
                u.id.toLowerCase().includes(q)
            );
        })
    );

    function toggleStatus(id: string) {
        users = users.map(u => {
            if (u.id === id) {
                const nextStatus = u.status === 'active' || u.status === 'approved' ? 'inactive' : 'active';
                return { ...u, status: nextStatus as any };
            }
            return u;
        });
    }

    function resetFilters() {
        searchQuery = '';
        activeTab = 'all';
    }
</script>

<div class="space-y-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter">Users & Role 👤</h1>
            <p class="text-zinc-500 font-medium mt-1">Kelola akun admin, CS, dan customer Tien’s Catering.</p>
        </div>
        <button class="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all">
            + Tambah Akun
        </button>
    </header>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Akun</p>
            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic">{counts.all}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Administrator</p>
            <p class="text-2xl font-black text-indigo-600 italic">{counts.admin}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Tim CS</p>
            <p class="text-2xl font-black text-blue-600 italic">{counts.cs}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Customer</p>
            <p class="text-2xl font-black text-emerald-600 italic">{counts.customer}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Pending/Inactive</p>
            <p class="text-2xl font-black text-orange-600 italic">{counts.pending + counts.inactive}</p>
        </div>
    </div>

    <!-- Search & Tabs -->
    <div class="space-y-6">
        <!-- Search Bar -->
        <div class="relative group max-w-2xl">
            <span class="absolute inset-y-0 left-6 flex items-center text-zinc-400 group-focus-within:text-brand-primary transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Cari nama, email, WhatsApp, role, atau status..."
                class="w-full pl-16 pr-8 py-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-brand-charcoal dark:text-white transition-all shadow-sm"
            />
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {#each [
                { id: 'all', label: 'Semua', count: counts.all },
                { id: 'admin', label: 'Admin', count: counts.admin },
                { id: 'cs', label: 'CS', count: counts.cs },
                { id: 'customer', label: 'Customer/User', count: counts.customer },
                { id: 'pending', label: 'Pending', count: counts.pending },
                { id: 'inactive', label: 'Inactive', count: counts.inactive }
            ] as tab}
                <button 
                    onclick={() => activeTab = tab.id as any}
                    class="flex items-center gap-3 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shrink-0
                        {activeTab === tab.id 
                            ? 'bg-brand-charcoal text-white shadow-xl shadow-brand-charcoal/20 scale-105' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary/30 hover:text-brand-charcoal dark:hover:text-white'}"
                >
                    {tab.label}
                    <span class="px-2 py-0.5 rounded-full text-[8px] {activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                        {tab.count}
                    </span>
                </button>
            {/each}
        </div>
    </div>

    <!-- Users List Table -->
    <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User Details</th>
                        <th class="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</th>
                        <th class="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                        <th class="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Aktivitas Terakhir</th>
                        <th class="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each filteredUsers as user (user.id)}
                        <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all group" in:fade>
                            <td class="px-8 py-6">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-sm font-black text-brand-charcoal dark:text-white">{user.name}</span>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <span class="text-[10px] font-medium text-zinc-400">{user.email || 'No Email'}</span>
                                            {#if user.whatsapp}
                                                <span class="w-1 h-1 rounded-full bg-zinc-200"></span>
                                                <span class="text-[10px] font-medium text-zinc-400">{user.whatsapp}</span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                    {user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 
                                     user.role === 'CUSTOMER_SERVICE' ? 'bg-blue-100 text-blue-600' : 
                                     'bg-emerald-100 text-emerald-600'}">
                                    {user.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                    {user.status === 'active' || user.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                                     user.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                     'bg-red-100 text-red-600'}">
                                    {user.status === 'approved' ? 'Aktif' : user.status === 'inactive' ? 'Nonaktif' : user.status}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-tighter italic">{user.lastLogin || '-'}</span>
                                    <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Last Seen</span>
                                </div>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onclick={() => toggleStatus(user.id)}
                                        class="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-brand-primary transition-all border border-transparent hover:border-brand-primary/20"
                                        title="Ubah Status"
                                    >
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </button>
                                    <button class="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-brand-primary transition-all border border-transparent hover:border-brand-primary/20">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" class="px-8 py-20 text-center">
                                <div class="max-w-xs mx-auto space-y-4">
                                    <div class="text-4xl">🔍</div>
                                    <h3 class="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">Tidak ada user ditemukan</h3>
                                    <p class="text-zinc-500 text-sm font-medium">Coba ubah kata kunci pencarian atau ganti filter kategori.</p>
                                    <button 
                                        onclick={resetFilters}
                                        class="text-brand-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                                    >
                                        Reset Semua Filter
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

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

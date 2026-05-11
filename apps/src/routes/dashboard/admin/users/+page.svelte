<script lang="ts">
    import { mockAdminUsers, type MockAdminUser } from '$lib/mock/admin';
    import { fade, fly } from 'svelte/transition';

    // State
    let users = $state([...mockAdminUsers]);
    let searchQuery = $state('');
    
    type PrimaryUserTab = 'all' | 'admin' | 'cs' | 'customer' | 'pending' | 'inactive';
    let activePrimaryTab = $state<PrimaryUserTab>('all');

    type CustomerSubTab = 'all_customers' | 'personal' | 'company' | 'institution' | 'pending_customers' | 'rejected_customers';
    let activeCustomerSubTab = $state<CustomerSubTab>('all_customers');

    // Counts derived from local state
    const counts = $derived({
        primary: {
            all: users.length,
            admin: users.filter(u => u.role === 'ADMIN').length,
            cs: users.filter(u => u.role === 'CUSTOMER_SERVICE').length,
            customer: users.filter(u => u.role === 'USER').length,
            pending: users.filter(u => u.status === 'pending').length,
            inactive: users.filter(u => u.status === 'inactive').length
        },
        secondary: {
            all: users.filter(u => u.role === 'USER').length,
            personal: users.filter(u => u.role === 'USER' && (u.accountType === 'personal' || (!u.accountType && u.requestedType === 'personal'))).length,
            company: users.filter(u => u.role === 'USER' && (u.accountType === 'company' || (!u.accountType && u.requestedType === 'company'))).length,
            institution: users.filter(u => u.role === 'USER' && (u.accountType === 'institution' || (!u.accountType && u.requestedType === 'institution'))).length,
            pending: users.filter(u => u.role === 'USER' && (u.registrationStatus === 'pending' || u.status === 'pending')).length,
            rejected: users.filter(u => u.role === 'USER' && (u.registrationStatus === 'rejected' || u.status === 'rejected')).length
        }
    });

    // Filtered users
    let filteredUsers = $derived(
        users.filter(u => {
            // 1. Primary Tab Filter
            const matchesPrimary = 
                activePrimaryTab === 'all' ? true :
                activePrimaryTab === 'admin' ? u.role === 'ADMIN' :
                activePrimaryTab === 'cs' ? u.role === 'CUSTOMER_SERVICE' :
                activePrimaryTab === 'customer' ? u.role === 'USER' :
                activePrimaryTab === 'pending' ? u.status === 'pending' :
                activePrimaryTab === 'inactive' ? u.status === 'inactive' : true;

            if (!matchesPrimary) return false;

            // 2. Secondary Tab Filter (Only if primary is customer)
            if (activePrimaryTab === 'customer') {
                const matchesSecondary = 
                    activeCustomerSubTab === 'all_customers' ? true :
                    activeCustomerSubTab === 'personal' ? (u.accountType === 'personal' || (!u.accountType && u.requestedType === 'personal')) :
                    activeCustomerSubTab === 'company' ? (u.accountType === 'company' || (!u.accountType && u.requestedType === 'company')) :
                    activeCustomerSubTab === 'institution' ? (u.accountType === 'institution' || (!u.accountType && u.requestedType === 'institution')) :
                    activeCustomerSubTab === 'pending_customers' ? (u.registrationStatus === 'pending' || u.status === 'pending') :
                    activeCustomerSubTab === 'rejected_customers' ? (u.registrationStatus === 'rejected' || u.status === 'rejected') : true;
                
                if (!matchesSecondary) return false;
            }

            // 3. Search Filter
            if (!searchQuery) return true;
            const q = searchQuery.trim().toLowerCase();
            const accountTypeStr = (u.accountType || u.requestedType || '').toLowerCase();
            
            return (
                u.name.toLowerCase().includes(q) ||
                (u.email?.toLowerCase().includes(q)) ||
                (u.whatsapp?.includes(q)) ||
                u.role.toLowerCase().includes(q) ||
                u.status.toLowerCase().includes(q) ||
                u.id.toLowerCase().includes(q) ||
                accountTypeStr.includes(q)
            );
        })
    );

    function toggleStatus(id: string) {
        // Local simulation only
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
        activePrimaryTab = 'all';
        activeCustomerSubTab = 'all_customers';
    }

    // Effect to reset sub-tab when switching to non-customer tab
    $effect(() => {
        if (activePrimaryTab !== 'customer') {
            activeCustomerSubTab = 'all_customers';
        }
    });

    const searchPlaceholder = $derived(
        activePrimaryTab === 'customer' 
            ? "Cari customer berdasarkan nama, email, WhatsApp, tipe akun..." 
            : "Cari nama, email, WhatsApp, role, atau status..."
    );
</script>

<div class="space-y-10 pb-20">
    <header in:fly={{ y: -20, duration: 500 }} class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span class="text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Local Admin Simulation Phase 2</span>
            </div>
            <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Manajemen <span class="text-brand-primary">User</span> 👥</h1>
            <p class="text-zinc-500 font-medium mt-1 italic">Pantau akses admin, CS, dan akun customer dalam lingkungan simulasi lokal.</p>
        </div>
        <div class="flex gap-3">
            <button 
                disabled
                aria-label="Tambah akun baru (Hold Production)"
                title="Fitur tambah akun backend masih Hold"
                class="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-70 flex items-center gap-2"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Tambah Akun (Hold)
            </button>
        </div>
    </header>

    <div class="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-[2rem]">
        <p class="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            RBAC & Super Admin Governance
        </p>
        <p class="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/80 mt-1 italic leading-relaxed">
            Sistem Role-Based Access Control (RBAC) produksi dan hak akses Super Admin final tetap berada dalam status <strong>Hold Production</strong>. Daftar di bawah adalah representasi data simulasi untuk kebutuhan demonstrasi alur manajemen pengguna lokal.
        </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Akun (Sim)</p>
            <p class="text-3xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">{counts.primary.all}</p>
            <span class="absolute top-4 right-6 text-[7px] font-black text-blue-400 uppercase italic opacity-40">Local Data</span>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
            <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Admin (Sim)</p>
            <p class="text-3xl font-black text-indigo-600 italic tracking-tighter">{counts.primary.admin}</p>
            <span class="absolute top-4 right-6 text-[7px] font-black text-indigo-400 uppercase italic opacity-40">Role</span>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">CS Team (Sim)</p>
            <p class="text-3xl font-black text-blue-600 italic tracking-tighter">{counts.primary.cs}</p>
            <span class="absolute top-4 right-6 text-[7px] font-black text-blue-400 uppercase italic opacity-40">Role</span>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Customer (Sim)</p>
            <p class="text-3xl font-black text-emerald-600 italic tracking-tighter">{counts.primary.customer}</p>
            <span class="absolute top-4 right-6 text-[7px] font-black text-emerald-400 uppercase italic opacity-40">Role</span>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Issues (Sim)</p>
            <p class="text-3xl font-black text-orange-600 italic tracking-tighter">{counts.primary.pending + counts.primary.inactive}</p>
            <span class="absolute top-4 right-6 text-[7px] font-black text-orange-400 uppercase italic opacity-40">Status</span>
        </div>
    </div>

    <!-- Search & Tabs -->
    <div class="space-y-8">
        <!-- Search Bar -->
        <div class="relative group max-w-2xl">
            <span class="absolute inset-y-0 left-8 flex items-center text-zinc-400 group-focus-within:text-brand-primary transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder={searchPlaceholder}
                class="w-full pl-20 pr-10 py-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-brand-charcoal dark:text-white transition-all shadow-sm text-base"
            />
        </div>

        <!-- Filter Tabs -->
        <div class="space-y-6">
            <!-- Primary Tabs -->
            <div class="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                {#each [
                    { id: 'all', label: 'Semua User', count: counts.primary.all },
                    { id: 'admin', label: 'Administrator', count: counts.primary.admin },
                    { id: 'cs', label: 'Customer Service', count: counts.primary.cs },
                    { id: 'customer', label: 'Pelanggan', count: counts.primary.customer },
                    { id: 'pending', label: 'Menunggu', count: counts.primary.pending },
                    { id: 'inactive', label: 'Nonaktif', count: counts.primary.inactive }
                ] as tab}
                    <button 
                        onclick={() => activePrimaryTab = tab.id as any}
                        class="flex items-center gap-4 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shrink-0
                            {activePrimaryTab === tab.id 
                                ? 'bg-brand-charcoal text-white shadow-xl shadow-brand-charcoal/20 scale-105' 
                                : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-brand-primary/30 hover:text-brand-charcoal dark:hover:text-white'}"
                    >
                        {tab.label}
                        <span class="px-2.5 py-1 rounded-lg text-[9px] {activePrimaryTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                            {tab.count}
                        </span>
                    </button>
                {/each}
            </div>

            <!-- Secondary Tabs (Customer Only) -->
            {#if activePrimaryTab === 'customer'}
                <div in:fly={{ y: -10 }} class="p-6 bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] space-y-4">
                    <div class="flex items-center justify-between gap-3 px-2">
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Segmentasi Pelanggan</h3>
                        <p class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic opacity-60 animate-pulse">✓ Local Filter Active</p>
                    </div>

                    <div class="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {#each [
                            { id: 'all_customers', label: 'Seluruh Customer', count: counts.secondary.all },
                            { id: 'personal', label: 'Personal / Individu', count: counts.secondary.personal },
                            { id: 'company', label: 'Corporate / PT', count: counts.secondary.company },
                            { id: 'institution', label: 'Instansi / Yayasan', count: counts.secondary.institution },
                            { id: 'pending_customers', label: 'Belum Terverifikasi', count: counts.secondary.pending },
                            { id: 'rejected_customers', label: 'Ditolak / Blokir', count: counts.secondary.rejected }
                        ] as subtab}
                            <button 
                                onclick={() => activeCustomerSubTab = subtab.id as any}
                                class="flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shrink-0
                                    {activeCustomerSubTab === subtab.id 
                                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' 
                                        : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:text-brand-primary'}"
                            >
                                {subtab.label}
                                <span class="px-2 py-0.5 rounded-md text-[8px] {activeCustomerSubTab === subtab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                                    {subtab.count}
                                </span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Users List Table -->
    <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:border-brand-primary/20 transition-all">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                    <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                        <th class="px-10 py-7 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identitas User (Sim)</th>
                        <th class="px-10 py-7 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Akses Role</th>
                        <th class="px-10 py-7 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipe Profil</th>
                        <th class="px-10 py-7 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status Akses</th>
                        <th class="px-10 py-7 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Activity</th>
                        <th class="px-10 py-7 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Opsi (Sim)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {#each filteredUsers as user (user.id)}
                        <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all group/row" in:fade>
                            <td class="px-10 py-8">
                                <div class="flex items-center gap-5">
                                    <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 uppercase transform group-hover/row:rotate-6 transition-transform shadow-inner">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div class="flex flex-col min-w-0">
                                        <span class="text-sm font-black text-brand-charcoal dark:text-white truncate">{user.name}</span>
                                        <div class="flex items-center gap-3 mt-1">
                                            <span class="text-[10px] font-bold text-zinc-400 italic truncate max-w-[120px]">{user.email || 'No Email'}</span>
                                            {#if user.whatsapp}
                                                <span class="w-1 h-1 rounded-full bg-zinc-200"></span>
                                                <span class="text-[10px] font-bold text-zinc-400 italic">{user.whatsapp}</span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-10 py-8 text-center">
                                <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em]
                                    {user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600 shadow-sm shadow-indigo-100' : 
                                     user.role === 'CUSTOMER_SERVICE' ? 'bg-blue-100 text-blue-600 shadow-sm shadow-blue-100' : 
                                     'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-100'}">
                                    {user.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td class="px-10 py-8">
                                {#if user.role === 'USER'}
                                    <div class="flex items-center gap-2">
                                        <span class="w-1 h-1 rounded-full bg-brand-primary opacity-40"></span>
                                        <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                                            {user.accountType || user.requestedType || 'Default User'}
                                        </span>
                                    </div>
                                {:else}
                                    <span class="text-zinc-300 text-xs italic font-medium px-1">Internal Staff</span>
                                {/if}
                            </td>
                            <td class="px-10 py-8 text-center">
                                <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em]
                                    {user.status === 'active' || user.status === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                     user.status === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 
                                     'bg-red-500 text-white shadow-lg shadow-red-500/20'}">
                                    {user.status === 'active' ? 'Aktif' : user.status === 'approved' ? 'Disetujui' : user.status === 'rejected' ? 'Ditolak' : user.status === 'inactive' ? 'Nonaktif' : user.status.toUpperCase()}
                                </span>
                            </td>
                            <td class="px-10 py-8">
                                <div class="flex flex-col">
                                    <span class="text-[11px] font-black text-brand-charcoal dark:text-white uppercase tracking-tighter italic">{user.lastLogin || 'Belum Ada'}</span>
                                    <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">Log Aktivitas</span>
                                </div>
                            </td>
                            <td class="px-10 py-8 text-right">
                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <button 
                                        onclick={() => toggleStatus(user.id)}
                                        class="p-3 bg-white dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-brand-primary transition-all border border-zinc-100 dark:border-zinc-700 hover:border-brand-primary/20 shadow-sm"
                                        aria-label="Toggle user status (Local Simulation)"
                                        title="Simulasi: Aktifkan/Nonaktifkan User"
                                    >
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </button>
                                    <button 
                                        disabled
                                        aria-label="Edit user account (Hold Production)"
                                        title="Edit User: Hold Production"
                                        class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-300 dark:text-zinc-600 opacity-40 cursor-not-allowed border border-transparent"
                                    >
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="px-10 py-32 text-center bg-zinc-50/20 dark:bg-zinc-800/10">
                                <div class="max-w-xs mx-auto space-y-6">
                                    <div class="text-6xl animate-bounce">🔍</div>
                                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tighter italic">Data Tidak Ditemukan</h3>
                                    <p class="text-zinc-500 text-sm font-bold italic leading-relaxed">Pencarian "{searchQuery}" pada kategori "{activePrimaryTab}" tidak membuahkan hasil dalam database simulasi ini.</p>
                                    <button 
                                        onclick={resetFilters}
                                        class="px-8 py-4 bg-brand-charcoal text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-primary transition-all shadow-xl"
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

    <footer class="flex items-center justify-center pt-10">
        <div class="px-8 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 flex items-center gap-3">
            <span class="w-2 h-2 rounded-full bg-brand-primary opacity-40"></span>
            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">End of Simulation Phase 2 • User Management</p>
        </div>
    </footer>
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

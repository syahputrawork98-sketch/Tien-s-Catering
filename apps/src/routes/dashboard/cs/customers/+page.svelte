<script lang="ts">
    import { mockCsCustomers, type MockCsCustomer } from '$lib/mock/cs';
    import { fade, fly, scale } from 'svelte/transition';

    type TabType = 'KONFIRMASI' | 'PERSONAL' | 'COMPANY' | 'INSTITUTION';
    
    // Local state to simulate changes
    let customers = $state<MockCsCustomer[]>([...mockCsCustomers]);
    let activeTab = $state<TabType>('KONFIRMASI');
    let searchQuery = $state('');
    
    // Modal State - Detail / Approval
    let selectedCustomer = $state<MockCsCustomer | null>(null);
    let showModal = $state(false);
    let isRejecting = $state(false);
    let rejectReason = $state('');
    let selectedFinalType = $state<'personal' | 'company' | 'institution' | ''>('');

    // Modal State - Add Account
    let showAddModal = $state(false);
    let addAccountForm = $state({
        name: '',
        whatsapp: '',
        address: '',
        accountType: 'personal' as 'personal' | 'company' | 'institution',
        status: 'approved' as 'approved' | 'pending',
        internalNote: '',
        companyName: ''
    });

    const tabs = [
        { id: 'KONFIRMASI', label: 'Konfirmasi User' },
        { id: 'PERSONAL', label: 'User Personal' },
        { id: 'COMPANY', label: 'User Company' },
        { id: 'INSTITUTION', label: 'User Institusi' }
    ];

    const stats = $derived({
        totalActive: customers.filter(c => c.registrationStatus === 'approved').length,
        pending: customers.filter(c => c.registrationStatus === 'pending').length,
        personal: customers.filter(c => c.registrationStatus === 'approved' && c.accountType === 'personal').length,
        company: customers.filter(c => c.registrationStatus === 'approved' && c.accountType === 'company').length,
        institution: customers.filter(c => c.registrationStatus === 'approved' && c.accountType === 'institution').length,
    });

    const filteredCustomers = $derived(
        customers.filter(c => {
            const matchesSearch = searchQuery.trim() === '' || 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                c.whatsapp.includes(searchQuery);
            
            if (!matchesSearch) return false;

            switch (activeTab) {
                case 'KONFIRMASI': 
                    return c.registrationStatus === 'pending' || c.registrationStatus === 'rejected';
                case 'PERSONAL': 
                    return c.registrationStatus === 'approved' && c.accountType === 'personal';
                case 'COMPANY': 
                    return c.registrationStatus === 'approved' && c.accountType === 'company';
                case 'INSTITUTION': 
                    return c.registrationStatus === 'approved' && c.accountType === 'institution';
                default: 
                    return true;
            }
        })
    );

    function getCount(tabId: string) {
        switch (tabId) {
            case 'KONFIRMASI': return stats.pending;
            case 'PERSONAL': return stats.personal;
            case 'COMPANY': return stats.company;
            case 'INSTITUTION': return stats.institution;
            default: return 0;
        }
    }

    function openDetail(customer: MockCsCustomer) {
        selectedCustomer = { ...customer };
        selectedFinalType = customer.requestedType || customer.accountType || '';
        showModal = true;
        isRejecting = false;
        rejectReason = '';
    }

    function closeModal() {
        showModal = false;
        selectedCustomer = null;
    }

    function openAddModal() {
        addAccountForm = {
            name: '',
            whatsapp: '',
            address: '',
            accountType: 'personal',
            status: 'approved',
            internalNote: '',
            companyName: ''
        };
        showAddModal = true;
    }

    function closeAddModal() {
        showAddModal = false;
    }

    function approveUser() {
        if (!selectedCustomer) return;
        if (!selectedFinalType) {
            alert('Silakan tentukan tipe akun final.');
            return;
        }
        
        customers = customers.map(c => 
            c.id === selectedCustomer!.id 
                ? { 
                    ...c, 
                    registrationStatus: 'approved' as const,
                    accountType: selectedFinalType as any,
                    type: selectedFinalType as any,
                    approvedBy: 'cs' as const,
                    approvedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  } 
                : c
        );
        
        alert(`User ${selectedCustomer.name} telah disetujui sebagai ${selectedFinalType}.`);
        closeModal();
    }

    function rejectUser() {
        if (!selectedCustomer || !rejectReason) {
            alert('Silakan isi alasan penolakan.');
            return;
        }

        customers = customers.map(c => 
            c.id === selectedCustomer!.id 
                ? { 
                    ...c, 
                    registrationStatus: 'rejected' as const,
                    rejectedReason: rejectReason
                  } 
                : c
        );

        alert(`User ${selectedCustomer.name} telah ditolak.`);
        closeModal();
    }

    function saveAddAccount() {
        if (!addAccountForm.name || !addAccountForm.whatsapp || !addAccountForm.address) {
            alert('Harap isi semua field wajib (Nama, WhatsApp, Alamat).');
            return;
        }

        const newCustomer: MockCsCustomer = {
            id: `CUS-${Date.now()}`,
            name: addAccountForm.name,
            whatsapp: addAccountForm.whatsapp,
            address: addAccountForm.address,
            totalOrders: 0,
            lastOrderDate: '-',
            registrationStatus: addAccountForm.status as any,
            createdBy: 'cs',
            registeredAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            internalNote: addAccountForm.internalNote
        };

        if (addAccountForm.status === 'approved') {
            newCustomer.accountType = addAccountForm.accountType;
            newCustomer.type = addAccountForm.accountType;
            newCustomer.approvedBy = 'cs';
            newCustomer.approvedAt = newCustomer.registeredAt;
        } else {
            newCustomer.requestedType = addAccountForm.accountType;
        }

        customers = [newCustomer, ...customers];
        alert(`Akun ${addAccountForm.name} berhasil ditambahkan.`);
        closeAddModal();
    }
</script>

<div class="space-y-12 pb-24 relative">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div in:fly={{ y: -20, duration: 500 }}>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                <span class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic">Local Customer Handling (Simulation)</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Data Customer 👥</h1>
            <p class="text-zinc-500 font-medium mt-2 max-w-2xl">
                Kelola pendaftaran dan basis data pelanggan lokal. Gunakan filter untuk meninjau persetujuan akun atau melihat riwayat aktivitas.
            </p>
        </div>
        <div class="flex flex-wrap gap-4" in:fly={{ x: 20, duration: 500 }}>
            <a 
                href="/dashboard/cs/orders"
                class="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
                Cek Pesanan CS
            </a>
            <button 
                onclick={openAddModal}
                class="px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                Tambah Akun Manual
            </button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6" in:fade={{ delay: 200 }}>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-3 group-hover:text-orange-500 transition-colors">Menunggu Konfirmasi</p>
            <p class="text-4xl font-black text-orange-500 italic tracking-tighter">{stats.pending}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 group-hover:text-emerald-500 transition-colors">User Personal</p>
            <p class="text-4xl font-black text-emerald-600 italic tracking-tighter">{stats.personal}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">User Company</p>
            <p class="text-4xl font-black text-blue-600 italic tracking-tighter">{stats.company}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-3 group-hover:text-purple-500 transition-colors">User Institusi</p>
            <p class="text-4xl font-black text-purple-600 italic tracking-tighter">{stats.institution}</p>
        </div>
    </div>

    <!-- Search & Tabs -->
    <div class="space-y-8" in:fade={{ delay: 300 }}>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
            <div class="relative max-w-xl">
                <label for="customer-search" class="sr-only">Cari Customer</label>
                <div class="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span class="text-zinc-400">🔍</span>
                </div>
                <input 
                    id="customer-search"
                    type="text" 
                    bind:value={searchQuery}
                    placeholder="Cari nama customer atau nomor WhatsApp..."
                    class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-zinc-700 dark:text-white focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none shadow-inner"
                />
            </div>

            <div class="flex overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-2 px-2">
                <div class="flex gap-3 min-w-max">
                    {#each tabs as tab}
                        <button 
                            onclick={() => activeTab = tab.id as TabType}
                            aria-label={`Lihat ${tab.label}`}
                            class="px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4
                            {activeTab === tab.id 
                                ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                                : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}"
                        >
                            {tab.label}
                            {#if getCount(tab.id) > 0}
                                <span class="px-2.5 py-1 rounded-full text-[9px] 
                                    {activeTab === tab.id 
                                        ? 'bg-white/20 text-white dark:bg-brand-charcoal/10 dark:text-brand-charcoal' 
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}">
                                    {getCount(tab.id)}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Customer List -->
        <div class="min-h-[500px]">
            {#if filteredCustomers.length > 0}
                <div class="bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden" in:fade>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr class="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                    <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identitas Customer</th>
                                    <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp</th>
                                    <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lokasi Utama</th>
                                    {#if activeTab === 'KONFIRMASI'}
                                        <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Registrasi</th>
                                    {:else}
                                        <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Aktivitas Order</th>
                                    {/if}
                                    <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status / Verifikasi</th>
                                    <th class="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Manajemen</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {#each filteredCustomers as customer (customer.id)}
                                    <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all group">
                                        <td class="px-10 py-8">
                                            <div class="flex flex-col">
                                                <span class="text-base font-black text-brand-charcoal dark:text-white italic group-hover:text-brand-primary transition-colors tracking-tighter uppercase">{customer.name}</span>
                                                <div class="flex items-center gap-2 mt-1.5">
                                                    <span class="text-[9px] font-black px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                        {customer.accountType || customer.requestedType || 'Unknown'}
                                                    </span>
                                                    {#if customer.createdBy}
                                                        <span class="text-[8px] font-bold text-zinc-300 italic uppercase">via {customer.createdBy}</span>
                                                    {/if}
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-10 py-8">
                                            <a href="https://wa.me/{customer.whatsapp}" target="_blank" rel="noopener noreferrer" class="text-xs font-black text-brand-primary hover:underline italic tracking-widest">{customer.whatsapp}</a>
                                        </td>
                                        <td class="px-10 py-8">
                                            <p class="text-xs font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]" title={customer.address}>{customer.address}</p>
                                        </td>
                                        {#if activeTab === 'KONFIRMASI'}
                                            <td class="px-10 py-8 text-center">
                                                <span class="text-[11px] font-black text-zinc-500 dark:text-zinc-400 italic">{customer.registeredAt}</span>
                                            </td>
                                        {:else}
                                            <td class="px-10 py-8 text-center">
                                                <div class="flex flex-col items-center">
                                                    <span class="text-xs font-black text-brand-charcoal dark:text-white italic">{customer.totalOrders} <small class="not-italic text-zinc-300 font-bold uppercase tracking-widest text-[8px]">Orders</small></span>
                                                    <span class="text-[10px] font-medium text-zinc-400 mt-0.5 tracking-tighter italic">{customer.lastOrderDate}</span>
                                                </div>
                                            </td>
                                        {/if}
                                        <td class="px-10 py-8">
                                            {#if customer.registrationStatus === 'pending'}
                                                <span class="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-500 text-[10px] font-black uppercase rounded-lg border border-orange-100 dark:border-orange-800/50 italic tracking-widest">Menunggu</span>
                                            {:else if customer.registrationStatus === 'rejected'}
                                                <div class="flex flex-col gap-1">
                                                    <span class="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-100 dark:border-red-800/50 w-fit italic tracking-widest">Ditolak</span>
                                                    {#if customer.rejectedReason}
                                                        <span class="text-[9px] font-medium text-red-400 italic truncate max-w-[120px]" title={customer.rejectedReason}>"{customer.rejectedReason}"</span>
                                                    {/if}
                                                </div>
                                            {:else}
                                                <div class="flex flex-col">
                                                    <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 text-[10px] font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-800/50 w-fit italic tracking-widest">Verified</span>
                                                    {#if customer.approvedBy}
                                                        <span class="text-[8px] font-black uppercase text-zinc-400 mt-1.5 ml-1 italic opacity-60">✓ by {customer.approvedBy}</span>
                                                    {/if}
                                                </div>
                                            {/if}
                                        </td>
                                        <td class="px-10 py-8 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                {#if customer.registrationStatus === 'approved'}
                                                    <a 
                                                        href="/dashboard/cs/orders?search={customer.name}"
                                                        aria-label={`Lihat pesanan ${customer.name}`}
                                                        class="p-3 bg-brand-primary/5 text-brand-primary rounded-xl hover:bg-brand-primary/10 transition-all border border-brand-primary/10"
                                                    >
                                                        📦
                                                    </a>
                                                {/if}
                                                <button 
                                                    onclick={() => openDetail(customer)}
                                                    aria-label={customer.registrationStatus === 'pending' ? 'Konfirmasi Pendaftaran' : 'Buka Detail Profil'}
                                                    class="px-6 py-3 {customer.registrationStatus === 'pending' ? 'bg-brand-charcoal dark:bg-brand-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'} text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    {customer.registrationStatus === 'pending' ? 'Konfirmasi' : 'Manage'}
                                                </button>
                                            </div>
                                            <p class="text-[7px] font-black text-zinc-300 uppercase tracking-tighter mt-2 italic opacity-60">
                                                CRM Write Hold
                                            </p>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-40 px-8 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center" in:fade>
                    <div class="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-8 opacity-40 grayscale">
                        <svg class="w-12 h-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">
                        {searchQuery ? 'Hasil pencarian nihil.' : (activeTab === 'KONFIRMASI' ? 'Tidak ada pendaftaran tertunda.' : 'Belum ada basis data pelanggan.')}
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto italic">
                        {searchQuery ? `Tidak ditemukan customer dengan keyword "${searchQuery}".` : (activeTab === 'KONFIRMASI' ? 'Pendaftaran baru akan otomatis muncul di panel ini untuk review.' : 'Gunakan tab konfirmasi untuk menyetujui member baru.')}
                    </p>
                    {#if searchQuery}
                        <button onclick={() => searchQuery = ''} class="mt-8 text-xs font-black text-brand-primary uppercase tracking-widest hover:underline">Reset Pencarian</button>
                    {:else}
                        <button onclick={() => activeTab = 'KONFIRMASI'} class="mt-10 px-12 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all shadow-inner">Lihat Tab Konfirmasi</button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Customer Detail / Approval Modal -->
{#if showModal && selectedCustomer}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-brand-charcoal/60 backdrop-blur-md" in:fade out:fade>
        <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-zinc-100 dark:border-zinc-800" in:scale={{ start: 0.9, duration: 400 }}>
            <!-- Modal Header -->
            <div class="px-12 py-10 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-800/20">
                <div>
                    <h2 class="text-3xl font-black text-brand-charcoal dark:text-white italic tracking-tighter uppercase leading-none">Profil Customer</h2>
                    <div class="flex items-center gap-3 mt-3">
                        <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800 shadow-sm">UID: {selectedCustomer.id}</span>
                        <span class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic opacity-80">Local Simulation View</span>
                    </div>
                </div>
                <button onclick={closeModal} aria-label="Tutup detail customer" class="p-4 bg-white dark:bg-zinc-800 rounded-2xl hover:text-red-500 transition-all shadow-xl border border-zinc-100 dark:border-zinc-700">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Content -->
            <div class="px-12 py-10 max-h-[60vh] overflow-y-auto no-scrollbar space-y-10">
                <div class="grid grid-cols-2 gap-10">
                    <div class="space-y-8">
                        <div class="space-y-1">
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">🏷️ Nama Lengkap / Instansi</p>
                            <p class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter uppercase">{selectedCustomer.name}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">📱 WhatsApp</p>
                            <p class="text-base font-black text-brand-primary tracking-widest italic leading-none">{selectedCustomer.whatsapp}</p>
                        </div>
                    </div>
                    <div class="space-y-8">
                        <div class="space-y-1">
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">📍 Alamat Pengiriman</p>
                            <p class="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed italic">"{selectedCustomer.address}"</p>
                        </div>
                        {#if selectedCustomer.registrationStatus === 'approved'}
                            <div class="space-y-1">
                                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">📊 Aktivitas Member</p>
                                <div class="flex items-center gap-10">
                                    <div>
                                        <p class="text-xl font-black text-brand-charcoal dark:text-white italic">{selectedCustomer.totalOrders}</p>
                                        <p class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Total Orders</p>
                                    </div>
                                    <div>
                                        <p class="text-xl font-black text-brand-charcoal dark:text-white italic">{selectedCustomer.lastOrderDate}</p>
                                        <p class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Terakhir Pesan</p>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>

                {#if selectedCustomer.internalNote}
                    <div class="p-6 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10 shadow-inner">
                        <p class="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">📝 Catatan Internal CS</p>
                        <p class="text-xs font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed italic">"{selectedCustomer.internalNote}"</p>
                    </div>
                {/if}

                <div class="p-10 bg-zinc-50 dark:bg-zinc-800/40 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-inner space-y-8">
                    <div class="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-700">
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Workflow Registrasi</p>
                        <span class="text-[9px] font-bold text-zinc-400 uppercase italic">Tgl: {selectedCustomer.registeredAt}</span>
                    </div>

                    {#if selectedCustomer.registrationStatus === 'pending'}
                        <div class="space-y-8" in:fade>
                            <div class="flex items-center gap-5">
                                <div class="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 border border-orange-100 dark:border-orange-800/40 shadow-sm">
                                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div class="space-y-0.5">
                                    <p class="text-lg font-black text-brand-charcoal dark:text-white italic uppercase tracking-tighter">Verifikasi Diperlukan</p>
                                    <p class="text-[10px] font-bold text-zinc-400 italic">Validasi data customer sebelum menyetujui akun.</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Kategorikan Akun Member</p>
                                <div class="grid grid-cols-3 gap-3">
                                    {#each ['personal', 'company', 'institution'] as type}
                                        <button 
                                            onclick={() => selectedFinalType = type as any}
                                            class="px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                                            {selectedFinalType === type 
                                                ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal border-brand-charcoal dark:border-white shadow-xl scale-[1.02]' 
                                                : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-brand-primary'}"
                                        >
                                            {type}
                                            {#if selectedCustomer.requestedType === type}
                                                <span class="block text-[8px] mt-1.5 text-brand-primary italic opacity-80">(Recommended)</span>
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            {#if isRejecting}
                                <div class="pt-8 border-t border-zinc-200 dark:border-zinc-700 space-y-4" in:fly={{ y: 20 }}>
                                    <label for="reject-reason" class="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1 italic">🚨 Berikan Alasan Penolakan</label>
                                    <textarea 
                                        id="reject-reason"
                                        bind:value={rejectReason}
                                        placeholder="Tulis alasan jelas kenapa registrasi ditolak..."
                                        class="w-full bg-white dark:bg-zinc-900 border-2 border-red-50 dark:border-red-900/30 rounded-2xl text-xs font-bold p-6 focus:ring-4 focus:ring-red-500/10 outline-none transition-all shadow-inner"
                                        rows="4"
                                    ></textarea>
                                    <div class="flex gap-4 pt-2">
                                        <button onclick={() => isRejecting = false} class="flex-1 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest hover:text-zinc-600">Batalkan</button>
                                        <button onclick={rejectUser} class="flex-[2] py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-red-700 transition-all">Konfirmasi Tolak Member</button>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {:else if selectedCustomer.registrationStatus === 'rejected'}
                        <div class="flex flex-col gap-5" in:fade>
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                                </div>
                                <div>
                                    <p class="text-lg font-black text-red-500 uppercase tracking-tighter italic leading-none">Registrasi Member Ditolak</p>
                                    <p class="text-[9px] font-bold text-zinc-400 italic mt-1 uppercase">Akses sistem telah dinonaktifkan untuk user ini.</p>
                                </div>
                            </div>
                            <div class="p-6 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-red-50 dark:border-red-900/20 shadow-inner">
                                <p class="text-[9px] font-black text-zinc-400 uppercase mb-2 ml-1">Alasan Penolakan:</p>
                                <p class="text-xs font-bold text-red-400 leading-relaxed italic">"{selectedCustomer.rejectedReason}"</p>
                            </div>
                        </div>
                    {:else}
                        <div class="grid grid-cols-2 gap-10" in:fade>
                            <div class="space-y-2">
                                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tipe Akun Member</p>
                                <span class="inline-block px-5 py-2 bg-emerald-500 text-white text-[11px] font-black uppercase rounded-xl tracking-[0.1em] shadow-lg shadow-emerald-500/20 italic">{selectedCustomer.accountType}</span>
                            </div>
                            <div class="flex items-center gap-10">
                                <div class="space-y-2">
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Verifikator</p>
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                        </div>
                                        <p class="text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-tighter italic leading-none">{selectedCustomer.approvedBy}</p>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tgl Approve</p>
                                    <p class="text-xs font-black text-brand-charcoal dark:text-white italic tracking-tighter leading-none">{selectedCustomer.approvedAt}</p>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Modal Actions -->
            <div class="px-12 py-10 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex gap-4">
                {#if selectedCustomer.registrationStatus === 'pending' && !isRejecting}
                    <button 
                        onclick={() => isRejecting = true}
                        class="flex-1 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-700 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                    >
                        Tolak Member
                    </button>
                    <button 
                        onclick={approveUser}
                        class="flex-[2] py-5 bg-brand-charcoal dark:bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Verifikasi Member Sekarang
                    </button>
                {:else if !isRejecting}
                    <button 
                        onclick={closeModal}
                        class="w-full py-5 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 transition-all"
                    >
                        Selesai & Tutup Detail
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Modal Tambah Akun -->
{#if showAddModal}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-brand-charcoal/60 backdrop-blur-md" in:fade out:fade>
        <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-zinc-100 dark:border-zinc-800" in:scale={{ start: 0.9, duration: 400 }}>
            <!-- Modal Header -->
            <div class="px-12 py-10 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-800/20">
                <div>
                    <h2 class="text-3xl font-black text-brand-charcoal dark:text-white italic tracking-tighter uppercase leading-none">Register Member</h2>
                    <div class="flex items-center gap-3 mt-3">
                        <span class="text-[9px] font-black text-brand-primary uppercase tracking-widest italic opacity-80">Manual Entry Mode (Local)</span>
                    </div>
                </div>
                <button onclick={closeAddModal} aria-label="Tutup modal tambah akun" class="p-4 bg-white dark:bg-zinc-800 rounded-2xl hover:text-red-500 transition-all shadow-xl border border-zinc-100 dark:border-zinc-700">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="px-12 py-10 max-h-[60vh] overflow-y-auto no-scrollbar space-y-8">
                <div class="grid grid-cols-2 gap-8">
                    <div class="space-y-3">
                        <label for="add-account-name" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic tracking-[0.2em]">👤 Nama / Instansi *</label>
                        <input 
                            id="add-account-name"
                            bind:value={addAccountForm.name}
                            type="text" 
                            placeholder="Contoh: PT Sukses Makmur"
                            class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-xs font-black text-brand-charcoal dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                        />
                    </div>
                    <div class="space-y-3">
                        <label for="add-account-whatsapp" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic tracking-[0.2em]">📱 WhatsApp *</label>
                        <input 
                            id="add-account-whatsapp"
                            bind:value={addAccountForm.whatsapp}
                            type="text" 
                            placeholder="62812..."
                            class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-xs font-black text-brand-charcoal dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div class="space-y-3">
                    <label for="add-account-address" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic tracking-[0.2em]">📍 Alamat Pengiriman *</label>
                    <textarea 
                        id="add-account-address"
                        bind:value={addAccountForm.address}
                        placeholder="Masukkan alamat lengkap untuk database pengiriman..."
                        class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-xs font-bold text-brand-charcoal dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner resize-none"
                        rows="3"
                    ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-8">
                    <div class="space-y-3">
                        <label for="add-account-type" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic tracking-[0.2em]">📂 Tipe Akun Member</label>
                        <select 
                            id="add-account-type"
                            bind:value={addAccountForm.accountType}
                            class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-xs font-black text-brand-charcoal dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all appearance-none italic"
                        >
                            <option value="personal">Personal Account</option>
                            <option value="company">Corporate Account</option>
                            <option value="institution">Institutional Account</option>
                        </select>
                    </div>
                    <div class="space-y-3">
                        <label for="add-account-status" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic tracking-[0.2em]">🚦 Status Verifikasi</label>
                        <select 
                            id="add-account-status"
                            bind:value={addAccountForm.status}
                            class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-xs font-black text-brand-charcoal dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all appearance-none italic"
                        >
                            <option value="approved">Langsung Verified</option>
                            <option value="pending">Review (Pending)</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-3">
                    <label for="add-account-note" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic tracking-[0.2em]">📝 Catatan Internal (Simulation Only)</label>
                    <textarea 
                        id="add-account-note"
                        bind:value={addAccountForm.internalNote}
                        placeholder="Berikan catatan tambahan jika perlu..."
                        class="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-xs font-bold text-brand-charcoal dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-inner resize-none"
                        rows="2"
                    ></textarea>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-12 py-10 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex gap-4">
                <button 
                    onclick={closeAddModal}
                    class="flex-1 py-5 text-[11px] font-black uppercase text-zinc-400 tracking-widest hover:text-zinc-600 transition-colors italic"
                >
                    Batal
                </button>
                <button 
                    onclick={saveAddAccount}
                    class="flex-[2] py-5 bg-brand-charcoal dark:bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    Simpan Data & Aktifkan Member
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

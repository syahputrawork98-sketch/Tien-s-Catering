<script lang="ts">
    import { mockCsCustomers, type MockCsCustomer } from '$lib/mock/cs';
    import { fade, fly, scale } from 'svelte/transition';

    type TabType = 'KONFIRMASI' | 'PERSONAL' | 'COMPANY' | 'INSTITUTION';
    
    // Local state to simulate changes
    let customers = $state<MockCsCustomer[]>([...mockCsCustomers]);
    let activeTab = $state<TabType>('KONFIRMASI');
    
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
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Data Customer 👥</h1>
            <p class="text-zinc-500 font-medium mt-2">Kelola registrasi customer dan data pelanggan aktif berdasarkan tipe akun.</p>
        </div>
        <div class="flex gap-4" in:fly={{ x: 20, duration: 500 }}>
            <button 
                onclick={openAddModal}
                class="px-8 py-4 bg-brand-charcoal dark:bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                Tambah Akun
            </button>
        </div>
    </header>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6" in:fade={{ delay: 200 }}>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-3 group-hover:text-orange-500 transition-colors">Menunggu Konfirmasi</p>
            <p class="text-4xl font-black text-orange-500 italic">{stats.pending}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 group-hover:text-emerald-500 transition-colors">User Personal</p>
            <p class="text-4xl font-black text-emerald-600 italic">{stats.personal}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">User Company</p>
            <p class="text-4xl font-black text-blue-600 italic">{stats.company}</p>
        </div>
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <p class="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-3 group-hover:text-purple-500 transition-colors">User Institusi</p>
            <p class="text-4xl font-black text-purple-600 italic">{stats.institution}</p>
        </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="space-y-8" in:fade={{ delay: 300 }}>
        <div class="flex overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
            <div class="flex gap-3 min-w-max">
                {#each tabs as tab}
                    <button 
                        onclick={() => activeTab = tab.id as TabType}
                        class="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4
                        {activeTab === tab.id 
                            ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' 
                            : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'}"
                    >
                        {tab.label}
                        {#if getCount(tab.id) > 0}
                            <span class="px-2.5 py-1 rounded-full text-[10px] 
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

        <!-- Customer List -->
        <div class="min-h-[500px]">
            {#if filteredCustomers.length > 0}
                <div class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden" in:fade>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr class="bg-zinc-50/50 dark:bg-zinc-800/50">
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Nama & Tipe</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Alamat</th>
                                    {#if activeTab === 'KONFIRMASI'}
                                        <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Registrasi</th>
                                    {:else}
                                        <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Order Terakhir</th>
                                    {/if}
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Status / Approval</th>
                                    <th class="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {#each filteredCustomers as customer (customer.id)}
                                    <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all group">
                                        <td class="px-10 py-8">
                                            <div class="flex flex-col">
                                                <span class="text-base font-black text-brand-charcoal dark:text-white italic group-hover:text-brand-primary transition-colors">{customer.name}</span>
                                                <div class="flex items-center gap-2 mt-1.5">
                                                    <span class="text-[9px] font-black px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                        {customer.accountType || customer.requestedType || 'Unknown'}
                                                    </span>
                                                    {#if customer.createdBy}
                                                        <span class="text-[8px] font-bold text-zinc-400 italic">via {customer.createdBy}</span>
                                                    {/if}
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-10 py-8">
                                            <a href="https://wa.me/{customer.whatsapp}" class="text-sm font-bold text-brand-primary hover:underline">{customer.whatsapp}</a>
                                        </td>
                                        <td class="px-10 py-8">
                                            <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] block">{customer.address}</span>
                                        </td>
                                        {#if activeTab === 'KONFIRMASI'}
                                            <td class="px-10 py-8">
                                                <span class="text-xs font-bold text-zinc-500 dark:text-zinc-400">{customer.registeredAt}</span>
                                            </td>
                                        {:else}
                                            <td class="px-10 py-8">
                                                <div class="flex flex-col">
                                                    <span class="text-xs font-black text-brand-charcoal dark:text-white italic">{customer.totalOrders} <small class="not-italic text-zinc-400 font-bold uppercase tracking-widest text-[8px]">Orders</small></span>
                                                    <span class="text-[10px] font-medium text-zinc-400 mt-0.5">{customer.lastOrderDate}</span>
                                                </div>
                                            </td>
                                        {/if}
                                        <td class="px-10 py-8">
                                            {#if customer.registrationStatus === 'pending'}
                                                <span class="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-500 text-[10px] font-black uppercase rounded-lg border border-orange-100 dark:border-orange-800/50">Menunggu</span>
                                            {:else if customer.registrationStatus === 'rejected'}
                                                <div class="flex flex-col gap-1">
                                                    <span class="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-100 dark:border-red-800/50 w-fit">Ditolak</span>
                                                    {#if customer.rejectedReason}
                                                        <span class="text-[9px] font-medium text-red-400 italic truncate max-w-[120px]" title={customer.rejectedReason}>"{customer.rejectedReason}"</span>
                                                    {/if}
                                                </div>
                                            {:else}
                                                <div class="flex flex-col">
                                                    <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 text-[10px] font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-800/50 w-fit">Aktif</span>
                                                    {#if customer.approvedBy}
                                                        <span class="text-[9px] font-black uppercase text-zinc-400 mt-1.5 ml-1">✓ {customer.approvedBy}</span>
                                                    {/if}
                                                </div>
                                            {/if}
                                        </td>
                                        <td class="px-10 py-8 text-right">
                                            <button 
                                                onclick={() => openDetail(customer)}
                                                class="px-6 py-3 {customer.registrationStatus === 'pending' ? 'bg-brand-charcoal dark:bg-brand-primary text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500'} text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                            >
                                                {customer.registrationStatus === 'pending' ? 'Konfirmasi' : 'Detail'}
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-32 px-8 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center" in:fade>
                    <div class="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-8">
                        <svg class="w-12 h-12 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-brand-charcoal dark:text-white">
                        {activeTab === 'KONFIRMASI' ? 'Tidak ada user yang menunggu konfirmasi.' : 'Belum ada customer di kategori ini.'}
                    </h3>
                    <p class="text-zinc-400 font-medium mt-3 max-w-md mx-auto">
                        {activeTab === 'KONFIRMASI' ? 'Pendaftaran baru akan muncul di sini.' : 'Customer akan muncul setelah registrasi disetujui.'}
                    </p>
                    <button onclick={() => activeTab = 'KONFIRMASI'} class="mt-10 px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Lihat Konfirmasi Pending</button>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Customer Detail / Approval Modal -->
{#if showModal && selectedCustomer}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-charcoal/40 backdrop-blur-sm" in:fade out:fade>
        <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800" in:scale={{ start: 0.9, duration: 400 }}>
            <!-- Modal Header -->
            <div class="px-10 py-8 border-b border-zinc-50 dark:divide-zinc-800 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">Profil Customer</h2>
                    <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">ID: <span class="text-brand-primary">{selectedCustomer.id}</span></p>
                </div>
                <button onclick={closeModal} aria-label="Tutup detail customer" class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:text-red-500 transition-colors shadow-sm">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Content -->
            <div class="px-10 py-8 max-h-[65vh] overflow-y-auto no-scrollbar">
                <div class="grid grid-cols-2 gap-8 mb-10">
                    <div class="space-y-6">
                        <div>
                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Nama Lengkap / Instansi</p>
                            <p class="text-xl font-black text-brand-charcoal dark:text-white italic">{selectedCustomer.name}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">WhatsApp</p>
                            <p class="text-sm font-black text-brand-primary">{selectedCustomer.whatsapp}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Daftar Via</p>
                            <span class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-black uppercase text-zinc-500">{selectedCustomer.createdBy || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div>
                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Alamat Pengiriman</p>
                            <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">{selectedCustomer.address}</p>
                        </div>
                        {#if selectedCustomer.registrationStatus === 'approved'}
                            <div>
                                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Statistik Order</p>
                                <div class="flex items-center gap-6">
                                    <div>
                                        <p class="text-lg font-black text-brand-charcoal dark:text-white italic">{selectedCustomer.totalOrders}</p>
                                        <p class="text-[9px] font-black text-zinc-400 uppercase">Total Order</p>
                                    </div>
                                    <div>
                                        <p class="text-lg font-black text-brand-charcoal dark:text-white italic">{selectedCustomer.lastOrderDate}</p>
                                        <p class="text-[9px] font-black text-zinc-400 uppercase">Last Order</p>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>

                {#if selectedCustomer.internalNote}
                    <div class="mb-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Catatan Internal</p>
                        <p class="text-xs font-medium text-zinc-600 dark:text-zinc-400">"{selectedCustomer.internalNote}"</p>
                    </div>
                {/if}

                <div class="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                    <div class="flex items-center justify-between mb-6">
                        <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Informasi Registrasi</p>
                        <span class="px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg text-[9px] font-black text-zinc-400 border border-zinc-100 dark:border-zinc-800 uppercase tracking-widest">Tgl: {selectedCustomer.registeredAt}</span>
                    </div>

                    {#if selectedCustomer.registrationStatus === 'pending'}
                        <div class="space-y-6" in:fade>
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-black text-brand-charcoal dark:text-white italic">Menunggu Approval</p>
                                    <p class="text-[10px] font-medium text-zinc-400">Tentukan tipe akun final sebelum menyetujui pendaftaran.</p>
                                </div>
                            </div>

                            <div class="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Tentukan Tipe Akun Final</label>
                                <div class="grid grid-cols-3 gap-3">
                                    {#each ['personal', 'company', 'institution'] as type}
                                        <button 
                                            onclick={() => selectedFinalType = type as any}
                                            class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                            {selectedFinalType === type 
                                                ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal border-brand-charcoal dark:border-white shadow-lg' 
                                                : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-brand-primary'}"
                                        >
                                            {type}
                                            {#if selectedCustomer.requestedType === type}
                                                <span class="block text-[7px] mt-1 text-brand-primary italic opacity-70">(Requested)</span>
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            {#if isRejecting}
                                <div class="pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-4" in:fly={{ y: 20 }}>
                                    <label for="reject-reason" class="text-[10px] font-black text-red-500 uppercase tracking-widest">Alasan Penolakan (Wajib)</label>
                                    <textarea 
                                        id="reject-reason"
                                        bind:value={rejectReason}
                                        placeholder="Contoh: Nomor WhatsApp tidak valid atau alamat di luar jangkauan..."
                                        class="w-full bg-white dark:bg-zinc-800 border-red-100 dark:border-red-900/30 rounded-2xl text-xs font-medium p-4 focus:ring-2 focus:ring-red-500"
                                        rows="3"
                                    ></textarea>
                                    <div class="flex gap-3">
                                        <button onclick={() => isRejecting = false} class="flex-1 py-3 text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-600">Batal</button>
                                        <button onclick={rejectUser} class="flex-2 px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">Konfirmasi Tolak</button>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {:else if selectedCustomer.registrationStatus === 'rejected'}
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                                </div>
                                <p class="text-sm font-black text-red-500 uppercase tracking-widest">Registrasi Ditolak</p>
                            </div>
                            <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 italic bg-white dark:bg-zinc-900 p-4 rounded-xl border border-red-50 dark:border-red-900/20">"{selectedCustomer.rejectedReason}"</p>
                        </div>
                    {:else}
                        <div class="grid grid-cols-2 gap-8">
                            <div>
                                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Tipe Akun Final</p>
                                <span class="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">{selectedCustomer.accountType}</span>
                            </div>
                            <div class="flex items-center gap-8">
                                <div>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Disetujui Oleh</p>
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                        </div>
                                        <p class="text-xs font-black text-brand-charcoal dark:text-white uppercase">{selectedCustomer.approvedBy}</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pada Tanggal</p>
                                    <p class="text-xs font-bold text-zinc-500 dark:text-zinc-300 italic">{selectedCustomer.approvedAt}</p>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Modal Actions -->
            <div class="px-10 py-8 bg-zinc-50 dark:bg-zinc-800/50 flex gap-4">
                {#if selectedCustomer.registrationStatus === 'pending' && !isRejecting}
                    <button 
                        onclick={() => isRejecting = true}
                        class="flex-1 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        Tolak User
                    </button>
                    <button 
                        onclick={approveUser}
                        class="flex-[2] py-4 bg-brand-charcoal dark:bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Setujui User
                    </button>
                {:else if !isRejecting}
                    <button 
                        onclick={closeModal}
                        class="w-full py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all"
                    >
                        Tutup
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Modal Tambah Akun -->
{#if showAddModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-charcoal/40 backdrop-blur-sm" in:fade out:fade>
        <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800" in:scale={{ start: 0.9, duration: 400 }}>
            <!-- Modal Header -->
            <div class="px-10 py-8 border-b border-zinc-50 dark:divide-zinc-800 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-black text-brand-charcoal dark:text-white italic tracking-tighter">Tambah Akun Customer</h2>
                    <p class="text-xs font-medium text-zinc-400 mt-1">Daftarkan customer baru secara manual.</p>
                </div>
                <button onclick={closeAddModal} aria-label="Tutup modal tambah akun" class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:text-red-500 transition-colors shadow-sm">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="px-10 py-8 max-h-[65vh] overflow-y-auto no-scrollbar space-y-6">
                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label for="add-account-name" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Lengkap / Instansi *</label>
                        <input 
                            id="add-account-name"
                            bind:value={addAccountForm.name}
                            type="text" 
                            placeholder="Contoh: PT ABC atau Bpk. Budi"
                            class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary transition-all"
                        />
                    </div>
                    <div class="space-y-2">
                        <label for="add-account-whatsapp" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">WhatsApp *</label>
                        <input 
                            id="add-account-whatsapp"
                            bind:value={addAccountForm.whatsapp}
                            type="text" 
                            placeholder="0812..."
                            class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary transition-all"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="add-account-address" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Alamat Pengiriman *</label>
                    <textarea 
                        id="add-account-address"
                        bind:value={addAccountForm.address}
                        placeholder="Alamat lengkap untuk pengiriman catering..."
                        class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-brand-primary transition-all"
                        rows="3"
                    ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label for="add-account-type" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tipe Akun *</label>
                        <select 
                            id="add-account-type"
                            bind:value={addAccountForm.accountType}
                            class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary transition-all appearance-none"
                        >
                            <option value="personal">Personal</option>
                            <option value="company">Company</option>
                            <option value="institution">Institusi</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label for="add-account-status" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Status Awal *</label>
                        <select 
                            id="add-account-status"
                            bind:value={addAccountForm.status}
                            class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary transition-all appearance-none"
                        >
                            <option value="approved">Langsung Aktif</option>
                            <option value="pending">Menunggu Konfirmasi</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="add-account-note" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Catatan Internal (Opsional)</label>
                    <textarea 
                        id="add-account-note"
                        bind:value={addAccountForm.internalNote}
                        placeholder="Catatan untuk tim internal..."
                        class="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-brand-primary transition-all"
                        rows="2"
                    ></textarea>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-10 py-8 bg-zinc-50 dark:bg-zinc-800/50 flex gap-4">
                <button 
                    onclick={closeAddModal}
                    class="flex-1 py-4 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    Batal
                </button>
                <button 
                    onclick={saveAddAccount}
                    class="flex-[2] py-4 bg-brand-charcoal dark:bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    Simpan Akun
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

<script lang="ts">
    import { fly, fade, scale } from 'svelte/transition';
    import { mockAccounts, type MockAccount } from '$lib/mock/accounts';
    import Modal from '$lib/components/ui/Modal.svelte';

    type TabType = 'ALL' | 'PENDING' | 'personal' | 'company' | 'institution' | 'REJECTED';

    let accounts = $state<MockAccount[]>(mockAccounts.filter(a => a.role === 'USER').map(a => ({ ...a })));

    let activeTab = $state<TabType>('ALL');
    let showDetailModal = $state(false);
    let showApproveModal = $state(false);
    let showRejectModal = $state(false);
    let showChangeTypeModal = $state(false);
    let showAddModal = $state(false);
    let selectedAccount = $state<MockAccount | null>(null);
    let searchQuery = $state('');
    let registrationFilter = $state<string>('ALL');

    let approveType = $state<'personal' | 'company' | 'institution'>('personal');
    let rejectReason = $state('');
    let rejectError = $state('');
    let changeType = $state<'personal' | 'company' | 'institution'>('personal');
    let changeTypeNote = $state('');
    let changeTypeError = $state('');

    let addForm = $state({ name: '', email: '', whatsapp: '', address: '', accountType: 'personal' as 'personal' | 'company' | 'institution', statusMode: 'approved' as 'approved' | 'pending', adminNote: '' });
    let addError = $state('');

    const filteredAccounts = $derived(() => {
        let items = accounts;

        // Tab Filter
        switch (activeTab) {
            case 'PENDING': items = items.filter(a => a.registrationStatus === 'pending'); break;
            case 'REJECTED': items = items.filter(a => a.registrationStatus === 'rejected'); break;
            case 'personal': items = items.filter(a => a.accountType === 'personal' && a.registrationStatus === 'approved'); break;
            case 'company': items = items.filter(a => a.accountType === 'company' && a.registrationStatus === 'approved'); break;
            case 'institution': items = items.filter(a => a.accountType === 'institution' && a.registrationStatus === 'approved'); break;
        }

        // Registration Filter
        if (registrationFilter !== 'ALL') {
            items = items.filter(a => a.registrationStatus === registrationFilter);
        }

        // Search Filter
        const normalizedSearch = searchQuery.trim().toLowerCase();
        if (normalizedSearch) {
            items = items.filter(a => 
                a.name.toLowerCase().includes(normalizedSearch) ||
                (a.email || '').toLowerCase().includes(normalizedSearch) ||
                (a.whatsapp || '').includes(normalizedSearch) ||
                (a.address || '').toLowerCase().includes(normalizedSearch)
            );
        }

        return items;
    });

    const stats = $derived(() => ({
        total: accounts.length,
        pending: accounts.filter(a => a.registrationStatus === 'pending').length,
        personal: accounts.filter(a => a.accountType === 'personal' && a.registrationStatus === 'approved').length,
        company: accounts.filter(a => a.accountType === 'company' && a.registrationStatus === 'approved').length,
        institution: accounts.filter(a => a.accountType === 'institution' && a.registrationStatus === 'approved').length
    }));

    function openDetail(a: MockAccount) { selectedAccount = a; showDetailModal = true; }
    function openApprove(a: MockAccount) { selectedAccount = a; approveType = a.requestedType ?? 'personal'; showApproveModal = true; }
    function openReject(a: MockAccount) { selectedAccount = a; rejectReason = ''; rejectError = ''; showRejectModal = true; }
    function openChangeType(a: MockAccount) { selectedAccount = a; changeType = a.accountType ?? 'personal'; changeTypeNote = ''; changeTypeError = ''; showChangeTypeModal = true; }

    function confirmApprove() {
        if (!selectedAccount) return;
        accounts = accounts.map(a => a.id === selectedAccount!.id ? {
            ...a, registrationStatus: 'approved', status: 'approved',
            accountType: approveType, approvedBy: 'admin',
            approvedAt: new Date().toISOString().slice(0, 10)
        } : a);
        showApproveModal = false;
    }

    function confirmReject() {
        if (!rejectReason.trim()) { rejectError = 'Alasan penolakan wajib diisi.'; return; }
        if (!selectedAccount) return;
        accounts = accounts.map(a => a.id === selectedAccount!.id ? {
            ...a, registrationStatus: 'rejected', status: 'rejected', rejectedReason: rejectReason.trim()
        } : a);
        showRejectModal = false;
    }

    function confirmChangeType() {
        if (!changeTypeNote.trim()) { changeTypeError = 'Catatan admin wajib diisi.'; return; }
        if (!selectedAccount) return;
        accounts = accounts.map(a => a.id === selectedAccount!.id ? {
            ...a, accountType: changeType, internalNote: changeTypeNote.trim()
        } : a);
        showChangeTypeModal = false;
    }

    function confirmAdd() {
        if (!addForm.name.trim()) { addError = 'Nama wajib diisi.'; return; }
        if (!addForm.whatsapp.trim()) { addError = 'WhatsApp wajib diisi.'; return; }
        const newAccount: MockAccount = {
            id: `ADMIN-CUS-${Date.now()}`,
            name: addForm.name,
            email: addForm.email || undefined,
            whatsapp: addForm.whatsapp,
            address: addForm.address || undefined,
            role: 'USER',
            accountType: addForm.statusMode === 'approved' ? addForm.accountType : undefined,
            requestedType: addForm.accountType,
            status: addForm.statusMode,
            registrationStatus: addForm.statusMode === 'approved' ? 'approved' : 'pending',
            createdBy: 'admin',
            approvedBy: addForm.statusMode === 'approved' ? 'admin' : undefined,
            registeredAt: new Date().toISOString().slice(0, 10),
            approvedAt: addForm.statusMode === 'approved' ? new Date().toISOString().slice(0, 10) : undefined,
            internalNote: addForm.adminNote || undefined,
            totalOrders: 0,
            lastOrderDate: '-'
        };
        accounts = [newAccount, ...accounts];
        addForm = { name: '', email: '', whatsapp: '', address: '', accountType: 'personal', statusMode: 'approved', adminNote: '' };
        addError = '';
        showAddModal = false;
    }

    const statusBadge = (a: MockAccount) => {
        if (a.registrationStatus === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        if (a.registrationStatus === 'rejected') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    };

    const tabs = [
        { id: 'ALL' as TabType, label: 'Semua', count: () => stats().total },
        { id: 'PENDING' as TabType, label: 'Pending', count: () => stats().pending },
        { id: 'personal' as TabType, label: 'Personal', count: () => stats().personal },
        { id: 'company' as TabType, label: 'Company', count: () => stats().company },
        { id: 'institution' as TabType, label: 'Institusi', count: () => stats().institution },
        { id: 'REJECTED' as TabType, label: 'Ditolak', count: () => accounts.filter(a => a.registrationStatus === 'rejected').length }
    ];
</script>

<div class="space-y-10 pb-24">
    <header class="flex flex-col md:flex-row md:items-start justify-between gap-6" in:fly={{ y: -20, duration: 500 }}>
        <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic">Manajemen Customer 👥</h1>
            <p class="text-zinc-500 font-medium mt-2">Kelola customer, validasi akun, tipe pelanggan, dan riwayat approval.</p>
        </div>
        <button onclick={() => showAddModal = true} class="px-8 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Tambah Customer
        </button>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Customer', value: stats().total, color: 'text-brand-charcoal dark:text-white' },
            { label: 'Pending', value: stats().pending, color: 'text-amber-600' },
            { label: 'Personal', value: stats().personal, color: 'text-blue-600' },
            { label: 'Company', value: stats().company, color: 'text-purple-600' },
            { label: 'Institusi', value: stats().institution, color: 'text-emerald-600' }
        ] as s}
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{s.label}</p>
                <p class="text-3xl font-black {s.color} italic">{s.value}</p>
            </div>
        {/each}
    </div>

    <!-- Tabs & List -->
    <div class="space-y-8" in:fade={{ delay: 250 }}>
        <div class="flex flex-col lg:flex-row lg:items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
            <div class="relative flex-1">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Cari nama, email, WhatsApp, atau alamat..."
                    class="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pl-11 text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔎</span>
            </div>

            <select
                bind:value={registrationFilter}
                class="w-full lg:w-[200px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-200"
            >
                <option value="ALL">Semua Registrasi</option>
                <option value="approved">Disetujui (Approved)</option>
                <option value="pending">Menunggu (Pending)</option>
                <option value="rejected">Ditolak (Rejected)</option>
            </select>

            {#if searchQuery || registrationFilter !== 'ALL' || activeTab !== 'ALL'}
                <button
                    type="button"
                    onclick={() => { searchQuery = ''; registrationFilter = 'ALL'; activeTab = 'ALL'; }}
                    class="w-full lg:w-auto px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    Reset
                </button>
            {/if}
        </div>

        <div class="space-y-4">
            {#each filteredAccounts() as acc (acc.id)}
                <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8 hover:shadow-lg transition-all" in:scale={{ start: 0.98, duration: 300 }}>
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div class="flex-1 space-y-3">
                            <div class="flex flex-wrap items-center gap-3">
                                <h3 class="text-base font-black text-brand-charcoal dark:text-white">{acc.name}</h3>
                                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase {statusBadge(acc)}">{acc.registrationStatus}</span>
                                {#if acc.accountType}
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{acc.accountType}</span>
                                {:else if acc.requestedType}
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-500">Req: {acc.requestedType}</span>
                                {/if}
                                <span class="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 uppercase tracking-wider">Local DB</span>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">WhatsApp</p><p class="font-bold">{acc.whatsapp ?? '-'}</p></div>
                                <div><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Total Order (Vol)</p><p class="font-bold">{acc.totalOrders ?? 0} Order</p></div>
                                <div><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Last Order</p><p class="font-bold">{acc.lastOrderDate ?? '-'}</p></div>
                                <div><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Didaftarkan</p><p class="font-bold uppercase tracking-tighter text-[10px]">{acc.createdBy ?? '-'}</p></div>
                            </div>
                        </div>
                        <div class="flex flex-wrap lg:flex-col gap-2 lg:min-w-[160px]">
                            <button onclick={() => openDetail(acc)} class="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-100 transition-all">Detail</button>
                            {#if acc.registrationStatus === 'pending'}
                                <button onclick={() => openApprove(acc)} class="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all">Setujui</button>
                                <button onclick={() => openReject(acc)} class="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 transition-all">Tolak</button>
                            {/if}
                            {#if acc.registrationStatus === 'approved'}
                                <button onclick={() => openChangeType(acc)} class="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all">Ubah Tipe</button>
                            {/if}
                        </div>
                    </div>
                </div>
            {:else}
                <div class="text-center py-24 bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800" in:fade>
                    <p class="text-3xl mb-4">🔍</p>
                    <p class="text-zinc-400 font-black uppercase tracking-widest text-sm">Customer tidak ditemukan</p>
                    <p class="text-zinc-500 text-xs mt-2">Coba sesuaikan kata kunci atau filter status registrasi.</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal Detail -->
<Modal show={showDetailModal} title="Detail Customer 👤" onClose={() => showDetailModal = false}>
    {#if selectedAccount}
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                {#each [
                    ['ID', selectedAccount.id], ['Nama', selectedAccount.name], ['Email', selectedAccount.email ?? '-'],
                    ['WhatsApp', selectedAccount.whatsapp ?? '-'], ['Role', selectedAccount.role], ['Account Type', selectedAccount.accountType ?? '-'],
                    ['Requested Type', selectedAccount.requestedType ?? '-'], ['Status', selectedAccount.registrationStatus ?? '-'],
                    ['Dibuat oleh', selectedAccount.createdBy ?? '-'], ['Disetujui oleh', selectedAccount.approvedBy ?? '-'],
                    ['Tgl Daftar', selectedAccount.registeredAt ?? '-'], ['Tgl Disetujui', selectedAccount.approvedAt ?? '-'],
                    ['Total Order', String(selectedAccount.totalOrders ?? 0)], ['Last Order', selectedAccount.lastOrderDate ?? '-']
                ] as [label, value]}
                    <div><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">{label}</p><p class="text-sm font-bold">{value}</p></div>
                {/each}
                {#if selectedAccount.address}
                    <div class="col-span-2"><p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Alamat</p><p class="text-sm">{selectedAccount.address}</p></div>
                {/if}
            </div>
            {#if selectedAccount.rejectedReason}
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl"><p class="text-[9px] font-black text-red-500 uppercase mb-1">Alasan Penolakan</p><p class="text-sm">{selectedAccount.rejectedReason}</p></div>
            {/if}
            {#if selectedAccount.internalNote}
                <div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl"><p class="text-[9px] font-black text-zinc-400 uppercase mb-1">Catatan Internal</p><p class="text-sm">{selectedAccount.internalNote}</p></div>
            {/if}
        </div>
    {/if}
</Modal>

<!-- Modal Approve -->
<Modal show={showApproveModal} title="Setujui Customer (Admin) ✅" onClose={() => showApproveModal = false}>
    {#if selectedAccount}
        <div class="space-y-5">
            <p class="text-sm font-bold">Setujui pendaftaran <strong>{selectedAccount.name}</strong> sebagai:</p>
            <div class="space-y-2">
                <label for="aType" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipe Akun Final *</label>
                <select id="aType" bind:value={approveType} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-400 appearance-none">
                    <option value="personal">Personal</option>
                    <option value="company">Company</option>
                    <option value="institution">Institusi</option>
                </select>
            </div>
            <div class="flex gap-3">
                <button onclick={() => showApproveModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
                <button onclick={confirmApprove} class="flex-1 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">Setujui sebagai Admin</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Modal Reject -->
<Modal show={showRejectModal} title="Tolak Pendaftaran (Admin) 🚫" onClose={() => showRejectModal = false}>
    {#if selectedAccount}
        <div class="space-y-5">
            <p class="text-sm font-bold">Tolak pendaftaran <strong>{selectedAccount.name}</strong>.</p>
            <div class="space-y-2">
                <label for="rReason" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alasan Penolakan *</label>
                <textarea id="rReason" bind:value={rejectReason} rows="3" placeholder="Tuliskan alasan..." class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-400 resize-none"></textarea>
                {#if rejectError}<p class="text-[10px] font-bold text-red-500">{rejectError}</p>{/if}
            </div>
            <div class="flex gap-3">
                <button onclick={() => showRejectModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
                <button onclick={confirmReject} class="flex-1 py-4 bg-red-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">Tolak sebagai Admin</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Modal Ubah Tipe -->
<Modal show={showChangeTypeModal} title="Ubah Tipe Akun (Admin) 🔄" onClose={() => showChangeTypeModal = false}>
    {#if selectedAccount}
        <div class="space-y-5">
            <p class="text-sm font-bold">Ubah tipe akun <strong>{selectedAccount.name}</strong>.</p>
            <div class="space-y-2">
                <label for="ctType" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipe Akun Baru *</label>
                <select id="ctType" bind:value={changeType} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-400 appearance-none">
                    <option value="personal">Personal</option>
                    <option value="company">Company</option>
                    <option value="institution">Institusi</option>
                </select>
            </div>
            <div class="space-y-2">
                <label for="ctNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan Admin *</label>
                <textarea id="ctNote" bind:value={changeTypeNote} rows="2" placeholder="Alasan perubahan..." class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-400 resize-none"></textarea>
                {#if changeTypeError}<p class="text-[10px] font-bold text-red-500">{changeTypeError}</p>{/if}
            </div>
            <div class="flex gap-3">
                <button onclick={() => showChangeTypeModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
                <button onclick={confirmChangeType} class="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">Simpan Perubahan</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Modal Tambah -->
<Modal show={showAddModal} title="Tambah Customer (Admin) ➕" onClose={() => showAddModal = false}>
    <div class="space-y-4">
        <div class="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100"><p class="text-[10px] font-bold text-red-600">Akun dibuat langsung oleh Admin.</p></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 col-span-2"><label for="addName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama *</label><input id="addName" type="text" bind:value={addForm.name} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" /></div>
            <div class="space-y-1"><label for="addWa" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp *</label><input id="addWa" type="text" bind:value={addForm.whatsapp} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" /></div>
            <div class="space-y-1"><label for="addEmail" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email</label><input id="addEmail" type="email" bind:value={addForm.email} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" /></div>
            <div class="space-y-1 col-span-2"><label for="addAddr" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alamat</label><input id="addAddr" type="text" bind:value={addForm.address} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" /></div>
            <div class="space-y-1"><label for="addType" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipe Akun</label>
                <select id="addType" bind:value={addForm.accountType} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary appearance-none">
                    <option value="personal">Personal</option><option value="company">Company</option><option value="institution">Institusi</option>
                </select>
            </div>
            <div class="space-y-1"><label for="addStatus" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Awal</label>
                <select id="addStatus" bind:value={addForm.statusMode} class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary appearance-none">
                    <option value="approved">Langsung Aktif</option><option value="pending">Menunggu Konfirmasi</option>
                </select>
            </div>
            <div class="space-y-1 col-span-2"><label for="addNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan Admin</label><textarea id="addNote" bind:value={addForm.adminNote} rows="2" class="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea></div>
        </div>
        {#if addError}<p class="text-[10px] font-bold text-red-500">{addError}</p>{/if}
        <div class="flex gap-3 pt-2">
            <button onclick={() => showAddModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-2xl">Batal</button>
            <button onclick={confirmAdd} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Tambah Customer</button>
        </div>
    </div>
</Modal>

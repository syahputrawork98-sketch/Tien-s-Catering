<script lang="ts">
    import { fly, fade, scale } from 'svelte/transition';
    import { mockTaxRules, calculateTax, type MockTaxRule, type CustomerTaxType } from '$lib/mock/tax';
    import Modal from '$lib/components/ui/Modal.svelte';

    type TabType = 'ALL' | CustomerTaxType;
    
    type PaymentAccount = {
      id: string;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      type: 'bank_transfer' | 'qris' | 'ewallet';
      isPrimary: boolean;
      isActive: boolean;
      qrImageUrl?: string;
      note?: string;
      createdAt: string;
      updatedAt: string;
    };

    let rules = $state<MockTaxRule[]>(mockTaxRules.map(r => ({ ...r })));
    let activeTab = $state<TabType>('ALL');

    // Stats
    const stats = $derived(() => ({
        total: rules.length,
        taxEnabled: rules.filter(r => r.isTaxEnabled).length,
        invoiceRequired: rules.filter(r => r.invoiceRequired).length,
        npwpRequired: rules.filter(r => r.npwpRequired).length
    }));

    const filteredRules = $derived(() => {
        if (activeTab === 'ALL') return rules;
        return rules.filter(r => r.customerType === activeTab);
    });

    // Modals
    let showDetailModal = $state(false);
    let showEditModal = $state(false);
    let selectedRule = $state<MockTaxRule | null>(null);

    // Edit Form
    let editForm = $state({
        label: '',
        description: '',
        isTaxEnabled: false,
        ppnRate: 0,
        invoiceRequired: false,
        npwpRequired: false,
        taxIncluded: false,
        additionalNote: '',
        adminNote: ''
    });
    let editError = $state('');

    // Payment Accounts State
    let paymentAccounts = $state<PaymentAccount[]>([
        {
            id: 'pay-001',
            bankName: 'BCA',
            accountNumber: '1234567890',
            accountHolder: "Tien's Catering",
            type: 'bank_transfer',
            isPrimary: true,
            isActive: true,
            createdAt: '2026-05-01',
            updatedAt: '2026-05-01'
        },
        {
            id: 'pay-002',
            bankName: 'Mandiri',
            accountNumber: '0987654321',
            accountHolder: "Tien's Catering",
            type: 'bank_transfer',
            isPrimary: false,
            isActive: true,
            createdAt: '2026-05-01',
            updatedAt: '2026-05-01'
        },
        {
            id: 'pay-003',
            bankName: 'QRIS',
            accountNumber: 'TIENSCAT',
            accountHolder: "Tien's Catering",
            type: 'qris',
            isPrimary: false,
            isActive: true,
            qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TIENSCAT',
            createdAt: '2026-05-01',
            updatedAt: '2026-05-01'
        }
    ]);

    let showPaymentModal = $state(false);
    let isEditingPayment = $state(false);
    let selectedPayment = $state<PaymentAccount | null>(null);
    let paymentForm = $state({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        type: 'bank_transfer' as PaymentAccount['type'],
        isPrimary: false,
        isActive: true,
        qrImageUrl: '',
        note: ''
    });
    let paymentError = $state('');

    // Simulation
    let simSubtotal = $state(1000000);
    let simCustomerType = $state<CustomerTaxType>('personal');
    const simResult = $derived(() => {
        const rule = rules.find(r => r.customerType === simCustomerType);
        return rule ? calculateTax(simSubtotal, rule) : null;
    });

    function formatPrice(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    }

    function openDetail(rule: MockTaxRule) {
        selectedRule = rule;
        showDetailModal = true;
    }

    function openEdit(rule: MockTaxRule) {
        selectedRule = rule;
        editForm = {
            label: rule.label,
            description: rule.description,
            isTaxEnabled: rule.isTaxEnabled,
            ppnRate: rule.ppnRate,
            invoiceRequired: rule.invoiceRequired,
            npwpRequired: rule.npwpRequired,
            taxIncluded: rule.taxIncluded,
            additionalNote: rule.additionalNote || '',
            adminNote: ''
        };
        editError = '';
        showEditModal = true;
    }

    function saveEdit() {
        if (!editForm.label.trim()) { editError = 'Label wajib diisi.'; return; }
        if (!editForm.description.trim()) { editError = 'Deskripsi wajib diisi.'; return; }
        if (editForm.isTaxEnabled && editForm.ppnRate <= 0) { editError = 'PPN Rate harus lebih dari 0 jika pajak aktif.'; return; }
        if (!editForm.adminNote.trim()) { editError = 'Catatan Admin wajib diisi untuk menyimpan perubahan.'; return; }

        if (!selectedRule) return;

        rules = rules.map(r => r.id === selectedRule!.id ? {
            ...r,
            ...editForm,
            updatedBy: 'admin',
            updatedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
        } : r);

        showEditModal = false;
    }

    // Payment Handlers
    function openAddPayment() {
        isEditingPayment = false;
        paymentForm = {
            bankName: '',
            accountNumber: '',
            accountHolder: "Tien's Catering",
            type: 'bank_transfer',
            isPrimary: false,
            isActive: true,
            qrImageUrl: '',
            note: ''
        };
        paymentError = '';
        showPaymentModal = true;
    }

    function openEditPayment(pay: PaymentAccount) {
        selectedPayment = pay;
        isEditingPayment = true;
        paymentForm = {
            bankName: pay.bankName,
            accountNumber: pay.accountNumber,
            accountHolder: pay.accountHolder,
            type: pay.type,
            isPrimary: pay.isPrimary,
            isActive: pay.isActive,
            qrImageUrl: pay.qrImageUrl || '',
            note: pay.note || ''
        };
        paymentError = '';
        showPaymentModal = true;
    }

    function savePayment() {
        if (!paymentForm.bankName.trim()) { paymentError = 'Nama Bank/Provider wajib diisi.'; return; }
        if (!paymentForm.accountNumber.trim()) { paymentError = 'Nomor rekening wajib diisi.'; return; }
        if (!paymentForm.accountHolder.trim()) { paymentError = 'Nama pemilik rekening wajib diisi.'; return; }

        if (isEditingPayment && selectedPayment) {
            paymentAccounts = paymentAccounts.map(p => {
                if (p.id === selectedPayment!.id) {
                    return {
                        ...p,
                        ...paymentForm,
                        updatedAt: new Date().toISOString().slice(0, 10)
                    };
                }
                // If this is set as primary, unset others
                if (paymentForm.isPrimary && p.id !== selectedPayment!.id) {
                    return { ...p, isPrimary: false };
                }
                return p;
            });
        } else {
            const newPay: PaymentAccount = {
                id: `pay-${Date.now()}`,
                ...paymentForm,
                createdAt: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString().slice(0, 10)
            };
            
            if (newPay.isPrimary) {
                paymentAccounts = paymentAccounts.map(p => ({ ...p, isPrimary: false }));
            }
            
            paymentAccounts = [...paymentAccounts, newPay];
        }

        showPaymentModal = false;
    }

    function togglePaymentActive(id: string) {
        paymentAccounts = paymentAccounts.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    }

    function setPrimaryPayment(id: string) {
        paymentAccounts = paymentAccounts.map(p => ({
            ...p,
            isPrimary: p.id === id
        }));
    }

    const tabs: { id: TabType; label: string }[] = [
        { id: 'ALL', label: 'Semua' },
        { id: 'personal', label: 'Personal' },
        { id: 'company', label: 'Perusahaan' },
        { id: 'institution', label: 'Instansi' }
    ];
</script>

<div class="space-y-10 pb-24 relative">
    <header class="flex flex-col md:flex-row md:items-start justify-between gap-6" in:fly={{ y: -20, duration: 500 }}>
        <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest italic">Local Billing Simulation (Hold Production)</span>
            </div>
            <h1 class="text-4xl lg:text-5xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Pajak & Invoice 🧾</h1>
            <p class="text-zinc-500 font-medium mt-2 max-w-2xl">
                Atur parameter pajak dan billing untuk simulasi invoice. <span class="text-red-500 font-black italic uppercase">Penting:</span> Integrasi invoice otomatis & pelaporan pajak resmi masih dalam status **Hold Production**.
            </p>
        </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fade={{ delay: 150 }}>
        {#each [
            { label: 'Total Aturan', value: stats().total, color: 'text-zinc-600 dark:text-white' },
            { label: 'Pajak Aktif', value: stats().taxEnabled, color: 'text-emerald-600' },
            { label: 'Invoice Wajib', value: stats().invoiceRequired, color: 'text-blue-600' },
            { label: 'NPWP Wajib', value: stats().npwpRequired, color: 'text-purple-600' }
        ] as stat}
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <p class="text-3xl font-black {stat.color} italic">{stat.value}</p>
            </div>
        {/each}
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-3 gap-8">
        <!-- Rules List -->
        <div class="lg:col-span-2 space-y-8" in:fade={{ delay: 250 }}>
            <!-- Tabs -->
            <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {#each tabs as tab}
                    <button
                        onclick={() => activeTab = tab.id}
                        class="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                        {activeTab === tab.id ? 'bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal shadow-xl scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}"
                    >
                        {tab.label}
                    </button>
                {/each}
            </div>

            <!-- List -->
            <div class="space-y-4">
                {#each filteredRules() as rule (rule.id)}
                    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8 hover:shadow-lg transition-all duration-300" in:scale={{ start: 0.98, duration: 300 }}>
                        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div class="flex-1 space-y-4">
                                <div class="flex items-center gap-3">
                                    <h3 class="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tighter italic">{rule.label}</h3>
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase {rule.isTaxEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'}">
                                        {rule.isTaxEnabled ? `Pajak Aktif (${rule.ppnRate}%)` : 'Bebas Pajak'}
                                    </span>
                                </div>
                                
                                <p class="text-sm text-zinc-500 font-medium leading-relaxed">{rule.description}</p>

                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div class="space-y-1">
                                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Invoice</p>
                                        <p class="text-xs font-bold {rule.invoiceRequired ? 'text-blue-600' : 'text-zinc-400'}">{rule.invoiceRequired ? '✓ Wajib' : '○ Opsional'}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">NPWP</p>
                                        <p class="text-xs font-bold {rule.npwpRequired ? 'text-purple-600' : 'text-zinc-400'}">{rule.npwpRequired ? '✓ Wajib' : '○ Opsional'}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Metode Harga</p>
                                        <p class="text-xs font-bold text-zinc-600 dark:text-zinc-300">{rule.taxIncluded ? 'Inc. Pajak' : 'Exc. Pajak'}</p>
                                    </div>
                                </div>

                                {#if rule.updatedBy === 'admin'}
                                    <div class="pt-4 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase rounded">⚡ Diubah Admin</span>
                                            <span class="text-[10px] text-zinc-400 font-medium">{rule.updatedAt}</span>
                                        </div>
                                        <p class="text-xs text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border-l-2 border-red-200">{rule.adminNote}</p>
                                    </div>
                                {/if}
                            </div>

                            <div class="flex lg:flex-col gap-2 min-w-[120px]">
                                <button onclick={() => openDetail(rule)} class="flex-1 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-100 transition-all">Detail</button>
                                <button onclick={() => openEdit(rule)} class="flex-1 py-3 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">Edit Rule</button>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p class="text-zinc-400 font-black">Tidak ada aturan ditemukan</p>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Simulation Sidebar -->
        <div class="space-y-6" in:fade={{ delay: 350 }}>
            <div class="bg-zinc-900 dark:bg-zinc-950 rounded-[3rem] p-8 text-white shadow-2xl sticky top-24">
                <div class="flex items-center gap-3 mb-8">
                    <span class="text-2xl">🧮</span>
                    <h2 class="text-lg font-black uppercase tracking-widest italic text-brand-primary">Simulasi Invoice</h2>
                </div>

                <div class="space-y-6">
                    <div class="space-y-2">
                        <label for="simSub" class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subtotal (Rp)</label>
                        <input id="simSub" type="number" bind:value={simSubtotal} class="w-full bg-white/5 border-none rounded-2xl px-5 py-4 text-xl font-black italic focus:ring-2 focus:ring-brand-primary transition-all" />
                    </div>

                    <div class="space-y-2">
                        <label for="simType" class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tipe Customer</label>
                        <select id="simType" bind:value={simCustomerType} class="w-full bg-white/5 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary transition-all appearance-none">
                            <option value="personal" class="text-zinc-900">Personal</option>
                            <option value="company" class="text-zinc-900">Company / Perusahaan</option>
                            <option value="institution" class="text-zinc-900">Instansi / Institusi</option>
                        </select>
                    </div>

                    <div class="pt-6 border-t border-white/10 space-y-4">
                        {#if simResult()}
                            <div class="flex justify-between text-sm">
                                <span class="text-zinc-400 font-medium">Subtotal</span>
                                <span class="font-black italic">{formatPrice(simResult()!.subtotal)}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-zinc-400 font-medium">Pajak ({simResult()!.ppnRate}%)</span>
                                <span class="font-black italic {simResult()!.taxAmount > 0 ? 'text-brand-primary' : 'text-zinc-500'}">
                                    + {formatPrice(simResult()!.taxAmount)}
                                </span>
                            </div>
                            {#if simResult()!.taxIncluded}
                                <p class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest text-center">* Pajak sudah termasuk (Tax Included)</p>
                            {/if}
                            <div class="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span class="text-xs font-black uppercase tracking-widest text-zinc-500">Total Invoice</span>
                                <span class="text-3xl font-black italic text-brand-primary">{formatPrice(simResult()!.total)}</span>
                            </div>
                        {/if}
                    </div>

                    <div class="bg-white/5 rounded-2xl p-4 space-y-2 mt-4">
                        <div class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full {simResult()?.isTaxEnabled ? 'bg-emerald-500' : 'bg-zinc-600'}"></span>
                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status: {simResult()?.isTaxEnabled ? 'Pajak Aktif' : 'Bebas Pajak'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full {rules.find(r => r.customerType === simCustomerType)?.invoiceRequired ? 'bg-blue-500' : 'bg-zinc-600'}"></span>
                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Invoice: {rules.find(r => r.customerType === simCustomerType)?.invoiceRequired ? 'Wajib Formal' : 'Opsional'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Accounts Section -->
    <div class="space-y-8 pt-10 border-t border-zinc-100 dark:border-zinc-800" in:fade={{ delay: 450 }}>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-2xl">💳</div>
                <div>
                    <h2 class="text-2xl font-black text-brand-charcoal dark:text-white tracking-tighter italic uppercase">Rekening Pembayaran (Manual)</h2>
                    <p class="text-xs text-zinc-500 font-medium italic">Konfigurasi rekening untuk transfer manual. Gateway otomatis tetap **Hold Production**.</p>
                </div>
            </div>
            <button 
                onclick={openAddPayment}
                class="px-6 py-4 bg-brand-charcoal dark:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Rekening Lokal
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each paymentAccounts as pay (pay.id)}
                <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 hover:shadow-md transition-all relative overflow-hidden group">
                    {#if pay.isPrimary}
                        <div class="absolute top-0 right-0">
                            <div class="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-6 py-1 rotate-45 translate-x-4 translate-y-2 shadow-sm">Utama</div>
                        </div>
                    {/if}

                    <div class="space-y-6">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xl shadow-inner">
                                    {pay.type === 'qris' ? '📱' : '🏦'}
                                </div>
                                <div>
                                    <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tighter">{pay.bankName}</h3>
                                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{pay.type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button aria-label="Toggle status pembayaran" onclick={() => togglePaymentActive(pay.id)} class="w-8 h-4 rounded-full relative transition-all {pay.isActive ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}">
                                    <div class="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all {pay.isActive ? 'left-4.5' : 'left-0.5'} shadow-sm"></div>
                                </button>
                            </div>
                        </div>

                        {#if pay.type === 'qris' && pay.qrImageUrl}
                            <div class="aspect-square w-32 mx-auto bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                <img src={pay.qrImageUrl} alt="QRIS" class="w-full h-full object-contain" />
                            </div>
                        {:else}
                            <div class="py-4 space-y-2">
                                <p class="text-lg font-black text-brand-charcoal dark:text-white tracking-widest text-center italic">{pay.accountNumber}</p>
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">a.n. {pay.accountHolder}</p>
                            </div>
                        {/if}

                        <div class="flex gap-2 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                            <button onclick={() => openEditPayment(pay)} class="flex-1 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all">Edit</button>
                            {#if !pay.isPrimary}
                                <button onclick={() => setPrimaryPayment(pay.id)} class="flex-1 py-2 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">Set Utama</button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal Detail -->
<Modal show={showDetailModal} title="Detail Aturan Pajak 🧾" onClose={() => showDetailModal = false}>
    {#if selectedRule}
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
                <div class="col-span-2">
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Label / Nama Aturan</p>
                    <p class="text-lg font-black italic text-brand-charcoal dark:text-white uppercase tracking-tighter">{selectedRule.label}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deskripsi</p>
                    <p class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{selectedRule.description}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tipe Customer</p>
                    <p class="text-sm font-black uppercase italic">{selectedRule.customerType}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status Pajak</p>
                    <p class="text-sm font-black {selectedRule.isTaxEnabled ? 'text-emerald-600' : 'text-zinc-400'}">
                        {selectedRule.isTaxEnabled ? `Aktif (${selectedRule.ppnRate}%)` : 'Nonaktif'}
                    </p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Invoice Formal</p>
                    <p class="text-sm font-black {selectedRule.invoiceRequired ? 'text-blue-600' : 'text-zinc-400'}">{selectedRule.invoiceRequired ? 'WAJIB' : 'OPSIONAL'}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Data NPWP</p>
                    <p class="text-sm font-black {selectedRule.npwpRequired ? 'text-purple-600' : 'text-zinc-400'}">{selectedRule.npwpRequired ? 'WAJIB' : 'OPSIONAL'}</p>
                </div>
                <div>
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Metode Billing</p>
                    <p class="text-sm font-black">{selectedRule.taxIncluded ? 'Tax Included' : 'Tax Excluded'}</p>
                </div>
            </div>

            {#if selectedRule.additionalNote}
                <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Catatan Tambahan</p>
                    <p class="text-xs font-medium">{selectedRule.additionalNote}</p>
                </div>
            {/if}

            {#if selectedRule.updatedBy === 'admin'}
                <div class="p-5 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-[10px] font-black text-red-600 uppercase tracking-widest">⚡ Log Perubahan Terakhir</span>
                        <span class="text-[9px] text-zinc-400 font-bold">{selectedRule.updatedAt}</span>
                    </div>
                    <p class="text-sm font-bold text-zinc-700 dark:text-zinc-300 italic mb-2">"{selectedRule.adminNote}"</p>
                    <p class="text-[9px] text-zinc-400 font-black uppercase">Oleh: {selectedRule.updatedBy}</p>
                </div>
            {/if}

            <div class="flex gap-3 pt-4">
                <button onclick={() => showDetailModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Tutup</button>
                <button onclick={() => { showDetailModal = false; openEdit(selectedRule!); }} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl">Edit Rule</button>
            </div>
        </div>
    {/if}
</Modal>

<!-- Modal Edit -->
<Modal show={showEditModal} title="Edit Aturan Pajak ✏️" onClose={() => showEditModal = false}>
    <div class="space-y-5">
        <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
            <p class="text-xs font-bold text-red-700 dark:text-red-400 leading-relaxed">⚠️ Perubahan ini akan berdampak langsung pada seluruh perhitungan invoice di sistem untuk tipe customer ini.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 col-span-2">
                <label for="eLabel" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Aturan *</label>
                <input id="eLabel" type="text" bind:value={editForm.label} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            
            <div class="space-y-1 col-span-2">
                <label for="eDesc" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi *</label>
                <textarea id="eDesc" bind:value={editForm.description} rows="2" class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>

            <div class="space-y-3">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Pajak</p>
                <div class="flex gap-3">
                    <button 
                        onclick={() => editForm.isTaxEnabled = true}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {editForm.isTaxEnabled ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Aktif</button>
                    <button 
                        onclick={() => { editForm.isTaxEnabled = false; editForm.ppnRate = 0; }}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {!editForm.isTaxEnabled ? 'bg-zinc-50 border-zinc-400 text-zinc-600 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Nonaktif</button>
                </div>
            </div>

            <div class="space-y-1">
                <label for="eRate" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PPN Rate (%) *</label>
                <input id="eRate" type="number" bind:value={editForm.ppnRate} disabled={!editForm.isTaxEnabled} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary disabled:opacity-50" />
            </div>

            <div class="space-y-3">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Formal</p>
                <div class="flex gap-3">
                    <button 
                        onclick={() => editForm.invoiceRequired = true}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {editForm.invoiceRequired ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Wajib</button>
                    <button 
                        onclick={() => editForm.invoiceRequired = false}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {!editForm.invoiceRequired ? 'bg-zinc-50 border-zinc-400 text-zinc-600 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Opsional</button>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Data NPWP</p>
                <div class="flex gap-3">
                    <button 
                        onclick={() => editForm.npwpRequired = true}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {editForm.npwpRequired ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Wajib</button>
                    <button 
                        onclick={() => editForm.npwpRequired = false}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {!editForm.npwpRequired ? 'bg-zinc-50 border-zinc-400 text-zinc-600 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Opsional</button>
                </div>
            </div>

            <div class="space-y-3 col-span-2">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Metode Billing</p>
                <div class="flex gap-3">
                    <button 
                        onclick={() => editForm.taxIncluded = true}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {editForm.taxIncluded ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Tax Included</button>
                    <button 
                        onclick={() => editForm.taxIncluded = false}
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all {!editForm.taxIncluded ? 'bg-zinc-50 border-zinc-400 text-zinc-600 shadow-sm' : 'bg-transparent border-zinc-100 text-zinc-400'}"
                    >Tax Excluded</button>
                </div>
                <p class="text-[9px] text-zinc-400 italic">*{editForm.taxIncluded ? 'Harga di katalog dianggap sudah termasuk PPN.' : 'PPN akan ditambahkan di atas subtotal katalog.'}</p>
            </div>

            <div class="space-y-1 col-span-2">
                <label for="eAddNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan Tambahan</label>
                <textarea id="eAddNote" bind:value={editForm.additionalNote} rows="2" class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>

            <div class="space-y-1 col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <label for="eAdminNote" class="text-[10px] font-black text-red-500 uppercase tracking-widest">Alasan Perubahan (Catatan Admin) *</label>
                <textarea id="eAdminNote" bind:value={editForm.adminNote} rows="3" placeholder="Jelaskan alasan perubahan aturan pajak ini..." class="w-full px-5 py-4 bg-red-50/50 dark:bg-red-900/10 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-400 resize-none"></textarea>
                {#if editError}<p class="text-[10px] font-bold text-red-500 mt-1">{editError}</p>{/if}
            </div>
        </div>

        <div class="flex gap-3 pt-6">
            <button onclick={() => showEditModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Batal</button>
            <button onclick={saveEdit} class="flex-1 py-4 bg-brand-charcoal dark:bg-white text-white dark:text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Simpan Aturan</button>
        </div>
    </div>
</Modal>

<!-- Modal Payment Account -->
<Modal show={showPaymentModal} title={isEditingPayment ? "Edit Rekening Pembayaran ✏️" : "Tambah Rekening Baru 💳"} onClose={() => showPaymentModal = false} maxWidth="max-w-2xl">
    <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
                <label for="pBank" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bank / Provider *</label>
                <input id="pBank" type="text" bind:value={paymentForm.bankName} placeholder="Contoh: BCA, Mandiri, QRIS" class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>
            
            <div class="space-y-1">
                <label for="pType" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipe Pembayaran</label>
                <select id="pType" bind:value={paymentForm.type} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary appearance-none">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="qris">QRIS</option>
                    <option value="ewallet">E-Wallet</option>
                </select>
            </div>

            <div class="space-y-1">
                <label for="pNumber" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nomor Rekening / ID *</label>
                <input id="pNumber" type="text" bind:value={paymentForm.accountNumber} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>

            <div class="space-y-1">
                <label for="pName" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Atas Nama *</label>
                <input id="pName" type="text" bind:value={paymentForm.accountHolder} class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
            </div>

            {#if paymentForm.type === 'qris'}
                <div class="space-y-1 col-span-2">
                    <label for="pQr" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL Gambar QRIS (Local Simulation)</label>
                    <input id="pQr" type="text" bind:value={paymentForm.qrImageUrl} placeholder="Contoh: https://api.qrserver.com/v1/..." class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary" />
                    <p class="text-[9px] text-zinc-400 italic mt-1 uppercase tracking-widest">⚠️ Fitur upload gambar resmi masih dalam status **Hold Production**.</p>
                    {#if paymentForm.qrImageUrl}
                        <div class="mt-4 p-4 bg-white rounded-2xl border border-zinc-100 flex justify-center">
                            <img src={paymentForm.qrImageUrl} alt="Preview QRIS" class="h-32 object-contain" />
                        </div>
                    {/if}
                </div>
            {/if}

            <div class="space-y-1 col-span-2">
                <label for="pNote" class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan (Opsional)</label>
                <textarea id="pNote" bind:value={paymentForm.note} rows="2" class="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary resize-none"></textarea>
            </div>

            <div class="col-span-2 flex flex-col md:flex-row gap-4">
                <label class="flex-1 flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-all">
                    <input type="checkbox" bind:checked={paymentForm.isActive} class="w-5 h-5 rounded-lg border-zinc-200 text-brand-primary focus:ring-brand-primary" />
                    <span class="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Status Aktif</span>
                </label>
                <label class="flex-1 flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-all">
                    <input type="checkbox" bind:checked={paymentForm.isPrimary} class="w-5 h-5 rounded-lg border-zinc-200 text-emerald-500 focus:ring-emerald-500" />
                    <span class="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Jadikan Utama</span>
                </label>
            </div>

            {#if paymentError}
                <div class="col-span-2 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center">
                    {paymentError}
                </div>
            {/if}
        </div>

        <div class="flex gap-3 pt-6">
            <button onclick={() => showPaymentModal = false} class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Batal</button>
            <button onclick={savePayment} class="flex-1 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Simpan Rekening</button>
        </div>
    </div>
</Modal>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>

<script lang="ts">
    import { mockBusinessProfile } from '$lib/mock/business';
    import { authStore } from '$lib/stores/auth.svelte';
    import { fade, fly } from 'svelte/transition';
    import Modal from '$lib/components/ui/Modal.svelte';

    let profile = $state({
        name: authStore.user?.name || '',
        whatsapp: authStore.user?.phone || '',
        email: authStore.user?.email || '',
        address: authStore.user?.address || ''
    });

    let isSaving = $state(false);
    let showSuccess = $state(false);
    let errorMessage = $state('');

    // Initial helper
    function getInitial(name: string) {
        return name?.trim()?.charAt(0)?.toUpperCase() || 'U';
    }

    // Password Modal State
    let showPasswordModal = $state(false);
    let passwordForm = $state({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    let passwordError = $state('');

    async function handleSave() {
        if (!authStore.isAuthenticated) return;
        
        isSaving = true;
        errorMessage = '';
        try {
            await authStore.updateProfile({
                name: profile.name,
                phone: profile.whatsapp,
                address: profile.address
            });
            showSuccess = true;
            setTimeout(() => showSuccess = false, 3000);
        } catch (error: any) {
            errorMessage = error.message || 'Gagal menyimpan profil.';
        } finally {
            isSaving = false;
        }
    }

    function handleChangePassword() {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            passwordError = 'Semua field wajib diisi.';
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            passwordError = 'Password baru minimal 8 karakter.';
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            passwordError = 'Konfirmasi password tidak cocok.';
            return;
        }
        if (passwordForm.newPassword === passwordForm.currentPassword) {
            passwordError = 'Password baru tidak boleh sama dengan password lama.';
            return;
        }

        // Simulate success
        showPasswordModal = false;
        passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        passwordError = '';
        
        isSaving = true;
        setTimeout(() => {
            isSaving = false;
            showSuccess = true;
            setTimeout(() => showSuccess = false, 3000);
        }, 500);
    }
</script>

<div class="space-y-10">
    <header in:fly={{ y: -20, duration: 500 }}>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span class="text-[10px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-widest">Local Simulation Mode</span>
                </div>
                <h1 class="text-4xl font-black text-brand-charcoal dark:text-white tracking-tighter uppercase italic">Profil <span class="text-brand-primary">Saya</span> 👤</h1>
                <p class="text-zinc-500 font-medium mt-1 italic">Mode demo: Perubahan hanya tersimpan di memori browser lokal.</p>
            </div>
            
            {#if showSuccess}
                <div in:fade out:fade class="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Simulasi Berhasil Disimpan
                </div>
            {/if}
        </div>
    </header>

    <div class="grid lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2">
            <section class="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:border-brand-primary/20 transition-all">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 flex justify-between items-center">
                    <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase italic">Informasi Dasar</h2>
                    <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Local-Compatible</span>
                </div>
                <div class="p-10 space-y-8">
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="space-y-2">
                            <label for="profile-name" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                            <input id="profile-name" type="text" bind:value={profile.name} class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm" />
                        </div>
                        <div class="space-y-2">
                            <label for="profile-whatsapp" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">WhatsApp</label>
                            <input id="profile-whatsapp" type="tel" bind:value={profile.whatsapp} class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="profile-email" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email (Read-only)</label>
                        <input id="profile-email" type="email" bind:value={profile.email} readonly class="w-full px-6 py-5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none font-bold text-zinc-400 dark:text-zinc-500 text-sm cursor-not-allowed" />
                    </div>

                    <div class="space-y-2">
                        <label for="profile-address" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Alamat Utama</label>
                        <textarea id="profile-address" bind:value={profile.address} rows="3" class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white text-sm resize-none"></textarea>
                    </div>

                    <div class="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                        <p class="text-[10px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed">
                            💡 Alamat pengiriman sekarang dikelola secara terpisah di menu <strong>Alamat Saya</strong> untuk mendukung multi-lokasi yang lebih fleksibel.
                        </p>
                    </div>

                    <div class="pt-6 flex flex-col sm:flex-row gap-4">
                        <button 
                            onclick={handleSave} 
                            disabled={isSaving}
                            class="bg-brand-charcoal text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-charcoal/20 hover:bg-brand-primary transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {#if isSaving}
                                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Memproses...
                            {:else}
                                Simpan Simulasi
                            {/if}
                        </button>
                        <button 
                            onclick={() => {
                                profile.name = authStore.user?.name || '';
                                profile.whatsapp = authStore.user?.phone || '';
                                profile.address = authStore.user?.address || '';
                            }} 
                            class="px-10 py-5 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-brand-charcoal dark:hover:text-white transition-colors"
                        >
                            Reset Data
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <aside class="space-y-8">
            <!-- Account Status Card -->
            <div class="bg-brand-charcoal rounded-[3rem] p-10 text-white shadow-2xl shadow-brand-charcoal/40 border border-white/5 relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all"></div>
                
                <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 relative z-10">Status Akun</p>
                <div class="flex items-center gap-5 mb-10 relative z-10">
                    <div class="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center text-4xl font-black text-white italic shadow-2xl shadow-brand-primary/40 transform -rotate-3">
                        {getInitial(profile.name)}
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-black text-xl text-white truncate italic tracking-tighter">{profile.name}</h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p class="text-[10px] text-emerald-400 uppercase tracking-widest font-black italic">Aktif Account</p>
                        </div>
                        <p class="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-2">Member Sejak: {authStore.user?.created_at?.split('T')[0] || '-'}</p>
                    </div>
                </div>
                <div class="space-y-3 relative z-10">
                    <button 
                        onclick={() => showPasswordModal = true}
                        class="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        🔐 Ubah Password
                    </button>
                    <button 
                        onclick={() => alert("Simulasi: Akun katering Anda dijadwalkan untuk penghapusan (Hold Production).")}
                        class="w-full py-5 text-red-400/70 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/10 hover:text-red-400 rounded-2xl transition-all"
                    >
                        Hapus Akun
                    </button>
                </div>
            </div>

            <!-- Support Card -->
            <div class="p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 group hover:border-brand-primary/30 transition-all shadow-sm">
                <div class="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-inner group-hover:scale-110 transition-transform">
                    🤝
                </div>
                <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] mb-4 italic">Bantuan Akun</h3>
                <p class="text-xs text-zinc-500 mb-8 font-bold leading-relaxed italic">
                    Butuh bantuan terkait profil, pesanan, atau pembayaran? Tim CS kami siap melayani Anda.
                </p>
                
                <div class="space-y-6 mb-10">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-lg">📞</div>
                        <div>
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">WhatsApp CS</p>
                            <p class="text-xs font-black text-brand-charcoal dark:text-white">{mockBusinessProfile.whatsappDisplay}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-lg">🕒</div>
                        <div>
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Operasional</p>
                            <p class="text-xs font-black text-brand-charcoal dark:text-white">{mockBusinessProfile.operatingHours}</p>
                        </div>
                    </div>
                </div>

                <a 
                    href={mockBusinessProfile.whatsappUrl} 
                    target="_blank"
                    rel="noreferrer"
                    class="block w-full py-5 bg-emerald-500 text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                >
                    Hubungi CS Sekarang
                </a>
            </div>
        </aside>
    </div>
</div>

<!-- Change Password Modal -->
<Modal show={showPasswordModal} title="Ubah Password Keamanan" onClose={() => showPasswordModal = false} maxWidth="max-w-md">
    <div class="space-y-6">
        <div class="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-[2rem]">
            <p class="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Hold Production
            </p>
            <p class="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-bold leading-relaxed italic">
                Fitur ini masih simulasi frontend. Password yang Anda masukkan hanya diverifikasi secara lokal dan belum tersimpan ke server katering.
            </p>
        </div>

        {#if passwordError}
            <div in:fly={{ y: -10 }} class="p-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                <p class="text-xs font-bold text-red-600 dark:text-red-400">{passwordError}</p>
            </div>
        {/if}

        <div class="space-y-6">
            <div class="space-y-2">
                <label for="current-password" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Password Saat Ini</label>
                <input 
                    id="current-password"
                    type="password" 
                    bind:value={passwordForm.currentPassword}
                    class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                    placeholder="••••••••"
                />
            </div>
            <div class="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <label for="new-password" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Password Baru</label>
                <input 
                    id="new-password"
                    type="password" 
                    bind:value={passwordForm.newPassword}
                    class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                    placeholder="Min. 8 karakter"
                />
            </div>
            <div class="space-y-2">
                <label for="confirm-password" class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Konfirmasi Password Baru</label>
                <input 
                    id="confirm-password"
                    type="password" 
                    bind:value={passwordForm.confirmPassword}
                    class="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                    placeholder="Ulangi password baru"
                />
            </div>
        </div>

        <button 
            onclick={handleChangePassword}
            class="w-full py-6 bg-brand-charcoal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-charcoal/20 hover:bg-brand-primary transition-all mt-4"
        >
            Perbarui Password Simulasi
        </button>
    </div>
</Modal>

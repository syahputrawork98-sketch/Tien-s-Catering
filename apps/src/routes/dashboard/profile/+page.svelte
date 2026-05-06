<script lang="ts">
    import { mockUserProfile } from '$lib/mock/user';
    import { fade, fly } from 'svelte/transition';
    import Modal from '$lib/components/ui/Modal.svelte';

    let profile = $state({ ...mockUserProfile });

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

    function handleSave() {
        alert("Profil berhasil diperbarui (Simulasi).");
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

        alert("Password berhasil diperbarui (Simulasi).\n\nCatatan: Fitur ini masih simulasi frontend. Password belum tersimpan ke backend.");
        passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        passwordError = '';
        showPasswordModal = false;
    }
</script>

<div class="space-y-10">
    <header>
        <h1 class="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter">Profil Saya 👤</h1>
        <p class="text-zinc-500 font-medium mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
    </header>

    <div class="grid lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2">
            <section class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
                    <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight">Informasi Dasar</h2>
                </div>
                <div class="p-10 space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
                            <input type="text" bind:value={profile.name} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">WhatsApp</label>
                            <input type="tel" bind:value={profile.whatsapp} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Email</label>
                        <input type="email" bind:value={profile.email} class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white" />
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Alamat Default</label>
                        <textarea bind:value={profile.defaultAddress} rows="3" class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white resize-none"></textarea>
                    </div>

                    <div class="pt-4 flex gap-4">
                        <button onclick={handleSave} class="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all">Simpan Perubahan</button>
                        <button onclick={() => profile = {...mockUserProfile}} class="text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-brand-charcoal transition-colors">Reset</button>
                    </div>
                </div>
            </section>
        </div>

        <aside class="space-y-6">
            <!-- Account Status Card -->
            <div class="bg-brand-charcoal rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-charcoal/40 border border-white/5">
                <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Status Akun</p>
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-3xl font-black text-white italic shadow-lg shadow-brand-primary/20">
                        {getInitial(profile.name)}
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-black text-lg text-white truncate">{profile.name}</h3>
                        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Customer Aktif
                        </p>
                        <p class="text-[10px] text-zinc-500 font-medium mt-1">Bergabung: {profile.joinedAt}</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <button 
                        onclick={() => showPasswordModal = true}
                        class="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        Ubah Password
                    </button>
                    <button class="w-full py-4 text-red-400/70 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/10 hover:text-red-400 rounded-xl transition-all">Hapus Akun</button>
                </div>
            </div>

            <!-- Support Card -->
            <div class="p-10 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 group hover:border-brand-primary/30 transition-all">
                <div class="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm">
                    🤝
                </div>
                <h3 class="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest mb-3">Bantuan Akun</h3>
                <p class="text-xs text-zinc-500 mb-8 font-medium leading-relaxed">
                    Butuh bantuan terkait profil, pesanan, atau pembayaran? Tim CS kami siap melayani Anda.
                </p>
                
                <div class="space-y-4 mb-8">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">📞</span>
                        <div>
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp CS</p>
                            <p class="text-xs font-bold text-brand-charcoal dark:text-white">+62 812-3456-7890</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-lg">🕒</span>
                        <div>
                            <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Operasional</p>
                            <p class="text-xs font-bold text-brand-charcoal dark:text-white">Sen - Sab (08:00 - 17:00)</p>
                        </div>
                    </div>
                </div>

                <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank"
                    rel="noreferrer"
                    class="block w-full py-5 bg-brand-primary text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                >
                    Hubungi CS via WhatsApp
                </a>
            </div>
        </aside>
    </div>
</div>

<!-- Change Password Modal -->
<Modal show={showPasswordModal} title="Ubah Password Keamanan" onClose={() => showPasswordModal = false} maxWidth="max-w-md">
    <div class="space-y-6">
        <div class="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
            <p class="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                ⚠️ Catatan: Fitur ini masih simulasi frontend. Password yang Anda masukkan belum tersimpan ke server katering.
            </p>
        </div>

        {#if passwordError}
            <div in:fly={{ y: -10 }} class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                <p class="text-xs font-bold text-red-600 dark:text-red-400">{passwordError}</p>
            </div>
        {/if}

        <div class="space-y-4">
            <div>
                <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Password Saat Ini</label>
                <input 
                    type="password" 
                    bind:value={passwordForm.currentPassword}
                    class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                    placeholder="••••••••"
                />
            </div>
            <div class="pt-4 border-t border-zinc-50 dark:border-zinc-800">
                <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Password Baru</label>
                <input 
                    type="password" 
                    bind:value={passwordForm.newPassword}
                    class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                    placeholder="Min. 8 karakter"
                />
            </div>
            <div>
                <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Konfirmasi Password Baru</label>
                <input 
                    type="password" 
                    bind:value={passwordForm.confirmPassword}
                    class="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-charcoal dark:text-white"
                    placeholder="Ulangi password baru"
                />
            </div>
        </div>

        <button 
            onclick={handleChangePassword}
            class="w-full py-5 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
        >
            Perbarui Password
        </button>
    </div>
</Modal>

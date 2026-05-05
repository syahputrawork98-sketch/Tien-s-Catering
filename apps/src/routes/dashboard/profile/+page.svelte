<script lang="ts">
    import { mockUserProfile } from '$lib/mock/user';
    import { fade } from 'svelte/transition';

    let profile = $state({ ...mockUserProfile });

    function handleSave() {
        alert("Profil berhasil diperbarui (Simulasi).");
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
            <div class="bg-brand-charcoal rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-charcoal/40">
                <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Account Status</p>
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-3xl font-black italic">G</div>
                    <div>
                        <h3 class="font-black text-lg">Premium User</h3>
                        <p class="text-xs text-zinc-400">Bergabung: {profile.joinedAt}</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <button class="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Ubah Password</button>
                    <button class="w-full py-4 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-400/10 rounded-xl transition-all">Hapus Akun</button>
                </div>
            </div>

            <div class="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                <h3 class="text-xs font-black text-brand-charcoal dark:text-white uppercase tracking-widest mb-4">Bantuan</h3>
                <p class="text-xs text-zinc-500 mb-6 font-medium">Butuh bantuan terkait data akun Anda? Hubungi tim support kami.</p>
                <a href="https://wa.me/081234567890" class="block w-full py-4 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-center rounded-xl text-xs font-black uppercase tracking-widest hover:border-brand-primary transition-all">Contact Support</a>
            </div>
        </aside>
    </div>
</div>

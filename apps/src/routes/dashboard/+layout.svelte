<script lang="ts">
    import { onMount } from 'svelte';
    import { mockSession } from '$lib/stores/mockSession.svelte';
    import { dashboardNavigation } from '$lib/config/navigation';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import { mockAccounts } from '$lib/mock/accounts';
    import type { MockRole } from '$lib/mock/session';

    let { children } = $props();
    let isSidebarOpen = $state(false);

    onMount(() => {
        mockSession.init();
    });

    const navItems = $derived(dashboardNavigation[mockSession.role] || []);

    function switchRole(role: MockRole) {
        mockSession.setRole(role);
        if (role === 'ADMIN') goto('/dashboard/admin');
        else if (role === 'CUSTOMER_SERVICE') goto('/dashboard/cs');
        else goto('/dashboard');
    }
</script>

<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col lg:flex-row">
    <!-- Mobile Header -->
    <header class="lg:hidden bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg">T</div>
            <span class="font-black text-brand-charcoal dark:text-white tracking-tighter">Dashboard</span>
        </div>
        <button aria-label="Buka Sidebar" onclick={() => isSidebarOpen = !isSidebarOpen} class="p-2 text-zinc-500">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        </button>
    </header>

    <!-- Sidebar Overlay -->
    {#if isSidebarOpen}
        <div 
            role="button"
            tabindex="0"
            class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
            onclick={() => isSidebarOpen = false}
            onkeydown={(e) => e.key === 'Escape' && (isSidebarOpen = false)}
            transition:fade
        ></div>
    {/if}

    <!-- Sidebar -->
    <aside 
        class="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 z-50 transition-transform duration-300 lg:sticky lg:translate-x-0 
               {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
        <div class="h-full flex flex-col">
            <!-- Logo Area -->
            <div class="p-8 hidden lg:block">
                <a href="/" class="flex items-center gap-3 group">
                    <div class="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform">T</div>
                    <span class="text-xl font-black text-brand-charcoal dark:text-white tracking-tighter">Tien's<span class="text-brand-primary"> Catering</span></span>
                </a>
            </div>

            <!-- User Info Card -->
            <div class="px-6 py-4 mx-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-8">
                <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Active User</p>
                <h3 class="font-black text-brand-charcoal dark:text-white truncate">{mockSession.user.name}</h3>
                <span class="inline-block mt-2 px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase rounded-md tracking-widest border border-brand-primary/20">
                    {mockSession.role.replace('_', ' ')}
                </span>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
                {#each navItems as item}
                    <a 
                        href={item.href}
                        class="flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all
                               {page.url.pathname === item.href 
                                 ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                                 : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:text-zinc-400'}"
                    >
                        {item.label}
                    </a>
                {/each}
            </nav>

            <!-- Role & Account Switcher (Dev Only) -->
            <div class="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                <div class="mb-4 text-center">
                    <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Dev Persona Switcher</p>
                    <p class="text-[7px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tighter">Bukan Login Production • Local Only</p>
                </div>
                
                <div class="space-y-4">
                    <!-- Role Select -->
                    <div class="flex flex-col gap-2">
                        <button 
                            onclick={() => switchRole('USER')}
                            class="text-[10px] font-black py-2 rounded-lg transition-all {mockSession.role === 'USER' ? 'bg-brand-charcoal text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700'}"
                        >
                            CUSTOMER
                        </button>
                        <button 
                            onclick={() => switchRole('CUSTOMER_SERVICE')}
                            class="text-[10px] font-black py-2 rounded-lg transition-all {mockSession.role === 'CUSTOMER_SERVICE' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700'}"
                        >
                            CS
                        </button>
                        <button 
                            onclick={() => switchRole('ADMIN')}
                            class="text-[10px] font-black py-2 rounded-lg transition-all {mockSession.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700'}"
                        >
                            ADMIN
                        </button>
                    </div>

                    <!-- Account Select (Dynamic) -->
                    <div class="space-y-1">
                        <label for="accSelect" class="text-[8px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Pilih Akun Demo:</label>
                        <select 
                            id="accSelect"
                            value={mockSession.user.id}
                            onchange={(e) => mockSession.setAccountId(e.currentTarget.value)}
                            class="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg px-2 py-2 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                            {#each mockAccounts.filter(a => a.role === mockSession.role) as acc}
                                <option value={acc.id}>{acc.name} ({acc.status})</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <button 
                    onclick={() => { localStorage.clear(); location.href = '/'; }}
                    class="w-full mt-4 text-[10px] font-black text-red-500 hover:bg-red-50 py-2 rounded-lg transition-all uppercase tracking-widest"
                >
                    Clear Simulation
                </button>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 lg:p-10 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -z-10"></div>
        
        <div in:fade={{ duration: 400 }}>
            {@render children()}
        </div>
    </main>
</div>

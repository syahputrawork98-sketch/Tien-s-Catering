<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cart } from '$lib/stores/cartStore.svelte';

  let scrolled = $state(false);

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 50;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const links = [
    { name: 'Katalog', href: '#katalog' },
    { name: 'Paket Catering', href: '#paket' },
    { name: 'Tentang Kami', href: '#tentang-kami' },
    { name: 'Kontak', href: '#kontak' }
  ];
</script>

<nav 
  class="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b
         {scrolled 
           ? 'bg-white/80 backdrop-blur-xl border-zinc-100 py-4 shadow-sm' 
           : 'bg-transparent border-transparent py-6'}"
>
  <div class="container mx-auto px-6 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-300">G</div>
      <span class="text-xl font-black tracking-tighter {scrolled ? 'text-brand-charcoal' : 'text-white'} transition-colors">
        Gourmet<span class="text-brand-primary">Hub</span>
      </span>
    </a>

    <!-- Mid Links -->
    <div class="hidden md:flex items-center gap-10">
      {#each links as link}
        <a 
          href={link.href} 
          class="text-xs font-black uppercase tracking-widest transition-all hover:text-brand-primary
                 {scrolled ? 'text-zinc-500' : 'text-white/80 hover:text-white'}"
        >
          {link.name}
        </a>
      {/each}
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-4">
      <button 
        onclick={() => cart.toggleDrawer()}
        class="relative p-2 rounded-xl transition-all {scrolled ? 'text-brand-charcoal hover:bg-zinc-100' : 'text-white hover:bg-white/10'}"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {#if cart.totalItems > 0}
          <span class="absolute top-0 right-0 w-5 h-5 bg-brand-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 {scrolled ? 'border-white' : 'border-brand-charcoal'}">
            {cart.totalItems}
          </span>
        {/if}
      </button>

      <a 
        href="/login" 
        class="hidden sm:block text-xs font-black uppercase tracking-widest px-6 py-2 transition-all hover:text-brand-primary
               {scrolled ? 'text-zinc-500' : 'text-white/80 hover:text-white'}"
      >
        Login
      </a>
      <a 
        href="/register" 
        class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20
               {scrolled 
                 ? 'bg-brand-charcoal text-white hover:bg-zinc-800' 
                 : 'bg-brand-primary text-white hover:bg-orange-600'}"
      >
        Daftar
      </a>
      
      <!-- Mobile Menu Button (Icon Placeholder) -->
      <button class="md:hidden p-2 {scrolled ? 'text-brand-charcoal' : 'text-white'}">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>
  </div>
</nav>

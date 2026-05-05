<script lang="ts">
    import { theme } from '$lib/stores/theme.svelte';
    import { fade } from 'svelte/transition';
</script>

<button 
    onclick={() => theme.toggle()}
    class="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/10 text-brand-charcoal dark:text-white hover:ring-2 hover:ring-brand-primary transition-all shadow-sm"
    aria-label="Toggle Theme"
>
    {#if theme.current === 'light'}
        <div in:fade={{ duration: 200 }}>
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </div>
    {:else}
        <div in:fade={{ duration: 200 }}>
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
    {/if}
</button>

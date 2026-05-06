<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    interface Props {
        show: boolean;
        title: string;
        onClose: () => void;
        children?: import('svelte').Snippet;
        footer?: import('svelte').Snippet;
        maxWidth?: string;
    }

    let { show, title, onClose, children, footer, maxWidth = 'max-w-2xl' }: Props = $props();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && show) {
            onClose();
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    });
</script>

{#if show}
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        transition:fade={{ duration: 200 }}
    >
        <div 
            class="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
            onclick={onClose}
            aria-hidden="true"
        ></div>

        <!-- Modal Content -->
        <div 
            class="bg-white dark:bg-zinc-900 w-full {maxWidth} rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            transition:fly={{ y: 20, duration: 400, opacity: 0 }}
        >
            <!-- Header -->
            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight italic">{title}</h2>
                <button 
                    onclick={onClose}
                    class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                    aria-label="Close modal"
                >
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="px-8 py-8 overflow-y-auto no-scrollbar flex-1">
                {@render children?.()}
            </div>

            <!-- Footer -->
            {#if footer}
                <div class="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
                    {@render footer()}
                </div>
            {/if}
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

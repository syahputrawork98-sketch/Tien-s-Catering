<script lang="ts">
    let { 
        message = "Belum ada data.", 
        description = "", 
        icon = "📦" 
    } = $props<{ message?: string, description?: string, icon?: string }>();
</script>

<div class="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
    <div class="text-5xl mb-4">{icon}</div>
    <h3 class="text-xl font-black text-brand-charcoal dark:text-white tracking-tight">{message}</h3>
    {#if description}
        <p class="text-zinc-500 text-sm mt-2 font-medium text-center max-w-xs">{description}</p>
    {/if}
</div>

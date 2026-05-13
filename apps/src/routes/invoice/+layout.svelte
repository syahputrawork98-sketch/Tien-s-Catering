<script lang="ts">
    import '../layout.css';
    let { children } = $props();
</script>

<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 print:bg-white transition-colors">
    {@render children()}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>

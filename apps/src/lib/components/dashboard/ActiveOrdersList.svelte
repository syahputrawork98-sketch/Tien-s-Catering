<script lang="ts">
    import OrderCard from './OrderCard.svelte';
    import EmptyState from './EmptyState.svelte';
    import type { Order } from '$lib/mock/orders_dashboard';

    let { orders = [], onDetail } = $props<{ orders: Order[], onDetail: (id: string) => void }>();

    const activeOrders = $derived(orders.filter((o: Order) => o.type === 'active'));
</script>

<div class="space-y-6">
    {#if activeOrders.length > 0}
        {#each activeOrders as order (order.id)}
            <OrderCard {order} {onDetail} />
        {/each}
    {:else}
        <EmptyState 
            message="Belum ada pesanan yang sedang berjalan." 
            description="Silakan pilih paket katering favorit Anda di menu Katalog."
        />
    {/if}
</div>

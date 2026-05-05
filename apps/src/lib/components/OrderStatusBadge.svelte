<script lang="ts">
    let { status = "PENDING" } = $props<{ status: string }>();

    const configs = {
        PENDING: {
            label: "Menunggu",
            classes: "bg-amber-100 text-amber-700 border-amber-200"
        },
        PAID: {
            label: "Sudah Bayar",
            classes: "bg-blue-100 text-blue-700 border-blue-200"
        },
        PROCESSING: {
            label: "Diproses",
            classes: "bg-indigo-100 text-indigo-700 border-indigo-200"
        },
        SHIPPED: {
            label: "Dikirim",
            classes: "bg-purple-100 text-purple-700 border-purple-200"
        },
        COMPLETED: {
            label: "Selesai",
            classes: "bg-emerald-100 text-emerald-700 border-emerald-200"
        },
        CANCELLED: {
            label: "Dibatalkan",
            classes: "bg-red-100 text-red-700 border-red-200"
        }
    } as const;

    const config = $derived(configs[status as keyof typeof configs] || configs.PENDING);
</script>

<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border {config.classes} inline-flex items-center shadow-sm">
    <span class="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
    {config.label}
</span>

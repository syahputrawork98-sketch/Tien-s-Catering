<script>
  let { currentStatus = "PENDING" } = $props();

  const steps = [
    { id: "PENDING", label: "Dipesan" },
    { id: "PAID", label: "Dibayar" },
    { id: "PROCESSING", label: "Dapur" },
    { id: "SHIPPED", label: "Dikirim" },
    { id: "COMPLETED", label: "Selesai" }
  ];

  const currentIndex = $derived(steps.findIndex(s => s.id === currentStatus));
</script>

<div class="w-full py-6">
  <div class="relative flex items-center justify-between">
    <!-- Background Line -->
    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-100 rounded-full z-0"></div>
    
    <!-- Active Progress Line -->
    <div 
      class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary rounded-full z-10 transition-all duration-700 ease-out"
      style="width: {(currentIndex / (steps.length - 1)) * 100}%"
    ></div>

    {#each steps as step, i}
      <div class="relative z-20 flex flex-col items-center">
        <!-- Step Dot -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                 {i <= currentIndex 
                   ? 'bg-brand-primary border-white text-white shadow-lg shadow-brand-primary/20 scale-110' 
                   : 'bg-white border-zinc-100 text-zinc-300'}"
        >
          {#if i < currentIndex}
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            <span class="text-xs font-black">{i + 1}</span>
          {/if}
        </div>
        
        <!-- Label -->
        <span 
          class="absolute top-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider
                 {i <= currentIndex ? 'text-brand-charcoal' : 'text-zinc-400'}"
        >
          {step.label}
        </span>
      </div>
    {/each}
  </div>
</div>

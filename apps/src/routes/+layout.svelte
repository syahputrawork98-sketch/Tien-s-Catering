<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import CartDrawer from '$lib/components/CartDrawer.svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
		authStore.init();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<CartDrawer />

{@render children()}

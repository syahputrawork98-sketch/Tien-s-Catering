<script lang="ts">
	import { mockSession } from '$lib/stores/mockSession.svelte';
	import { goto } from '$app/navigation';
	import type { MockRole } from '$lib/mock/session';

	let loading = $state(false);
	let phone = $state('');
	let password = $state('');

	function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		setTimeout(() => {
			mockSession.setRole('USER');
			goto('/dashboard');
			loading = false;
		}, 1000);
	}

	function quickLogin(role: MockRole) {
		mockSession.setRole(role);
		if (role === 'ADMIN') goto('/dashboard/admin');
		else if (role === 'CUSTOMER_SERVICE') goto('/dashboard/cs');
		else goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Masuk | Tien's Catering Premium</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
		<div class="text-center">
			<a href="/" class="mx-auto w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-lg shadow-brand-primary/20">G</a>
			<h2 class="text-3xl font-extrabold tracking-tight text-brand-charcoal dark:text-white">
				Selamat Datang Kembali
			</h2>
			<p class="mt-2 text-sm text-zinc-500">
				Silakan masuk ke akun katering Anda
			</p>
		</div>

		<form class="mt-8 space-y-6" onsubmit={handleLogin}>
			<div class="-space-y-px rounded-md shadow-sm">
				<div class="mb-4">
					<label for="phone" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 px-1 mb-2 uppercase tracking-widest text-[10px] font-black">Nomor Telepon</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						bind:value={phone}
						required
						class="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:text-sm font-bold"
						placeholder="08123456789"
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 px-1 mb-2 uppercase tracking-widest text-[10px] font-black">Kata Sandi</label>
					<input
						id="password"
						name="password"
						type="password"
						bind:value={password}
						required
						class="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:text-sm font-bold"
						placeholder="••••••••"
					/>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<input
						id="remember-me"
						name="remember-me"
						type="checkbox"
						class="h-4 w-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary dark:border-zinc-700"
					/>
					<label for="remember-me" class="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">Ingat saya</label>
				</div>

				<div class="text-sm">
					<button type="button" onclick={() => alert("Fitur lupa kata sandi belum tersedia.")} class="font-medium text-brand-primary hover:text-brand-primary/80">Lupa kata sandi?</button>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={loading}
					class="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
				>
					{#if loading}
						<span class="mr-2">Memproses...</span>
					{:else}
						Masuk Ke Akun
					{/if}
				</button>
			</div>
		</form>

		<p class="text-center text-sm text-zinc-600 dark:text-zinc-400 pt-4">
			Belum punya akun?
			<a href="/register" class="font-black text-brand-primary hover:underline">Daftar sekarang</a>
		</p>

		<!-- Quick Access Tabs for Testing -->
		<div class="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800">
			<p class="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center mb-6">Quick Access (Dev Only)</p>
			<div class="grid grid-cols-3 gap-3">
				<button 
					type="button"
					onclick={() => quickLogin('ADMIN')}
					class="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:border-brand-primary transition-all group"
				>
					<div class="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-brand-primary group-hover:text-white transition-colors">A</div>
					<span class="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase">Admin</span>
				</button>

				<button 
					type="button"
					onclick={() => quickLogin('CUSTOMER_SERVICE')}
					class="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:border-blue-500 transition-all group"
				>
					<div class="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-blue-500 group-hover:text-white transition-colors">CS</div>
					<span class="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase">CS</span>
				</button>

				<button 
					type="button"
					onclick={() => quickLogin('USER')}
					class="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:border-green-500 transition-all group"
				>
					<div class="w-8 h-8 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-green-500 group-hover:text-white transition-colors">U</div>
					<span class="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase">User</span>
				</button>
			</div>
		</div>
	</div>
</div>

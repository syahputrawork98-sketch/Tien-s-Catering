import { authService, type AuthUser } from '$lib/services/auth';
import { browser } from '$app/environment';

let currentUser = $state<AuthUser | null>(null);
let isLoading = $state(true);

export const authStore = {
	get user() {
		return currentUser;
	},

	get isAuthenticated() {
		return !!currentUser;
	},

	get loading() {
		return isLoading;
	},

	async init() {
		if (!browser) return;
		try {
			currentUser = await authService.me();
		} catch (error) {
			console.error('Failed to init auth store:', error);
			currentUser = null;
		} finally {
			isLoading = false;
		}
	},

	async login(email: string, password: string) {
		currentUser = await authService.login(email, password);
		return currentUser;
	},

	async register(name: string, email: string, password: string) {
		currentUser = await authService.register(name, email, password);
		return currentUser;
	},

	async logout() {
		await authService.logout();
		currentUser = null;
	},
 
	async updateProfile(data: Partial<AuthUser>) {
		const updated = await authService.updateProfile(data);
		if (updated) {
			currentUser = updated;
		}
		return updated;
	}
};

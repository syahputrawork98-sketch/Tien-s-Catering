export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: 'CUSTOMER' | 'ADMIN' | 'CS';
}

export const authService = {
	async register(name: string, email: string, password: string): Promise<AuthUser> {
		const res = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.error || 'Registration failed');
		}

		return res.json();
	},

	async login(email: string, password: string): Promise<AuthUser> {
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.error || 'Login failed');
		}

		return res.json();
	},

	async me(): Promise<AuthUser | null> {
		const res = await fetch('/api/auth/me');
		if (!res.ok) return null;
		const data = await res.json();
		return data.user;
	},

	async logout(): Promise<void> {
		await fetch('/api/auth/logout', { method: 'POST' });
	}
};

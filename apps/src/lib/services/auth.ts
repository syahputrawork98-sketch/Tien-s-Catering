export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: 'CUSTOMER' | 'ADMIN' | 'CS';
	phone?: string | null;
	address?: string | null;
	created_at?: string;
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
			throw new Error(data.message || 'Pendaftaran gagal.');
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
			throw new Error(data.message || 'Login gagal.');
		}

		return res.json();
	},

	async me(): Promise<AuthUser | null> {
		try {
			const res = await fetch('/api/auth/me');
			if (res.status === 401) return null;
			if (!res.ok) return null;
			const data = await res.json();
			return data.user;
		} catch (error) {
			console.error('API Error (me):', error);
			return null;
		}
	},

	async logout(): Promise<void> {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} catch (error) {
			console.error('Logout API failed:', error);
		}
	},

	async updateProfile(data: Partial<AuthUser>): Promise<AuthUser | null> {
		const res = await fetch('/api/auth/me', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (res.status === 401) {
			throw new Error('Sesi Anda telah berakhir. Silakan pilih akun kembali.');
		}

		if (!res.ok) {
			const errorData = await res.json();
			throw new Error(errorData.message || 'Gagal memperbarui profil.');
		}
		const result = await res.json();
		return result.user;
	}
};

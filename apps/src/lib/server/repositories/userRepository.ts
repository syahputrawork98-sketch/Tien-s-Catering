import { getDatabase } from '$lib/server/db/client';
import type { Database } from 'better-sqlite3';

export interface User {
	id: string;
	name: string;
	email: string;
	password_hash: string;
	role: 'CUSTOMER' | 'ADMIN' | 'CS';
	phone: string | null;
	address: string | null;
	created_at: string;
	updated_at: string;
}

export class UserRepository {
	private db: Database;

	constructor() {
		this.db = getDatabase();
	}

	findByEmail(email: string): User | null {
		const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
		const user = stmt.get(email) as User | undefined;
		return user || null;
	}

	findById(id: string): User | null {
		const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
		const user = stmt.get(id) as User | undefined;
		return user || null;
	}

	create(user: Omit<User, 'created_at' | 'updated_at'>): User {
		const now = new Date().toISOString();
		const stmt = this.db.prepare(`
			INSERT INTO users (id, name, email, password_hash, role, phone, address, created_at, updated_at)
			VALUES (@id, @name, @email, @password_hash, @role, @phone, @address, @created_at, @updated_at)
		`);

		const newUser = {
			...user,
			phone: (user as any).phone ?? null,
			address: (user as any).address ?? null,
			created_at: now,
			updated_at: now
		};

		stmt.run(newUser);
		return newUser as User;
	}

	update(id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): User | null {
		const existing = this.findById(id);
		if (!existing) return null;

		const now = new Date().toISOString();
		const updated = { ...existing, ...data, updated_at: now };

		const fields = Object.keys(data).map((k) => `${k} = @${k}`).join(', ');
		const stmt = this.db.prepare(`
			UPDATE users 
			SET ${fields}, updated_at = @updated_at 
			WHERE id = @id
		`);

		stmt.run({ ...data, id, updated_at: now });
		return updated;
	}
}

export const userRepository = new UserRepository();

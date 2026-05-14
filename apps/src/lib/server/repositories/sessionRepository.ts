import { getDatabase } from '$lib/server/db/client';
import type { Database } from 'better-sqlite3';

export interface Session {
	id: string;
	user_id: string;
	token: string;
	expires_at: string;
	created_at: string;
}

export class SessionRepository {
	private db: Database;

	constructor() {
		this.db = getDatabase();
	}

	create(session: Omit<Session, 'created_at'>): Session {
		const now = new Date().toISOString();
		const stmt = this.db.prepare(`
			INSERT INTO sessions (id, user_id, token, expires_at, created_at)
			VALUES (@id, @user_id, @token, @expires_at, @created_at)
		`);

		const newSession = {
			...session,
			created_at: now
		};

		stmt.run(newSession);
		return newSession as Session;
	}

	findByToken(token: string): Session | null {
		const stmt = this.db.prepare('SELECT * FROM sessions WHERE token = ?');
		const session = stmt.get(token) as Session | undefined;
		return session || null;
	}

	deleteByToken(token: string): void {
		const stmt = this.db.prepare('DELETE FROM sessions WHERE token = ?');
		stmt.run(token);
	}

	deleteExpired(): void {
		const now = new Date().toISOString();
		const stmt = this.db.prepare('DELETE FROM sessions WHERE expires_at < ?');
		stmt.run(now);
	}
}

export const sessionRepository = new SessionRepository();

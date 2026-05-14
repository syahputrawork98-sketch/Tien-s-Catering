import { userRepository, type User } from '$lib/server/repositories/userRepository';
import { sessionRepository, type Session } from '$lib/server/repositories/sessionRepository';
import bcrypt from 'bcryptjs';

export class AuthService {
	async register(name: string, email: string, password: string): Promise<User> {
		const existing = userRepository.findByEmail(email);
		if (existing) {
			throw new Error('Email already registered');
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const id = globalThis.crypto.randomUUID();

		return userRepository.create({
			id,
			name,
			email,
			password_hash: passwordHash,
			role: 'CUSTOMER',
			phone: null,
			address: null
		});
	}

	async login(email: string, password: string): Promise<User | null> {
		const user = userRepository.findByEmail(email);
		if (!user) return null;

		const isValid = await bcrypt.compare(password, user.password_hash);
		if (!isValid) return null;

		return user;
	}

	async createSession(userId: string): Promise<Session> {
		const token = globalThis.crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

		return sessionRepository.create({
			id: globalThis.crypto.randomUUID(),
			user_id: userId,
			token,
			expires_at: expiresAt
		});
	}

	async validateSession(token: string): Promise<User | null> {
		const session = sessionRepository.findByToken(token);
		if (!session) return null;

		if (new Date(session.expires_at) < new Date()) {
			sessionRepository.deleteByToken(token);
			return null;
		}

		return userRepository.findById(session.user_id);
	}

	async logout(token: string): Promise<void> {
		sessionRepository.deleteByToken(token);
	}

	async updateProfile(userId: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
		const allowedFields = ['name', 'phone', 'address'];
		const filteredData: any = {};
		for (const field of allowedFields) {
			if (data[field as keyof typeof data] !== undefined) {
				filteredData[field] = data[field as keyof typeof data];
			}
		}

		if (Object.keys(filteredData).length === 0) {
			return userRepository.findById(userId);
		}

		return userRepository.update(userId, filteredData);
	}

	getUserById(id: string): User | null {
		return userRepository.findById(id);
	}
}

export const authService = new AuthService();

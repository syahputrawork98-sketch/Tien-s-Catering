import { userRepository, type User } from '$lib/server/repositories/userRepository';
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
			role: 'CUSTOMER'
		});
	}

	async login(email: string, password: string): Promise<User | null> {
		const user = userRepository.findByEmail(email);
		if (!user) return null;

		const isValid = await bcrypt.compare(password, user.password_hash);
		if (!isValid) return null;

		return user;
	}

	getUserById(id: string): User | null {
		return userRepository.findById(id);
	}
}

export const authService = new AuthService();

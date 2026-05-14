import { json } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';
import type { User } from '$lib/server/repositories/userRepository';

export async function getCurrentUser(cookies: Cookies): Promise<User | null> {
	const token = cookies.get('session_token');
	if (!token) return null;

	return authService.validateSession(token);
}

export async function requireAuth(cookies: Cookies): Promise<{ user?: User; error?: Response }> {
	const user = await getCurrentUser(cookies);
	if (!user) {
		return { error: json({ message: 'Unauthorized. Please login first.' }, { status: 401 }) };
	}
	return { user };
}

export async function requireRole(cookies: Cookies, allowedRoles: User['role'][]): Promise<{ user?: User; error?: Response }> {
	const { user, error } = await requireAuth(cookies);
	if (error) return { error };
	if (!user) return { error: json({ message: 'Unauthorized' }, { status: 401 }) };

	if (!allowedRoles.includes(user.role)) {
		return { error: json({ message: 'Forbidden. You do not have access to this resource.' }, { status: 403 }) };
	}
	return { user };
}

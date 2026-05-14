import { json, type RequestHandler } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('session_token');
	if (!token) {
		return json({ user: null });
	}

	const user = await authService.validateSession(token);
	if (!user) {
		cookies.delete('session_token', { path: '/' });
		return json({ user: null });
	}

	const { password_hash, ...safeUser } = user;
	return json({ user: safeUser });
};

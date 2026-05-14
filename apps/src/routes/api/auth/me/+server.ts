import { json, type RequestHandler } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';

export const GET: RequestHandler = async ({ cookies }) => {
	const userId = cookies.get('session_user_id');
	if (!userId) {
		return json({ user: null });
	}

	const user = authService.getUserById(userId);
	if (!user) {
		cookies.delete('session_user_id', { path: '/' });
		return json({ user: null });
	}

	const { password_hash, ...safeUser } = user;
	return json({ user: safeUser });
};

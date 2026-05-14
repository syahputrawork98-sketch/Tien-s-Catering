import { json, type RequestHandler } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('session_token');
	if (token) {
		await authService.logout(token);
	}

	cookies.delete('session_token', { path: '/' });
	cookies.delete('session_user_id', { path: '/' }); // Clean up old cookie
	return json({ success: true });
};

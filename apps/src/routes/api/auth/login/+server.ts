import { json, type RequestHandler } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		const user = await authService.login(email, password);
		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Set a simple cookie for minimal session
		cookies.set('session_user_id', user.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		const { password_hash, ...safeUser } = user;
		return json(safeUser);
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

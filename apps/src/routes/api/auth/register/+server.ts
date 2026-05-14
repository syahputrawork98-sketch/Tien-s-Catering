import { json, type RequestHandler } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password too short' }, { status: 400 });
		}

		const user = await authService.register(name, email, password);

		// Minimal: exclude password hash from response
		const { password_hash, ...safeUser } = user;
		return json(safeUser);
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

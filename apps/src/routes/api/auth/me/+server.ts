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

export const PATCH: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('session_token');
	if (!token) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const user = await authService.validateSession(token);
	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const updatedUser = await authService.updateProfile(user.id, data);
		if (!updatedUser) {
			return json({ message: 'User not found' }, { status: 404 });
		}

		const { password_hash, ...safeUser } = updatedUser;
		return json({ user: safeUser });
	} catch (error: any) {
		return json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
};

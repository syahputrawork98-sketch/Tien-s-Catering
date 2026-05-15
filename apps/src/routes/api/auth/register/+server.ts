import { json, type RequestHandler } from '@sveltejs/kit';
import { authService } from '$lib/server/services/authService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return json({ message: 'Data pendaftaran tidak lengkap.' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ message: 'Kata sandi minimal 6 karakter.' }, { status: 400 });
		}

		const user = await authService.register(name, email, password);

		// Minimal: exclude password hash from response
		const { password_hash, ...safeUser } = user;
		return json(safeUser);
	} catch (error: any) {
		return json({ message: error.message }, { status: 400 });
	}
};

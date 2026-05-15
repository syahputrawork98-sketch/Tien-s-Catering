import { json } from '@sveltejs/kit';
import { createPackage, getReadOnlyPackages } from '$lib/server/services/packageService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const items = getReadOnlyPackages();
		return json({ items });
	} catch (error) {
		console.error('Failed to fetch local packages.', error);
		return json({ message: 'Gagal mengambil data paket.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { requireRole } = await import('$lib/server/utils/authGuard');
	const { user, error } = await requireRole(cookies, ['ADMIN', 'CS']);
	if (error) return error;

	let payload: any;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = createPackage(payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({
			item: result.item,
			actorRole: user?.role,
			actorAccountId: user?.id
		}, { status: 201 });
	} catch (err) {
		console.error('Failed to create package.', err);
		return json({ message: 'Gagal membuat paket.' }, { status: 500 });
	}
};

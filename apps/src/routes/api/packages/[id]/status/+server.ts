import { json } from '@sveltejs/kit';
import { updatePackageStatus } from '$lib/server/services/packageService';
import { requireRole } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
	const { user, error: authError } = await requireRole(cookies, ['ADMIN', 'CS']);
	if (authError) return authError;

	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = updatePackageStatus(params.id, payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({
			item: result.item,
			actorRole: user?.role,
			actorAccountId: user?.id
		});
	} catch (error) {
		console.error('Failed to update package status.', error);
		return json({ message: 'Gagal memperbarui status paket.' }, { status: 500 });
	}
};

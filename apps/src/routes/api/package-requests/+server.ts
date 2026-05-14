import { json } from '@sveltejs/kit';
import { createPackageRequest, getPackageRequests } from '$lib/server/services/packageRequestService';
import { requireAuth } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const { user, error } = await requireAuth(cookies);
	if (error) return error;

	try {
		const queryUserId = url.searchParams.get('userId');

		if (user!.role === 'CUSTOMER') {
			if (!queryUserId || queryUserId !== user!.id) {
				return json({ message: 'Forbidden. You can only view your own package requests.' }, { status: 403 });
			}
		}

		const items = getPackageRequests(queryUserId ? { userId: queryUserId } : undefined);
		return json({ items });
	} catch (err) {
		console.error('Failed to fetch package requests.', err);
		return json({ message: 'Gagal mengambil data request paket.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { getCurrentUser } = await import('$lib/server/utils/authGuard');
	const user = await getCurrentUser(cookies);

	let payload: any;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	if (payload.userId && (!user || payload.userId !== user.id)) {
		if (!user || (user.role !== 'ADMIN' && user.role !== 'CS')) {
			return json({ message: 'Forbidden. Invalid userId assignment.' }, { status: 403 });
		}
	}

	try {
		const result = createPackageRequest(payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: 400 });
		}

		return json({ request: result.request }, { status: 201 });
	} catch (err) {
		console.error('Failed to create package request.', err);
		return json({ message: 'Gagal membuat request paket.' }, { status: 500 });
	}
};

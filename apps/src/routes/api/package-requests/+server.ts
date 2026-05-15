import { json } from '@sveltejs/kit';
import { createPackageRequest, getPackageRequests } from '$lib/server/services/packageRequestService';
import { requireAuth, getCurrentUser } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const { user, error } = await requireAuth(cookies);
	if (error) return error;

	try {
		const queryUserId = url.searchParams.get('userId');

		if (user!.role === 'CUSTOMER') {
			if (!queryUserId || queryUserId !== user!.id) {
				return json({ message: 'Forbidden. Anda hanya dapat melihat request paket milik sendiri.' }, { status: 403 });
			}
		}

		const items = getPackageRequests(queryUserId ? { userId: queryUserId } : undefined);
		return json({
			items,
			actorRole: user?.role,
			actorAccountId: user?.id
		});
	} catch (err) {
		console.error('Failed to fetch package requests.', err);
		return json({ message: 'Gagal mengambil data request paket.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const user = await getCurrentUser(cookies);

	let payload: any;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Format JSON tidak valid.' }, { status: 400 });
	}

	if (payload.userId && (!user || payload.userId !== user.id)) {
		if (!user || (user.role !== 'ADMIN' && user.role !== 'CS')) {
			return json({ message: 'Forbidden. Penugasan userId tidak valid.' }, { status: 403 });
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

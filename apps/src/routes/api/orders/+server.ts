import { json } from '@sveltejs/kit';
import { createOrder, getOrders } from '$lib/server/services/orderService';
import { requireAuth } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const { user, error } = await requireAuth(cookies);
	if (error) return error;

	try {
		const queryUserId = url.searchParams.get('userId');

		// Authorization logic:
		// ADMIN and CS can view any or all orders.
		// CUSTOMER can only view their own orders.
		if (user!.role === 'CUSTOMER') {
			if (!queryUserId || queryUserId !== user!.id) {
				return json({ message: 'Forbidden. You can only view your own orders.' }, { status: 403 });
			}
		}

		const items = getOrders(queryUserId ? { userId: queryUserId } : undefined);
		return json({
			items,
			actorRole: user?.role,
			actorAccountId: user?.id
		});
	} catch (err) {
		console.error('Failed to fetch local orders.', err);
		return json({ message: 'Gagal mengambil data order.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	// Let's allow public orders (from catalog/checkout) for now,
	// but if userId is provided in payload, it MUST match the authenticated user.
	// We'll use getCurrentUser instead of requireAuth to allow anonymous checkout if supported.
	const { getCurrentUser } = await import('$lib/server/utils/authGuard');
	const user = await getCurrentUser(cookies);

	let payload: any;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	if (payload.userId && (!user || payload.userId !== user.id)) {
		// Only admins/cs can create orders for others, otherwise forbidden
		if (!user || (user.role !== 'ADMIN' && user.role !== 'CS')) {
			return json({ message: 'Forbidden. Invalid userId assignment.' }, { status: 403 });
		}
	}

	try {
		const result = createOrder(payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: 400 });
		}

		return json({ order: result.order }, { status: 201 });
	} catch (err) {
		console.error('Failed to create local order.', err);
		return json({ message: 'Gagal membuat order.' }, { status: 500 });
	}
};

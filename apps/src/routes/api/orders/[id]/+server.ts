import { json } from '@sveltejs/kit';
import { getOrder } from '$lib/server/services/orderService';
import { requireAuth } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const { user, error: authError } = await requireAuth(cookies);
	if (authError) return authError;

	try {
		const id = params.id;
		if (!id) {
			return json({ message: 'Order ID wajib diisi.' }, { status: 400 });
		}
		
		const order = getOrder(id);
		if (!order) {
			return json({ message: 'Order tidak ditemukan.' }, { status: 404 });
		}

		// Ownership check for CUSTOMER
		if (user?.role === 'CUSTOMER' && order.userId !== user.id) {
			return json({ message: 'Forbidden. Anda tidak memiliki akses ke pesanan ini.' }, { status: 403 });
		}

		return json({
			order,
			actorRole: user?.role,
			actorAccountId: user?.id
		});
	} catch (error) {
		console.error('Failed to fetch order detail.', error);
		return json({ message: 'Gagal mengambil data order.' }, { status: 500 });
	}
};

import { json } from '@sveltejs/kit';
import { convertPackageRequestToOrder } from '$lib/server/services/packageRequestService';
import { requireRole } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, cookies }) => {
	const { user, error: authError } = await requireRole(cookies, ['ADMIN', 'CS']);
	if (authError) return authError;

	try {
		const result = convertPackageRequestToOrder(params.id);
		
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({ 
			message: 'Request paket berhasil dikonversi menjadi order.',
			orderId: result.orderId,
			orderNumber: result.orderNumber,
			actorRole: user?.role,
			actorAccountId: user?.id
		});
	} catch (error) {
		console.error('Failed to convert package request to order.', error);
		return json({ message: 'Gagal mengonversi request paket menjadi order.' }, { status: 500 });
	}
};

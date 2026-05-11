import { json } from '@sveltejs/kit';
import { convertPackageRequestToOrder } from '$lib/server/services/packageRequestService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
	try {
		const result = convertPackageRequestToOrder(params.id);
		
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({ 
			message: 'Request paket berhasil dikonversi menjadi order.',
			orderId: result.orderId,
			orderNumber: result.orderNumber
		});
	} catch (error) {
		console.error('Failed to convert package request to order.', error);
		return json({ message: 'Gagal mengonversi request paket menjadi order.' }, { status: 500 });
	}
};

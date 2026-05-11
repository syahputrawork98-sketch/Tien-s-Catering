import { json } from '@sveltejs/kit';
import { getOrder } from '$lib/server/services/orderService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = params.id;
		if (!id) {
			return json({ message: 'Order ID wajib diisi.' }, { status: 400 });
		}
		
		const order = getOrder(id);
		if (!order) {
			return json({ message: 'Order tidak ditemukan.' }, { status: 404 });
		}
		return json({ order });
	} catch (error) {
		console.error('Failed to fetch order detail.', error);
		return json({ message: 'Gagal mengambil data order.' }, { status: 500 });
	}
};

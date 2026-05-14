import { json } from '@sveltejs/kit';
import { createOrder, getOrders } from '$lib/server/services/orderService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		const items = getOrders(userId ? { userId } : undefined);
		return json({ items });
	} catch (error) {
		console.error('Failed to fetch local orders.', error);
		return json({ message: 'Gagal mengambil data order.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = createOrder(payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: 400 });
		}

		return json({ order: result.order }, { status: 201 });
	} catch (error) {
		console.error('Failed to create local order.', error);
		return json({ message: 'Gagal membuat order.' }, { status: 500 });
	}
};

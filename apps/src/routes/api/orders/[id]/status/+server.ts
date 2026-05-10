import { json } from '@sveltejs/kit';
import { updateOrderStatus } from '$lib/server/services/orderService';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = updateOrderStatus(params.id, payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({ order: result.order });
	} catch (error) {
		console.error('Failed to update order status.', error);
		return json({ message: 'Gagal memperbarui status order.' }, { status: 500 });
	}
};

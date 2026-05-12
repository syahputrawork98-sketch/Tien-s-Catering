import { json } from '@sveltejs/kit';
import { getOrders } from '$lib/server/services/orderService';
import { computeReportingSummary } from '$lib/utils/reporting';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const items = getOrders();
		const summary = computeReportingSummary(items);

		return json({
			items,
			summary,
			note: 'Report masih pre-auth production readiness dan belum menjadi accounting final.'
		});
	} catch (error) {
		console.error('Failed to build report summary.', error);
		return json({ message: 'Gagal menyusun data laporan.' }, { status: 500 });
	}
};

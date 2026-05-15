import { json } from '@sveltejs/kit';
import { getOrders } from '$lib/server/services/orderService';
import { computeReportingSummary } from '$lib/utils/reporting';
import { requireRole } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const { user, error } = await requireRole(cookies, ['ADMIN']);
	if (error) return error;

	try {
		const items = getOrders();
		const summary = computeReportingSummary(items);

		return json({
			items,
			summary,
			actorRole: user?.role,
			actorAccountId: user?.id,
			note: 'Report berbasis data SQLite lokal. Revenue final mencakup pesanan PAID atau COMPLETED/DELIVERED.'
		});
	} catch (err) {
		console.error('Failed to build report summary.', err);
		return json({ message: 'Gagal menyusun data laporan.' }, { status: 500 });
	}
};

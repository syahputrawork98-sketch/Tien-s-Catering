import { getOrders } from '$lib/server/services/orderService';
import { buildOrdersCsv } from '$lib/utils/reporting';
import type { RequestHandler } from './$types';

function buildFileName(now: Date): string {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `tc-report-orders-${year}${month}${day}.csv`;
}

export const GET: RequestHandler = async () => {
	try {
		const items = getOrders();
		const csv = buildOrdersCsv(items);
		const fileName = buildFileName(new Date());

		return new Response(csv, {
			headers: {
				'content-type': 'text/csv; charset=utf-8',
				'content-disposition': `attachment; filename="${fileName}"`,
				'cache-control': 'no-store'
			}
		});
	} catch (error) {
		console.error('Failed to export report CSV.', error);
		return new Response('Gagal membuat export CSV.', { status: 500 });
	}
};

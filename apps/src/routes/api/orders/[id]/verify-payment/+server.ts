import { json } from '@sveltejs/kit';
import { verifyOrderPayment } from '$lib/server/services/orderService';
import { requireRole } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const { user, error: authError } = await requireRole(cookies, ['ADMIN', 'CS']);
	if (authError) return authError;

	const orderId = params.id;
	if (!orderId) {
		return json({ message: 'Order ID wajib diisi.' }, { status: 400 });
	}

	try {
		const payload = await request.json();
		const { action, note } = payload;

		if (!action || !['approve', 'reject'].includes(action)) {
			return json({ message: 'Aksi verifikasi tidak valid (approve/reject).' }, { status: 400 });
		}

		if (action === 'reject' && !note) {
			return json({ message: 'Alasan penolakan wajib diisi.' }, { status: 400 });
		}

		const result = verifyOrderPayment(orderId, {
			action,
			note,
			verifiedBy: user?.name || 'Admin'
		});

		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({
			message: action === 'approve' 
				? 'Pembayaran berhasil disetujui. Status pesanan kini Lunas.' 
				: 'Pembayaran ditolak. Customer akan melihat alasan penolakan.',
			paymentStatus: result.paymentStatus,
			actorRole: user?.role,
			actorAccountId: user?.id
		});
	} catch (error) {
		console.error('Error verifying payment:', error);
		return json({ message: 'Terjadi kesalahan saat memproses verifikasi pembayaran.' }, { status: 500 });
	}
};

import { json } from '@sveltejs/kit';
import { getPaymentSettings, updatePaymentSettings } from '$lib/server/services/paymentConfigService';
import { requireRole, requireAuth } from '$lib/server/utils/authGuard';
import type { RequestHandler } from './$types';

// GET: Publicly accessible but only returns what's safe for customers
export const GET: RequestHandler = async () => {
    const settings = getPaymentSettings();
    return json(settings);
};

// PATCH: Admin only
export const PATCH: RequestHandler = async ({ request, cookies }) => {
    const { user, error: authError } = await requireRole(cookies, ['ADMIN']);
    if (authError) return authError;

    try {
        const payload = await request.json();
        const result = updatePaymentSettings(payload);
        
        if (!result.ok) {
            return json({ message: result.message }, { status: 400 });
        }

        return json({ message: 'Pengaturan pembayaran berhasil diperbarui.' });
    } catch (error) {
        return json({ message: 'Format data tidak valid.' }, { status: 400 });
    }
};

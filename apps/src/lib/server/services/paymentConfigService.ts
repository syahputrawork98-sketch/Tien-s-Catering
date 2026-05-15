import { getPaymentConfig, updatePaymentConfig, type PaymentConfig } from '$lib/server/repositories/settingsRepository';

export function getPaymentSettings(): PaymentConfig {
    try {
        return getPaymentConfig();
    } catch (error) {
        console.error('Failed to get payment settings:', error);
        return {
            bankName: '',
            accountNumber: '',
            accountOwner: '',
            qrisImage: null
        };
    }
}

export function updatePaymentSettings(payload: unknown): { ok: true } | { ok: false; message: string } {
    if (typeof payload !== 'object' || payload === null) {
        return { ok: false, message: 'Payload tidak valid.' };
    }

    const data = payload as any;
    const config: Partial<PaymentConfig> = {};

    if (data.bankName !== undefined) config.bankName = String(data.bankName).trim();
    if (data.accountNumber !== undefined) config.accountNumber = String(data.accountNumber).trim();
    if (data.accountOwner !== undefined) config.accountOwner = String(data.accountOwner).trim();
    if (data.qrisImage !== undefined) config.qrisImage = data.qrisImage ? String(data.qrisImage) : null;

    try {
        updatePaymentConfig(config);
        return { ok: true };
    } catch (error) {
        console.error('Failed to update payment settings:', error);
        return { ok: false, message: 'Gagal menyimpan pengaturan pembayaran.' };
    }
}

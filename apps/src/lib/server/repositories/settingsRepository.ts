import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';

export type PaymentConfig = {
    bankName: string;
    accountNumber: string;
    accountOwner: string;
    qrisImage: string | null; // Data URL or path
};

function ensureSettingsTable(db: ReturnType<typeof getDatabase>) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);
}

export function getPaymentConfig(): PaymentConfig {
    ensureDatabaseInitialized();
    const db = getDatabase();
    ensureSettingsTable(db);

    const rows = db.prepare("SELECT key, value FROM system_settings WHERE key LIKE 'payment_%'").all() as { key: string; value: string }[];
    
    const config: PaymentConfig = {
        bankName: '',
        accountNumber: '',
        accountOwner: '',
        qrisImage: null
    };

    for (const row of rows) {
        if (row.key === 'payment_bank_name') config.bankName = row.value;
        if (row.key === 'payment_account_number') config.accountNumber = row.value;
        if (row.key === 'payment_account_owner') config.accountOwner = row.value;
        if (row.key === 'payment_qris_image') config.qrisImage = row.value;
    }

    return config;
}

export function updatePaymentConfig(config: Partial<PaymentConfig>): void {
    ensureDatabaseInitialized();
    const db = getDatabase();
    ensureSettingsTable(db);

    const timestamp = new Date().toISOString();
    const upsert = db.prepare(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES (@key, @value, @updatedAt)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at;
    `);

    const transaction = db.transaction((data: Partial<PaymentConfig>) => {
        if (data.bankName !== undefined) upsert.run({ key: 'payment_bank_name', value: data.bankName, updatedAt: timestamp });
        if (data.accountNumber !== undefined) upsert.run({ key: 'payment_account_number', value: data.accountNumber, updatedAt: timestamp });
        if (data.accountOwner !== undefined) upsert.run({ key: 'payment_account_owner', value: data.accountOwner, updatedAt: timestamp });
        if (data.qrisImage !== undefined) upsert.run({ key: 'payment_qris_image', value: data.qrisImage ?? '', updatedAt: timestamp });
    });

    transaction(config);
}

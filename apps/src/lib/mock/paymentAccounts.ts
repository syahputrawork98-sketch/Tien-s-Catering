// ============================================================
// paymentAccounts.ts — Mock Data Rekening Pembayaran
// ============================================================

export type PaymentAccountType = 'bank_transfer' | 'qris' | 'ewallet';

export type PaymentAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: PaymentAccountType;
  isPrimary: boolean;
  isActive: boolean;
  qrImageUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export const mockPaymentAccounts: PaymentAccount[] = [
  {
    id: 'pay-001',
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountHolder: "Tien's Catering",
    type: 'bank_transfer',
    isPrimary: true,
    isActive: true,
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pay-002',
    bankName: 'Mandiri',
    accountNumber: '0987654321',
    accountHolder: "Tien's Catering",
    type: 'bank_transfer',
    isPrimary: false,
    isActive: true,
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pay-003',
    bankName: 'QRIS',
    accountNumber: 'TIENSCAT',
    accountHolder: "Tien's Catering",
    type: 'qris',
    isPrimary: false,
    isActive: true,
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TIENSCAT',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  }
];

export function getActivePaymentAccounts(): PaymentAccount[] {
  return mockPaymentAccounts.filter(p => p.isActive);
}

export function getPrimaryPaymentAccount(): PaymentAccount | undefined {
  return mockPaymentAccounts.find(p => p.isActive && p.isPrimary) || mockPaymentAccounts.find(p => p.isActive);
}

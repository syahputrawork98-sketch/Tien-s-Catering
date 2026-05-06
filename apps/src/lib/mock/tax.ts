// ============================================================
// tax.ts — Mock Data Aturan Pajak & Invoice
// Single source of truth untuk aturan billing (UI-only simulation)
// ============================================================

export type CustomerTaxType = 'personal' | 'company' | 'institution';

export type MockTaxRule = {
  id: string;
  customerType: CustomerTaxType;
  label: string;
  description: string;

  isTaxEnabled: boolean;
  ppnRate: number;

  invoiceRequired: boolean;
  npwpRequired: boolean;
  taxIncluded: boolean;

  additionalNote?: string;

  updatedBy?: 'admin';
  updatedAt?: string;
  adminNote?: string;
};

export const mockTaxRules: MockTaxRule[] = [
  {
    id: 'tax-personal',
    customerType: 'personal',
    label: 'User Personal',
    description: 'Aturan pajak untuk customer personal atau individu.',
    isTaxEnabled: false,
    ppnRate: 0,
    invoiceRequired: false,
    npwpRequired: false,
    taxIncluded: false,
    additionalNote: 'Invoice pajak bersifat opsional untuk customer personal.'
  },
  {
    id: 'tax-company',
    customerType: 'company',
    label: 'Perusahaan / Company',
    description: 'Aturan pajak untuk customer perusahaan.',
    isTaxEnabled: true,
    ppnRate: 11,
    invoiceRequired: true,
    npwpRequired: true,
    taxIncluded: false,
    additionalNote: 'Perusahaan wajib menggunakan invoice resmi dan data NPWP.'
  },
  {
    id: 'tax-institution',
    customerType: 'institution',
    label: 'Instansi / Institusi',
    description: 'Aturan pajak untuk sekolah, yayasan, pemerintahan, atau institusi.',
    isTaxEnabled: true,
    ppnRate: 11,
    invoiceRequired: true,
    npwpRequired: true,
    taxIncluded: false,
    additionalNote: 'Instansi membutuhkan dokumen pajak dan invoice formal.'
  }
];

// ─── Helper functions ─────────────────────────────────────

/**
 * Simulasi perhitungan pajak berdasarkan subtotal dan aturan pajak
 */
export function calculateTax(subtotal: number, rule: MockTaxRule) {
  const taxAmount = rule.isTaxEnabled ? Math.round(subtotal * (rule.ppnRate / 100)) : 0;
  const total = rule.taxIncluded ? subtotal : subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    total,
    isTaxEnabled: rule.isTaxEnabled,
    ppnRate: rule.ppnRate,
    taxIncluded: rule.taxIncluded
  };
}

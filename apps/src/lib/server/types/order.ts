export const paymentMethods = ['cash', 'transfer', 'qris', 'cod'] as const;

export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentStatus = 'unpaid' | 'cod';

export type CreateOrderItemInput = {
	menuId: string | null;
	name: string;
	quantity: number;
	price: number;
	subtotal: number;
};

export type CreateOrderInput = {
	customerName: string;
	whatsapp: string;
	deliveryDate: string;
	notes: string;
	deliveryInfo: {
		departmentOrUnit: string | null;
		floor: string | null;
		locationNote: string | null;
		addressSummary: string | null;
	};
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	items: CreateOrderItemInput[];
	totals: {
		subtotal: number;
		taxAmount: number;
		deliveryFee: number;
		total: number;
	};
	devPersonaCode: string | null;
};

export type CreatedOrderSummary = {
	id: string;
	orderNumber: string;
	customerName: string;
	status: 'new';
	paymentStatus: PaymentStatus;
	total: number;
};

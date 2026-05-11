export const paymentMethods = ['cash', 'transfer', 'qris', 'cod'] as const;
export const paymentStatuses = ['unpaid', 'waiting_verification', 'paid', 'cod'] as const;
export const orderStatuses = [
	'new',
	'confirmed',
	'processing',
	'ready',
	'delivered',
	'completed',
	'cancelled'
] as const;
export const orderStockStatuses = ['not_deducted', 'deducted', 'released'] as const;

export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type OrderStatus = (typeof orderStatuses)[number];
export type OrderStockStatus = (typeof orderStockStatuses)[number];

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
	sourceType?: 'catalog' | 'package_request';
	sourceId?: string | null;
};

export type CreatedOrderSummary = {
	id: string;
	orderNumber: string;
	customerName: string;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	total: number;
};

export type UpdatedOrderStatusSummary = {
	id: string;
	orderNumber: string;
	status: OrderStatus;
	updatedAt: string;
	stockStatus: OrderStockStatus;
	stockUpdated: boolean;
};

export type UpdatedOrderPaymentStatusSummary = {
	orderId: string;
	orderNumber: string;
	paymentStatus: PaymentStatus;
	paidAmount: number;
	remainingAmount: number;
};

export type OrderListItem = {
	id: string;
	menuId: string | null;
	name: string;
	quantity: number;
	price: number;
	subtotal: number;
};

export type OrderListRecord = {
	id: string;
	orderNumber: string;
	customerName: string;
	whatsapp: string;
	orderDate: string;
	deliveryDate: string;
	status: string;
	paymentMethod: string;
	paymentStatus: string;
	subtotal: number;
	taxAmount: number;
	deliveryFee: number;
	total: number;
	notes: string;
	devPersonaCode: string | null;
	stockStatus: OrderStockStatus;
	stockDeductedAt: string | null;
	stockReleasedAt: string | null;
	sourceType: string | null;
	sourceId: string | null;
	deliveryInfo: {
		departmentOrUnit: string | null;
		floor: string | null;
		locationNote: string | null;
		addressSummary: string | null;
	};
	payment: {
		method: string;
		status: string;
		totalAmount: number;
		paidAmount: number;
		remainingAmount: number;
	};
	items: OrderListItem[];
};

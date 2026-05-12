export type ReportingOrderItem = {
	id: string;
	orderNumber: string;
	customerName: string;
	orderDate: string;
	deliveryDate: string;
	status: string;
	paymentMethod: string;
	paymentStatus: string;
	total: number;
	sourceType?: string | null;
	sourceId?: string | null;
};

export type ReportingSummary = {
	totalOrders: number;
	paidOrders: number;
	unpaidOrders: number;
	waitingVerificationOrders: number;
	rejectedOrders: number;
	cancelledOrders: number;
	validRevenue: number;
	pendingRevenue: number;
	averagePaidOrderValue: number;
	sourceBreakdown: {
		catalog: number;
		packageRequest: number;
		legacy: number;
	};
	paymentBreakdown: Record<string, number>;
};

function normalizeOrderStatus(status: string | null | undefined): string {
	return typeof status === 'string' && status.trim().length > 0 ? status.trim().toLowerCase() : 'new';
}

function normalizePaymentStatus(status: string | null | undefined): string {
	return typeof status === 'string' && status.trim().length > 0 ? status.trim().toLowerCase() : 'unpaid';
}

export function normalizeOrderSourceType(sourceType: string | null | undefined): 'catalog' | 'package_request' | 'legacy' {
	if (sourceType === 'package_request') return 'package_request';
	if (sourceType === 'catalog') return 'catalog';
	return 'legacy';
}

export function getOrderSourceLabel(sourceType: string | null | undefined): string {
	const normalized = normalizeOrderSourceType(sourceType);

	if (normalized === 'package_request') return 'Package Request';
	if (normalized === 'catalog') return 'Catalog';
	return 'Catalog Legacy';
}

export function isRevenueEligibleOrder(order: ReportingOrderItem): boolean {
	const paymentStatus = normalizePaymentStatus(order.paymentStatus);
	const orderStatus = normalizeOrderStatus(order.status);

	return paymentStatus === 'paid' && orderStatus !== 'cancelled';
}

export function computeReportingSummary(orders: ReportingOrderItem[]): ReportingSummary {
	const paymentBreakdown: Record<string, number> = {};

	let totalOrders = 0;
	let paidOrders = 0;
	let unpaidOrders = 0;
	let waitingVerificationOrders = 0;
	let rejectedOrders = 0;
	let cancelledOrders = 0;
	let validRevenue = 0;
	let pendingRevenue = 0;
	let catalog = 0;
	let packageRequest = 0;
	let legacy = 0;

	for (const order of orders) {
		totalOrders += 1;

		const total = Math.max(0, Number(order.total ?? 0));
		const paymentStatus = normalizePaymentStatus(order.paymentStatus);
		const orderStatus = normalizeOrderStatus(order.status);
		const sourceType = normalizeOrderSourceType(order.sourceType);

		paymentBreakdown[paymentStatus] = (paymentBreakdown[paymentStatus] ?? 0) + 1;

		if (sourceType === 'package_request') packageRequest += 1;
		else if (sourceType === 'catalog') catalog += 1;
		else legacy += 1;

		if (orderStatus === 'cancelled') {
			cancelledOrders += 1;
		}

		if (paymentStatus === 'paid') {
			paidOrders += 1;
		} else if (paymentStatus === 'unpaid' || paymentStatus === 'cod_pending') {
			unpaidOrders += 1;
		} else if (paymentStatus === 'waiting_verification') {
			waitingVerificationOrders += 1;
		} else if (paymentStatus === 'rejected') {
			rejectedOrders += 1;
		}

		if (isRevenueEligibleOrder(order)) {
			validRevenue += total;
		} else if (orderStatus !== 'cancelled') {
			pendingRevenue += total;
		}
	}

	return {
		totalOrders,
		paidOrders,
		unpaidOrders,
		waitingVerificationOrders,
		rejectedOrders,
		cancelledOrders,
		validRevenue,
		pendingRevenue,
		averagePaidOrderValue: paidOrders > 0 ? Math.round(validRevenue / paidOrders) : 0,
		sourceBreakdown: {
			catalog,
			packageRequest,
			legacy
		},
		paymentBreakdown
	};
}

function escapeCsvValue(value: string | number): string {
	const stringValue = String(value ?? '');
	if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
		return `"${stringValue.replaceAll('"', '""')}"`;
	}

	return stringValue;
}

export function buildOrdersCsv(orders: ReportingOrderItem[]): string {
	const header = [
		'order_id',
		'order_number',
		'customer',
		'source_type',
		'order_status',
		'payment_status',
		'total',
		'created_date',
		'revenue_status'
	];

	const rows = orders.map((order) => [
		order.id,
		order.orderNumber ?? '',
		order.customerName ?? '',
		getOrderSourceLabel(order.sourceType),
		normalizeOrderStatus(order.status),
		normalizePaymentStatus(order.paymentStatus),
		Math.max(0, Number(order.total ?? 0)),
		order.orderDate ?? '',
		isRevenueEligibleOrder(order) ? 'counted_as_revenue' : 'not_counted'
	]);

	return [header, ...rows]
		.map((row) => row.map((value) => escapeCsvValue(value)).join(','))
		.join('\n');
}

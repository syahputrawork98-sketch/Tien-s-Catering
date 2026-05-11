import {
	createOrderRecord,
	listOrderRecords,
	updateOrderPaymentStatusRecord,
	updateOrderStatusRecord,
	savePaymentProofRecord,
	getLatestPaymentProofByOrderId
} from '$lib/server/repositories/orderRepository';
import {
	type OrderListRecord,
	orderStatuses,
	paymentMethods,
	paymentStatuses,
	type CreateOrderInput,
	type CreatedOrderSummary,
	type OrderStatus,
	type PaymentMethod,
	type PaymentStatus,
	type UpdatedOrderPaymentStatusSummary,
	type UpdatedOrderStatusSummary,
	type OrderPaymentProof
} from '$lib/server/types/order';

type CreateOrderResult =
	| {
			ok: true;
			order: CreatedOrderSummary;
	  }
	| {
			ok: false;
			message: string;
	  };

type ParseCreateOrderPayloadResult =
	| {
			ok: true;
			data: CreateOrderInput;
	  }
	| {
			ok: false;
			message: string;
	  };

type UpdateOrderStatusResult =
	| {
			ok: true;
			order: UpdatedOrderStatusSummary;
	  }
	| {
			ok: false;
			status: 400 | 404;
			message: string;
	  };

type UpdateOrderPaymentStatusResult =
	| {
			ok: true;
			payment: UpdatedOrderPaymentStatusSummary;
	  }
	| {
			ok: false;
			status: 400 | 404;
			message: string;
	  };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseRequiredString(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

function parseOptionalString(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

function parseNonNegativeNumber(value: unknown): number | null {
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
	return value;
}

function resolvePaymentStatus(paymentMethod: PaymentMethod): PaymentStatus {
	return paymentMethod === 'cod' ? 'cod' : 'unpaid';
}

function parseCreateOrderPayload(payload: unknown): ParseCreateOrderPayloadResult {
	if (!isRecord(payload)) {
		return { ok: false, message: 'Payload tidak valid.' };
	}

	const customerName = parseRequiredString(payload.customerName);
	if (!customerName) {
		return { ok: false, message: 'customerName wajib diisi.' };
	}

	const whatsapp = parseRequiredString(payload.whatsapp);
	if (!whatsapp) {
		return { ok: false, message: 'whatsapp wajib diisi.' };
	}

	const deliveryDate = parseRequiredString(payload.deliveryDate);
	if (!deliveryDate) {
		return { ok: false, message: 'deliveryDate wajib diisi.' };
	}

	if (typeof payload.paymentMethod !== 'string' || !paymentMethods.includes(payload.paymentMethod as PaymentMethod)) {
		return { ok: false, message: 'paymentMethod harus salah satu: cash, transfer, qris, cod.' };
	}

	const paymentMethod = payload.paymentMethod as PaymentMethod;

	if (!Array.isArray(payload.items) || payload.items.length === 0) {
		return { ok: false, message: 'items wajib berupa array dan tidak boleh kosong.' };
	}

	const normalizedItems: CreateOrderInput['items'] = [];
	for (const item of payload.items) {
		if (!isRecord(item)) {
			return { ok: false, message: 'Format item order tidak valid.' };
		}

		const name = parseRequiredString(item.name);
		if (!name) {
			return { ok: false, message: 'Setiap item wajib memiliki name.' };
		}

		if (typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity <= 0) {
			return { ok: false, message: 'Setiap item wajib memiliki quantity > 0.' };
		}

		const price = parseNonNegativeNumber(item.price);
		if (price === null) {
			return { ok: false, message: 'Setiap item wajib memiliki price >= 0.' };
		}

		const menuId = parseOptionalString(item.menuId);
		const quantity = item.quantity;
		const subtotal = quantity * price;

		normalizedItems.push({
			menuId,
			name,
			quantity,
			price,
			subtotal
		});
	}

	if (!isRecord(payload.totals)) {
		return { ok: false, message: 'totals wajib diisi.' };
	}

	const total = parseNonNegativeNumber(payload.totals.total);
	if (total === null) {
		return { ok: false, message: 'totals.total harus berupa angka >= 0.' };
	}

	const subtotal =
		parseNonNegativeNumber(payload.totals.subtotal) ??
		normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
	const taxAmount = parseNonNegativeNumber(payload.totals.taxAmount) ?? 0;
	const deliveryFee = parseNonNegativeNumber(payload.totals.deliveryFee) ?? 0;

	const deliveryInfo = isRecord(payload.deliveryInfo) ? payload.deliveryInfo : {};
	const notes = parseOptionalString(payload.notes) ?? '';
	const devPersonaCode = parseOptionalString(payload.devPersonaCode);

	return {
		ok: true,
		data: {
			customerName,
			whatsapp,
			deliveryDate,
			notes,
			deliveryInfo: {
				departmentOrUnit: parseOptionalString(deliveryInfo.departmentOrUnit),
				floor: parseOptionalString(deliveryInfo.floor),
				locationNote: parseOptionalString(deliveryInfo.locationNote),
				addressSummary: parseOptionalString(deliveryInfo.addressSummary)
			},
			paymentMethod,
			paymentStatus: resolvePaymentStatus(paymentMethod),
			items: normalizedItems,
			totals: {
				subtotal,
				taxAmount,
				deliveryFee,
				total
			},
			devPersonaCode
		}
	};
}

export function createOrder(payload: unknown): CreateOrderResult {
	const parsed = parseCreateOrderPayload(payload);
	if (!parsed.ok) {
		return parsed;
	}

	const order = createOrderRecord(parsed.data);

	return {
		ok: true,
		order
	};
}

export function getOrders(): OrderListRecord[] {
	return listOrderRecords();
}

export function updateOrderStatus(orderId: string, payload: unknown): UpdateOrderStatusResult {
	const normalizedOrderId = parseRequiredString(orderId);
	if (!normalizedOrderId) {
		return { ok: false, status: 400, message: 'order id wajib diisi.' };
	}

	if (!isRecord(payload)) {
		return { ok: false, status: 400, message: 'Payload tidak valid.' };
	}

	const rawStatus = parseRequiredString(payload.status);
	if (!rawStatus) {
		return { ok: false, status: 400, message: 'status wajib diisi.' };
	}

	const normalizedStatus = rawStatus.toLowerCase();
	if (!orderStatuses.includes(normalizedStatus as OrderStatus)) {
		return {
			ok: false,
			status: 400,
			message: `status harus salah satu: ${orderStatuses.join(', ')}.`
		};
	}

	const updatedOrder = updateOrderStatusRecord(normalizedOrderId, normalizedStatus as OrderStatus);
	if (!updatedOrder.ok) {
		if (updatedOrder.reason === 'not_found') {
			return { ok: false, status: 404, message: updatedOrder.message };
		}

		return { ok: false, status: 400, message: updatedOrder.message };
	}

	return {
		ok: true,
		order: updatedOrder.order
	};
}

export type UploadPaymentProofResult =
	| {
			ok: true;
			paymentStatus: PaymentStatus;
			proof: any;
	  }
	| {
			ok: false;
			status: number;
			message: string;
	  };

export function uploadPaymentProof(
	orderId: string,
	fileData: { fileName: string; filePath: string; mimeType: string; fileSize: number }
): UploadPaymentProofResult {
	const normalizedOrderId = orderId.trim();
	if (!normalizedOrderId) {
		return { ok: false, status: 400, message: 'order id wajib diisi.' };
	}

	// 1. Get existing orders to verify
	const allOrders = listOrderRecords();
	const order = allOrders.find((o) => o.id === normalizedOrderId);

	if (!order) {
		return { ok: false, status: 404, message: 'Order tidak ditemukan.' };
	}

	if (order.paymentStatus === 'paid') {
		return { ok: false, status: 400, message: 'Order sudah lunas, tidak perlu upload bukti bayar.' };
	}

	// 2. Save proof record
	const proof = savePaymentProofRecord({
		orderId: normalizedOrderId,
		fileName: fileData.fileName,
		filePath: fileData.filePath,
		mimeType: fileData.mimeType,
		fileSize: fileData.fileSize
	});

	// 3. Update payment status to waiting_verification
	const updateResult = updateOrderPaymentStatusRecord(normalizedOrderId, 'waiting_verification');

	if (!updateResult) {
		return { ok: false, status: 500, message: 'Gagal memperbarui status pembayaran order.' };
	}

	return {
		ok: true,
		paymentStatus: 'waiting_verification',
		proof
	};
}

export function updateOrderPaymentStatus(
	orderId: string,
	payload: unknown
): UpdateOrderPaymentStatusResult {
	const normalizedOrderId = parseRequiredString(orderId);
	if (!normalizedOrderId) {
		return { ok: false, status: 400, message: 'order id wajib diisi.' };
	}

	if (!isRecord(payload)) {
		return { ok: false, status: 400, message: 'Payload tidak valid.' };
	}

	const rawPaymentStatus = parseRequiredString(payload.paymentStatus);
	if (!rawPaymentStatus) {
		return { ok: false, status: 400, message: 'paymentStatus wajib diisi.' };
	}

	const normalizedPaymentStatus = rawPaymentStatus.toLowerCase();
	if (!paymentStatuses.includes(normalizedPaymentStatus as PaymentStatus)) {
		return {
			ok: false,
			status: 400,
			message: `paymentStatus harus salah satu: ${paymentStatuses.join(', ')}.`
		};
	}

	const updatedPayment = updateOrderPaymentStatusRecord(
		normalizedOrderId,
		normalizedPaymentStatus as PaymentStatus
	);
	if (!updatedPayment) {
		return { ok: false, status: 404, message: 'Order/payment info tidak ditemukan.' };
	}

	return {
		ok: true,
		payment: updatedPayment
	};
}

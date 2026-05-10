import { createOrderRecord } from '$lib/server/repositories/orderRepository';
import {
	paymentMethods,
	type CreateOrderInput,
	type CreatedOrderSummary,
	type PaymentMethod,
	type PaymentStatus
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

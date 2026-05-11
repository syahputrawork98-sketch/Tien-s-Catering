import {
	createPackageRequestRecord,
	listPackageRequestRecords,
	updatePackageRequestReviewRecord,
	linkPackageRequestToOrderRecord
} from '$lib/server/repositories/packageRequestRepository';
import { createOrder } from '$lib/server/services/orderService';
import { packageRequestReviewStatuses } from '$lib/server/types/packageRequest';
import type {
	CreatePackageRequestInput,
	CreatedPackageRequestSummary,
	PackageRequestRecord,
	PackageRequestReviewStatus,
	UpdatePackageRequestReviewInput,
	UpdatedPackageRequestSummary
} from '$lib/server/types/packageRequest';

type CreatePackageRequestResult =
	| {
			ok: true;
			request: CreatedPackageRequestSummary;
	  }
	| {
			ok: false;
			message: string;
	  };

type ParseCreatePackageRequestPayloadResult =
	| {
			ok: true;
			data: CreatePackageRequestInput;
	  }
	| {
			ok: false;
			message: string;
	  };

type UpdatePackageRequestReviewResult =
	| {
			ok: true;
			request: UpdatedPackageRequestSummary;
	  }
	| {
			ok: false;
			status: 400 | 404;
			message: string;
	  };

type ParseUpdatePackageRequestReviewPayloadResult =
	| {
			ok: true;
			data: UpdatePackageRequestReviewInput;
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

function parsePositiveInteger(value: unknown): number | null {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return null;

	const normalized = Math.floor(parsed);
	if (normalized <= 0) return null;
	return normalized;
}

function parseNonNegativeInteger(value: unknown): number | null {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return null;
	if (parsed < 0) return null;
	return Math.floor(parsed);
}

function parseCreatePackageRequestPayload(payload: unknown): ParseCreatePackageRequestPayloadResult {
	if (!isRecord(payload)) {
		return { ok: false, message: 'Payload tidak valid.' };
	}

	const packageId = parseRequiredString(payload.packageId);
	if (!packageId) {
		return { ok: false, message: 'packageId wajib diisi.' };
	}

	const packageNameSnapshot =
		parseRequiredString(payload.packageNameSnapshot) ?? parseRequiredString(payload.packageName);
	if (!packageNameSnapshot) {
		return { ok: false, message: 'packageName wajib diisi.' };
	}

	const customerName = parseRequiredString(payload.customerName);
	if (!customerName) {
		return { ok: false, message: 'customerName wajib diisi.' };
	}

	const whatsapp = parseRequiredString(payload.whatsapp);
	if (!whatsapp) {
		return { ok: false, message: 'whatsapp wajib diisi.' };
	}

	const eventDate = parseRequiredString(payload.eventDate);
	if (!eventDate) {
		return { ok: false, message: 'eventDate wajib diisi.' };
	}

	const pax = parsePositiveInteger(payload.pax);
	if (pax === null) {
		return { ok: false, message: 'pax harus lebih dari 0.' };
	}

	const location = parseRequiredString(payload.location);
	if (!location) {
		return { ok: false, message: 'location wajib diisi.' };
	}

	const notes =
		parseOptionalString(payload.notes) ??
		parseOptionalString(payload.specialNotes) ??
		parseOptionalString(payload.catatan) ??
		'';

	return {
		ok: true,
		data: {
			packageId,
			packageNameSnapshot,
			customerName,
			whatsapp,
			eventDate,
			pax,
			location,
			notes,
			status: 'new'
		}
	};
}

export function createPackageRequest(payload: unknown): CreatePackageRequestResult {
	const parsed = parseCreatePackageRequestPayload(payload);
	if (!parsed.ok) {
		return parsed;
	}

	const request = createPackageRequestRecord(parsed.data);
	return {
		ok: true,
		request
	};
}

export function getPackageRequests(): PackageRequestRecord[] {
	return listPackageRequestRecords();
}

function parseUpdatePackageRequestReviewPayload(
	payload: unknown
): ParseUpdatePackageRequestReviewPayloadResult {
	if (!isRecord(payload)) {
		return { ok: false, message: 'Payload tidak valid.' };
	}

	const rawStatus = parseRequiredString(payload.status);
	if (!rawStatus) {
		return { ok: false, message: 'status wajib diisi.' };
	}

	const normalizedStatus = rawStatus.toLowerCase();
	if (!packageRequestReviewStatuses.includes(normalizedStatus as PackageRequestReviewStatus)) {
		return {
			ok: false,
			message: `status harus salah satu: ${packageRequestReviewStatuses.join(', ')}.`
		};
	}

	const adminNote = parseOptionalString(payload.adminNote);

	let estimatedPrice: number | null = null;
	if (payload.estimatedPrice !== undefined && payload.estimatedPrice !== null && payload.estimatedPrice !== '') {
		const parsedEstimatedPrice = parseNonNegativeInteger(payload.estimatedPrice);
		if (parsedEstimatedPrice === null) {
			return { ok: false, message: 'estimatedPrice harus angka >= 0.' };
		}
		estimatedPrice = parsedEstimatedPrice;
	}

	return {
		ok: true,
		data: {
			status: normalizedStatus as PackageRequestReviewStatus,
			adminNote,
			estimatedPrice
		}
	};
}

export function updatePackageRequestReview(
	requestId: string,
	payload: unknown
): UpdatePackageRequestReviewResult {
	const normalizedRequestId = parseRequiredString(requestId);
	if (!normalizedRequestId) {
		return { ok: false, status: 400, message: 'request id wajib diisi.' };
	}

	const parsed = parseUpdatePackageRequestReviewPayload(payload);
	if (!parsed.ok) {
		return { ok: false, status: 400, message: parsed.message };
	}

	const updated = updatePackageRequestReviewRecord(normalizedRequestId, parsed.data);
	if (!updated) {
		return { ok: false, status: 404, message: 'Request paket tidak ditemukan.' };
	}

	return {
		ok: true,
		request: updated
	};
}

export function convertPackageRequestToOrder(requestId: string): {
	ok: true;
	orderId: string;
	orderNumber: string;
} | {
	ok: false;
	message: string;
	status: number;
} {
	const normalizedRequestId = parseRequiredString(requestId);
	if (!normalizedRequestId) {
		return { ok: false, status: 400, message: 'request id wajib diisi.' };
	}

	const requests = getPackageRequests();
	const request = requests.find((r) => r.id === normalizedRequestId);

	if (!request) {
		return { ok: false, status: 404, message: 'Request paket tidak ditemukan.' };
	}

	if (request.status === 'converted_to_order' || request.convertedOrderId) {
		return { ok: false, status: 400, message: 'Request paket sudah dikonversi menjadi order.' };
	}

	if (request.status !== 'quoted') {
		return { ok: false, status: 400, message: 'Hanya request dengan status "quoted" yang bisa dikonversi.' };
	}

	const estimatedPrice = request.estimatedPrice ?? 0;
	if (estimatedPrice <= 0) {
		return { ok: false, status: 400, message: 'Estimasi harga harus lebih dari 0 untuk dikonversi.' };
	}

	const subtotal = estimatedPrice * request.pax;
	const total = subtotal; // Sementara tax dan delivery fee 0 untuk konversi paket

	const orderPayload = {
		customerName: request.customerName,
		whatsapp: request.whatsapp,
		deliveryDate: request.eventDate,
		paymentMethod: 'transfer', // Default untuk paket
		notes: `Konversi dari Request Paket #${request.requestNumber}. ${request.notes}`,
		deliveryInfo: {
			addressSummary: request.location
		},
		items: [
			{
				name: `Paket Catering - ${request.packageName}`,
				quantity: request.pax,
				price: estimatedPrice
			}
		],
		totals: {
			subtotal,
			taxAmount: 0,
			deliveryFee: 0,
			total
		},
		devPersonaCode: 'admin' // Dikonversi oleh admin
	};

	const result = createOrder(orderPayload);
	if (!result.ok) {
		return { ok: false, status: 500, message: `Gagal membuat order: ${result.message}` };
	}

	const linked = linkPackageRequestToOrderRecord(normalizedRequestId, result.order.id);
	if (!linked) {
		return { ok: false, status: 500, message: 'Gagal memperbarui status request paket.' };
	}

	return {
		ok: true,
		orderId: result.order.id,
		orderNumber: result.order.orderNumber
	};
}

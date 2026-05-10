import {
	createPackageRequestRecord,
	listPackageRequestRecords
} from '$lib/server/repositories/packageRequestRepository';
import type {
	CreatePackageRequestInput,
	CreatedPackageRequestSummary,
	PackageRequestRecord
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

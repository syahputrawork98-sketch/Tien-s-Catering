import {
	createPackageRecord,
	isPackageSlugInUse,
	listPackageRecords,
	type PackageRecord,
	type PackageStatus,
	updatePackageRecord,
	updatePackageRecordStatus
} from '$lib/server/repositories/packageRepository';

export type ReadOnlyPackageItem = PackageRecord;

type PackageWriteResult =
	| {
			ok: true;
			item: PackageRecord;
	  }
	| {
			ok: false;
			status: 400 | 404;
			message: string;
	  };

type ParsedPackagePayload = {
	name: string;
	slug: string;
	description: string;
	category: string;
	packageCategory: string;
	basePrice: number;
	image: string;
	images: string[];
	minPax: number;
	packageItems: string[];
	features: string[];
	suitableFor: string[];
	status: PackageStatus;
	isActive: boolean;
	isAvailable: boolean;
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

function parseNonNegativeInteger(value: unknown): number | null {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return null;
	if (parsed < 0) return null;
	return Math.floor(parsed);
}

function parsePositiveInteger(value: unknown): number | null {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return null;
	const normalized = Math.floor(parsed);
	if (normalized < 1) return null;
	return normalized;
}

function parseBoolean(value: unknown, fallback = false): boolean {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'true' || normalized === '1') return true;
		if (normalized === 'false' || normalized === '0') return false;
	}
	return fallback;
}

function normalizeList(values: string[]): string[] {
	return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

function parseStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return normalizeList(value.filter((item): item is string => typeof item === 'string'));
	}

	if (typeof value === 'string') {
		return normalizeList(
			value
				.split(/\r?\n|,/)
				.map((item) => item.trim())
				.filter((item) => item.length > 0)
		);
	}

	return [];
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function parsePackageStatus(value: unknown): PackageStatus | null {
	if (typeof value !== 'string') return null;
	const normalized = value.trim().toLowerCase();
	if (normalized === 'active' || normalized === 'inactive') {
		return normalized;
	}
	return null;
}

function buildImages(mainImage: string, extraImages: string[]): string[] {
	const list = normalizeList([mainImage, ...extraImages]);
	if (list.length === 0) {
		return ['/images/placeholder-package.jpg'];
	}
	return Array.from(new Set(list));
}

function validateSlugUniqueness(slug: string, excludeId?: string): string | null {
	if (isPackageSlugInUse(slug, excludeId)) {
		return 'Slug paket sudah digunakan. Gunakan nama atau slug lain.';
	}
	return null;
}

function parsePackagePayload(
	payload: unknown,
	options: {
		isCreate: boolean;
		existingId?: string;
	}
):
	| {
			ok: true;
			data: ParsedPackagePayload;
	  }
	| {
			ok: false;
			message: string;
	  } {
	if (!isRecord(payload)) {
		return { ok: false, message: 'Payload tidak valid.' };
	}

	const name = parseRequiredString(payload.name);
	if (!name) {
		return { ok: false, message: 'name wajib diisi.' };
	}

	const description = parseRequiredString(payload.description);
	if (!description) {
		return { ok: false, message: 'description wajib diisi.' };
	}

	const basePrice = parseNonNegativeInteger(payload.basePrice);
	if (basePrice === null) {
		return { ok: false, message: 'basePrice harus angka >= 0.' };
	}

	const minPax = parsePositiveInteger(payload.minPax);
	if (minPax === null) {
		return { ok: false, message: 'minPax harus angka >= 1.' };
	}

	const packageCategory =
		parseRequiredString(payload.packageCategory) ?? parseRequiredString(payload.category) ?? 'Paket';
	const category = packageCategory;

	const mainImage =
		parseOptionalString(payload.image) ??
		parseOptionalString(payload.mainImageUrl) ??
		'/images/placeholder-package.jpg';

	const galleryImages = parseStringList(payload.images ?? payload.galleryImages ?? payload.galleryImageUrls);
	const images = buildImages(mainImage, galleryImages);

	const features = parseStringList(payload.features);
	const packageItems = parseStringList(payload.packageItems);
	const suitableFor = parseStringList(payload.suitableFor);

	let status: PackageStatus;
	let isActive: boolean;

	if (options.isCreate) {
		status = 'inactive';
		isActive = false;
	} else {
		const parsedStatus = parsePackageStatus(payload.status);
		if (!parsedStatus) {
			return { ok: false, message: 'status harus salah satu: active, inactive.' };
		}
		status = parsedStatus;
		isActive = status === 'active';
	}

	const isAvailable = parseBoolean(payload.isAvailable, true);

	const rawSlug = parseOptionalString(payload.slug);
	const generatedSlug = slugify(rawSlug ?? name);
	if (!generatedSlug) {
		return { ok: false, message: 'Slug tidak valid. Periksa nama paket.' };
	}

	const slugConflict = validateSlugUniqueness(generatedSlug, options.existingId);
	if (slugConflict) {
		return { ok: false, message: slugConflict };
	}

	return {
		ok: true,
		data: {
			name,
			slug: generatedSlug,
			description,
			category,
			packageCategory,
			basePrice,
			image: images[0],
			images,
			minPax,
			packageItems,
			features,
			suitableFor,
			status,
			isActive,
			isAvailable
		}
	};
}

export function getReadOnlyPackages(): ReadOnlyPackageItem[] {
	return listPackageRecords();
}

export function createPackage(payload: unknown): PackageWriteResult {
	const parsed = parsePackagePayload(payload, { isCreate: true });
	if (!parsed.ok) {
		return { ok: false, status: 400, message: parsed.message };
	}

	const item = createPackageRecord(parsed.data);
	return { ok: true, item };
}

export function updatePackage(id: string, payload: unknown): PackageWriteResult {
	const normalizedId = parseRequiredString(id);
	if (!normalizedId) {
		return { ok: false, status: 400, message: 'package id wajib diisi.' };
	}

	const parsed = parsePackagePayload(payload, { isCreate: false, existingId: normalizedId });
	if (!parsed.ok) {
		return { ok: false, status: 400, message: parsed.message };
	}

	const item = updatePackageRecord(normalizedId, parsed.data);
	if (!item) {
		return { ok: false, status: 404, message: 'Package tidak ditemukan.' };
	}

	return { ok: true, item };
}

export function updatePackageStatus(
	id: string,
	payload: unknown
):
	| {
			ok: true;
			item: PackageRecord;
	  }
	| {
			ok: false;
			status: 400 | 404;
			message: string;
	  } {
	const normalizedId = parseRequiredString(id);
	if (!normalizedId) {
		return { ok: false, status: 400, message: 'package id wajib diisi.' };
	}

	if (!isRecord(payload)) {
		return { ok: false, status: 400, message: 'Payload tidak valid.' };
	}

	const status = parsePackageStatus(payload.status);
	if (!status) {
		return { ok: false, status: 400, message: 'status harus salah satu: active, inactive.' };
	}

	const item = updatePackageRecordStatus(normalizedId, status);
	if (!item) {
		return { ok: false, status: 404, message: 'Package tidak ditemukan.' };
	}

	return { ok: true, item };
}

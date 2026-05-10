import { mockCatalogPackages } from '$lib/mock/catalog';
import type { PageLoad } from './$types';

type PackageCatalogItem = {
	id: string;
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
	status: string;
	isActive: boolean;
	isAvailable: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function toSafeString(value: unknown, fallback = ''): string {
	if (typeof value !== 'string') return fallback;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : fallback;
}

function toSafeNumber(value: unknown, fallback = 0): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function toSafeBoolean(value: unknown, fallback = false): boolean {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'true' || normalized === '1') return true;
		if (normalized === 'false' || normalized === '0') return false;
	}
	return fallback;
}

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];

	return value
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

function adaptApiPackageItem(raw: unknown, index: number): PackageCatalogItem | null {
	if (!isRecord(raw)) return null;

	const status = toSafeString(raw.status, 'active');
	const category = toSafeString(raw.category, 'Paket');

	return {
		id: toSafeString(raw.id, `pkg-${index + 1}`),
		name: toSafeString(raw.name, 'Paket Catering'),
		slug: toSafeString(raw.slug, `paket-${index + 1}`),
		description: toSafeString(raw.description, ''),
		category,
		packageCategory: toSafeString(raw.packageCategory, category),
		basePrice: Math.max(0, Math.floor(toSafeNumber(raw.basePrice, 0))),
		image: toSafeString(raw.image, '/images/placeholder-package.jpg'),
		images: toStringArray(raw.images),
		minPax: Math.max(1, Math.floor(toSafeNumber(raw.minPax, 1))),
		packageItems: toStringArray(raw.packageItems),
		features: toStringArray(raw.features),
		suitableFor: toStringArray(raw.suitableFor),
		status,
		isActive: toSafeBoolean(raw.isActive, status !== 'inactive'),
		isAvailable: toSafeBoolean(raw.isAvailable, true)
	};
}

function toFallbackPackages(): PackageCatalogItem[] {
	return mockCatalogPackages.map((pkg) => ({
		id: pkg.id,
		name: pkg.name,
		slug: pkg.slug,
		description: pkg.description,
		category: pkg.category,
		packageCategory: pkg.packageCategory || pkg.category,
		basePrice: Math.max(0, Math.floor(pkg.basePrice)),
		image: pkg.image || '/images/placeholder-package.jpg',
		images: pkg.image ? [pkg.image] : [],
		minPax: Math.max(1, Math.floor(pkg.minPax ?? 1)),
		packageItems: Array.isArray(pkg.packageItems) ? pkg.packageItems : [],
		features: Array.isArray(pkg.features) ? pkg.features : [],
		suitableFor: Array.isArray(pkg.suitableFor) ? pkg.suitableFor : [],
		status: pkg.status || 'active',
		isActive: Boolean(pkg.isActive),
		isAvailable: Boolean(pkg.isAvailable)
	}));
}

function filterActiveAvailablePackages(items: PackageCatalogItem[]): PackageCatalogItem[] {
	return items.filter((pkg) => pkg.isActive && pkg.isAvailable && pkg.status !== 'inactive');
}

export const load: PageLoad = async ({ fetch }) => {
	const fallbackPackages = filterActiveAvailablePackages(toFallbackPackages());

	let packages = fallbackPackages;
	let dataSource: 'api' | 'mock' = 'mock';

	try {
		const response = await fetch('/api/packages');
		if (!response.ok) {
			throw new Error(`Package API gagal: HTTP ${response.status}`);
		}

		const payload = (await response.json()) as unknown;
		if (!isRecord(payload) || !Array.isArray(payload.items)) {
			throw new Error('Format response /api/packages tidak valid.');
		}

		const adaptedItems = payload.items
			.map((item, index) => adaptApiPackageItem(item, index))
			.filter((item): item is PackageCatalogItem => item !== null);
		const activePackages = filterActiveAvailablePackages(adaptedItems);

		if (activePackages.length > 0) {
			packages = activePackages;
			dataSource = 'api';
		} else {
			console.warn('Fallback ke mockCatalogPackages karena data package API kosong/tidak aktif.');
		}
	} catch (error) {
		console.warn('Fallback ke mockCatalogPackages karena gagal membaca /api/packages.', error);
	}

	return {
		packages,
		dataSource
	};
};

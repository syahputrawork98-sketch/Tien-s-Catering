import { mockCatalogPackages } from '$lib/mock/catalog';

export type DevPackageSeed = {
	id: string;
	name: string;
	slug: string;
	description: string;
	category: string;
	packageCategory: string;
	basePrice: number;
	image: string;
	imagesJson: string;
	minPax: number;
	packageItemsJson: string;
	featuresJson: string;
	suitableForJson: string;
	status: string;
	isActive: 0 | 1;
	isAvailable: 0 | 1;
	createdAt: string;
	updatedAt: string;
};

function toSafeStringArray(values: unknown): string[] {
	if (!Array.isArray(values)) return [];

	return values
		.filter((value): value is string => typeof value === 'string')
		.map((value) => value.trim())
		.filter((value) => value.length > 0);
}

function toSafeDate(value: unknown) {
	if (typeof value !== 'string' || value.trim().length === 0) {
		return new Date().toISOString();
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return new Date().toISOString();
	}

	return parsed.toISOString();
}

export const devPackageSeeds: DevPackageSeed[] = mockCatalogPackages.map((item) => {
	const packageCategory = (item.packageCategory || item.category || 'Paket').trim();
	const image = (item.image || '/images/placeholder-package.jpg').trim();
	const packageItems = toSafeStringArray(item.packageItems);
	const features = toSafeStringArray(item.features);
	const suitableFor = toSafeStringArray(item.suitableFor);

	return {
		id: item.id,
		name: item.name,
		slug: item.slug,
		description: item.description,
		category: item.category,
		packageCategory,
		basePrice: Math.max(0, Math.floor(item.basePrice)),
		image,
		imagesJson: JSON.stringify([image]),
		minPax: Math.max(1, Math.floor(item.minPax ?? 1)),
		packageItemsJson: JSON.stringify(packageItems),
		featuresJson: JSON.stringify(features),
		suitableForJson: JSON.stringify(suitableFor),
		status: item.status || 'active',
		isActive: item.isActive ? 1 : 0,
		isAvailable: item.isAvailable ? 1 : 0,
		createdAt: toSafeDate(item.createdAt),
		updatedAt: toSafeDate(item.updatedAt)
	};
});

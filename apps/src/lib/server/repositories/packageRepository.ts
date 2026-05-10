import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';
import { devPackageSeeds } from '$lib/server/dev-data/packages';

export type PackageRecord = {
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
	createdAt: string;
	updatedAt: string;
};

type RawPackageRow = {
	id: string;
	name: string;
	slug: string;
	description: string;
	category: string;
	packageCategory: string | null;
	basePrice: number;
	image: string;
	imagesJson: string | null;
	minPax: number;
	packageItemsJson: string | null;
	featuresJson: string | null;
	suitableForJson: string | null;
	status: string;
	isActive: number;
	isAvailable: number;
	createdAt: string;
	updatedAt: string;
};

let isPackageSeeded = false;

function parseStringArray(value: string | null | undefined): string[] {
	if (!value) return [];

	try {
		const parsed = JSON.parse(value) as unknown;
		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	} catch {
		return [];
	}
}

function seedPackages() {
	if (isPackageSeeded) return;

	const db = getDatabase();
	const insertPackage = db.prepare(
		`INSERT OR REPLACE INTO packages (
			id,
			name,
			slug,
			description,
			category,
			package_category,
			base_price,
			image,
			images_json,
			min_pax,
			package_items_json,
			features_json,
			suitable_for_json,
			status,
			is_active,
			is_available,
			created_at,
			updated_at
		) VALUES (
			@id,
			@name,
			@slug,
			@description,
			@category,
			@packageCategory,
			@basePrice,
			@image,
			@imagesJson,
			@minPax,
			@packageItemsJson,
			@featuresJson,
			@suitableForJson,
			@status,
			@isActive,
			@isAvailable,
			@createdAt,
			@updatedAt
		);`
	);

	const runSeed = db.transaction(() => {
		for (const pkg of devPackageSeeds) {
			insertPackage.run(pkg);
		}
	});

	runSeed();
	isPackageSeeded = true;
}

export function listPackageRecords(): PackageRecord[] {
	ensureDatabaseInitialized();
	seedPackages();

	const db = getDatabase();
	const query = db.prepare(
		`SELECT
			id AS id,
			name AS name,
			slug AS slug,
			description AS description,
			category AS category,
			package_category AS packageCategory,
			base_price AS basePrice,
			image AS image,
			images_json AS imagesJson,
			min_pax AS minPax,
			package_items_json AS packageItemsJson,
			features_json AS featuresJson,
			suitable_for_json AS suitableForJson,
			status AS status,
			is_active AS isActive,
			is_available AS isAvailable,
			created_at AS createdAt,
			updated_at AS updatedAt
		FROM packages
		ORDER BY updated_at DESC, name ASC;`
	);

	const rows = query.all() as RawPackageRow[];

	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		slug: row.slug,
		description: row.description,
		category: row.category,
		packageCategory: row.packageCategory || row.category,
		basePrice: Math.max(0, Number(row.basePrice)),
		image: row.image || '/images/placeholder-package.jpg',
		images: parseStringArray(row.imagesJson),
		minPax: Math.max(1, Number(row.minPax)),
		packageItems: parseStringArray(row.packageItemsJson),
		features: parseStringArray(row.featuresJson),
		suitableFor: parseStringArray(row.suitableForJson),
		status: row.status || 'active',
		isActive: Number(row.isActive) === 1,
		isAvailable: Number(row.isAvailable) === 1,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	}));
}

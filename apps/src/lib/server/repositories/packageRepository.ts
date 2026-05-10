import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';
import { devPackageSeeds } from '$lib/server/dev-data/packages';

export type PackageStatus = 'active' | 'inactive';

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
	status: PackageStatus;
	isActive: boolean;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CreatePackageRecordInput = {
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

export type UpdatePackageRecordInput = {
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

function toSafeStringArray(values: string[]): string[] {
	return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

function toStatus(value: string | null | undefined, fallback: PackageStatus = 'inactive'): PackageStatus {
	if (value === 'active' || value === 'inactive') {
		return value;
	}
	return fallback;
}

function mapRawPackageRow(row: RawPackageRow): PackageRecord {
	const category = row.category || 'Paket';
	const packageCategory = row.packageCategory || category;
	const status = toStatus(row.status, Number(row.isActive) === 1 ? 'active' : 'inactive');

	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		description: row.description,
		category,
		packageCategory,
		basePrice: Math.max(0, Number(row.basePrice)),
		image: row.image || '/images/placeholder-package.jpg',
		images: parseStringArray(row.imagesJson),
		minPax: Math.max(1, Number(row.minPax)),
		packageItems: parseStringArray(row.packageItemsJson),
		features: parseStringArray(row.featuresJson),
		suitableFor: parseStringArray(row.suitableForJson),
		status,
		isActive: Number(row.isActive) === 1,
		isAvailable: Number(row.isAvailable) === 1,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

function seedPackages() {
	if (isPackageSeeded) return;

	const db = getDatabase();
	const countRow = db.prepare('SELECT COUNT(1) AS total FROM packages;').get() as
		| { total?: number }
		| undefined;
	const totalPackages = Number(countRow?.total ?? 0);

	if (totalPackages > 0) {
		isPackageSeeded = true;
		return;
	}

	const insertPackage = db.prepare(
		`INSERT OR IGNORE INTO packages (
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

function getPackageByIdInternal(id: string): PackageRecord | null {
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
		WHERE id = @id
		LIMIT 1;`
	);

	const row = query.get({ id }) as RawPackageRow | undefined;
	if (!row) return null;
	return mapRawPackageRow(row);
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
	return rows.map((row) => mapRawPackageRow(row));
}

export function getPackageRecordById(id: string): PackageRecord | null {
	ensureDatabaseInitialized();
	seedPackages();
	return getPackageByIdInternal(id);
}

export function isPackageSlugInUse(slug: string, excludeId?: string): boolean {
	ensureDatabaseInitialized();
	seedPackages();

	const db = getDatabase();

	if (excludeId) {
		const row = db
			.prepare(
				`SELECT 1 AS exists_flag
				FROM packages
				WHERE slug = @slug
				  AND id <> @excludeId
				LIMIT 1;`
			)
			.get({ slug, excludeId }) as { exists_flag: number } | undefined;

		return Boolean(row);
	}

	const row = db
		.prepare(
			`SELECT 1 AS exists_flag
			FROM packages
			WHERE slug = @slug
			LIMIT 1;`
		)
		.get({ slug }) as { exists_flag: number } | undefined;

	return Boolean(row);
}

export function createPackageRecord(input: CreatePackageRecordInput): PackageRecord {
	ensureDatabaseInitialized();
	seedPackages();

	const db = getDatabase();
	const timestamp = new Date().toISOString();
	const id = crypto.randomUUID();

	const insertQuery = db.prepare(
		`INSERT INTO packages (
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

	insertQuery.run({
		id,
		name: input.name,
		slug: input.slug,
		description: input.description,
		category: input.category,
		packageCategory: input.packageCategory,
		basePrice: input.basePrice,
		image: input.image,
		imagesJson: JSON.stringify(toSafeStringArray(input.images)),
		minPax: input.minPax,
		packageItemsJson: JSON.stringify(toSafeStringArray(input.packageItems)),
		featuresJson: JSON.stringify(toSafeStringArray(input.features)),
		suitableForJson: JSON.stringify(toSafeStringArray(input.suitableFor)),
		status: input.status,
		isActive: input.isActive ? 1 : 0,
		isAvailable: input.isAvailable ? 1 : 0,
		createdAt: timestamp,
		updatedAt: timestamp
	});

	const created = getPackageByIdInternal(id);
	if (!created) {
		throw new Error('Package berhasil dibuat, tetapi gagal dibaca ulang dari database.');
	}

	return created;
}

export function updatePackageRecord(id: string, input: UpdatePackageRecordInput): PackageRecord | null {
	ensureDatabaseInitialized();
	seedPackages();

	const existing = getPackageByIdInternal(id);
	if (!existing) return null;

	const db = getDatabase();
	const timestamp = new Date().toISOString();

	const updateQuery = db.prepare(
		`UPDATE packages
		SET name = @name,
			slug = @slug,
			description = @description,
			category = @category,
			package_category = @packageCategory,
			base_price = @basePrice,
			image = @image,
			images_json = @imagesJson,
			min_pax = @minPax,
			package_items_json = @packageItemsJson,
			features_json = @featuresJson,
			suitable_for_json = @suitableForJson,
			status = @status,
			is_active = @isActive,
			is_available = @isAvailable,
			updated_at = @updatedAt
		WHERE id = @id;`
	);

	updateQuery.run({
		id,
		name: input.name,
		slug: input.slug,
		description: input.description,
		category: input.category,
		packageCategory: input.packageCategory,
		basePrice: input.basePrice,
		image: input.image,
		imagesJson: JSON.stringify(toSafeStringArray(input.images)),
		minPax: input.minPax,
		packageItemsJson: JSON.stringify(toSafeStringArray(input.packageItems)),
		featuresJson: JSON.stringify(toSafeStringArray(input.features)),
		suitableForJson: JSON.stringify(toSafeStringArray(input.suitableFor)),
		status: input.status,
		isActive: input.isActive ? 1 : 0,
		isAvailable: input.isAvailable ? 1 : 0,
		updatedAt: timestamp
	});

	return getPackageByIdInternal(id);
}

export function updatePackageRecordStatus(id: string, status: PackageStatus): PackageRecord | null {
	ensureDatabaseInitialized();
	seedPackages();

	const existing = getPackageByIdInternal(id);
	if (!existing) return null;

	const normalizedStatus = toStatus(status, existing.status);
	const isActive = normalizedStatus === 'active';
	const db = getDatabase();
	const timestamp = new Date().toISOString();

	db.prepare(
		`UPDATE packages
		SET status = @status,
			is_active = @isActive,
			updated_at = @updatedAt
		WHERE id = @id;`
	).run({
		id,
		status: normalizedStatus,
		isActive: isActive ? 1 : 0,
		updatedAt: timestamp
	});

	return getPackageByIdInternal(id);
}

import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';
import {
	type CreatePackageRequestInput,
	type CreatedPackageRequestSummary,
	packageRequestStatuses,
	type PackageRequestRecord,
	type PackageRequestReviewStatus,
	type PackageRequestStatus,
	type UpdatePackageRequestReviewInput,
	type UpdatedPackageRequestSummary
} from '$lib/server/types/packageRequest';

type RawPackageRequestRow = {
	id: string;
	requestNumber: string;
	packageId: string;
	packageName: string;
	customerName: string;
	whatsapp: string;
	eventDate: string;
	pax: number;
	location: string;
	notes: string;
	status: string;
	adminNote: string | null;
	estimatedPrice: number | null;
	reviewedAt: string | null;
	user_id: string | null;
	convertedOrderId: string | null;
	createdAt: string;
	updatedAt: string;
};

type RawPackageRequestUpdateRow = {
	id: string;
	requestNumber: string;
	status: string;
	adminNote: string | null;
	estimatedPrice: number | null;
	reviewedAt: string | null;
	updatedAt: string;
};

type SqliteTableColumnInfo = {
	name: string;
};

function formatRequestNumberTimestamp(now: Date) {
	const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
		now.getDate()
	).padStart(2, '0')}`;
	const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
		2,
		'0'
	)}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
	const randomPart = crypto.randomUUID().replaceAll('-', '').slice(0, 4).toUpperCase();

	return `TPR-${datePart}-${timePart}${randomPart}`;
}

function normalizeRequestStatus(value: string | null | undefined): PackageRequestStatus {
	if (value && packageRequestStatuses.includes(value as PackageRequestStatus)) {
		return value as PackageRequestStatus;
	}
	return 'new';
}

function normalizeReviewStatus(value: string | null | undefined): PackageRequestReviewStatus {
	if (
		value === 'new' ||
		value === 'reviewing' ||
		value === 'quoted' ||
		value === 'rejected' ||
		value === 'cancelled'
	) {
		return value;
	}

	return 'new';
}

function hasColumn(db: ReturnType<typeof getDatabase>, tableName: string, columnName: string): boolean {
	const columns = db.prepare(`PRAGMA table_info(${tableName});`).all() as SqliteTableColumnInfo[];
	return columns.some((column) => column.name === columnName);
}

function ensurePackageRequestReviewColumns(db: ReturnType<typeof getDatabase>) {
	if (!hasColumn(db, 'package_requests', 'admin_note')) {
		db.exec(`ALTER TABLE package_requests ADD COLUMN admin_note TEXT;`);
	}

	if (!hasColumn(db, 'package_requests', 'estimated_price')) {
		db.exec(`ALTER TABLE package_requests ADD COLUMN estimated_price INTEGER;`);
	}

	if (!hasColumn(db, 'package_requests', 'reviewed_at')) {
		db.exec(`ALTER TABLE package_requests ADD COLUMN reviewed_at TEXT;`);
	}

	if (!hasColumn(db, 'package_requests', 'converted_order_id')) {
		db.exec(`ALTER TABLE package_requests ADD COLUMN converted_order_id TEXT;`);
	}
}

export function linkPackageRequestToOrderRecord(
	requestId: string,
	orderId: string
): boolean {
	ensureDatabaseInitialized();
	const db = getDatabase();
	ensurePackageRequestReviewColumns(db);

	const updateQuery = db.prepare(
		`UPDATE package_requests
		SET status = 'converted_to_order',
			converted_order_id = @orderId,
			updated_at = @updatedAt
		WHERE id = @id;`
	);

	const result = updateQuery.run({
		id: requestId,
		orderId,
		updatedAt: new Date().toISOString()
	});

	return result.changes > 0;
}

export function createPackageRequestRecord(
	input: CreatePackageRequestInput
): CreatedPackageRequestSummary {
	ensureDatabaseInitialized();
	const db = getDatabase();
	ensurePackageRequestReviewColumns(db);

	const insertQuery = db.prepare(
		`INSERT INTO package_requests (
			id,
			request_number,
			package_id,
			package_name_snapshot,
			customer_name,
			whatsapp,
			event_date,
			pax,
			location,
			notes,
			status,
			admin_note,
			estimated_price,
			reviewed_at,
			user_id,
			created_at,
			updated_at
		) VALUES (
			@id,
			@requestNumber,
			@packageId,
			@packageNameSnapshot,
			@customerName,
			@whatsapp,
			@eventDate,
			@pax,
			@location,
			@notes,
			@status,
			@adminNote,
			@estimatedPrice,
			@reviewedAt,
			@userId,
			@createdAt,
			@updatedAt
		);`
	);

	const now = new Date();
	const timestamp = now.toISOString();
	const id = crypto.randomUUID();
	const requestNumber = formatRequestNumberTimestamp(now);
	const normalizedStatus = normalizeRequestStatus(input.status);

	insertQuery.run({
		id,
		requestNumber,
		packageId: input.packageId,
		packageNameSnapshot: input.packageNameSnapshot,
		customerName: input.customerName,
		whatsapp: input.whatsapp,
		eventDate: input.eventDate,
		pax: input.pax,
		location: input.location,
		notes: input.notes,
		status: normalizedStatus,
		adminNote: null,
		estimatedPrice: null,
		reviewedAt: null,
		userId: input.userId ?? null,
		createdAt: timestamp,
		updatedAt: timestamp
	});

	return {
		id,
		requestNumber,
		packageId: input.packageId,
		packageName: input.packageNameSnapshot,
		customerName: input.customerName,
		whatsapp: input.whatsapp,
		eventDate: input.eventDate,
		pax: input.pax,
		location: input.location,
		notes: input.notes,
		status: normalizedStatus,
		createdAt: timestamp,
		adminNote: null,
		estimatedPrice: null,
		reviewedAt: null
	};
}

export function listPackageRequestRecords(filters?: { userId?: string }): PackageRequestRecord[] {
	ensureDatabaseInitialized();
	const db = getDatabase();
	ensurePackageRequestReviewColumns(db);

	let sql = `SELECT
			id AS id,
			request_number AS requestNumber,
			package_id AS packageId,
			package_name_snapshot AS packageName,
			customer_name AS customerName,
			whatsapp AS whatsapp,
			event_date AS eventDate,
			pax AS pax,
			location AS location,
			notes AS notes,
			status AS status,
			admin_note AS adminNote,
			estimated_price AS estimatedPrice,
			reviewed_at AS reviewedAt,
			user_id AS userId,
			converted_order_id AS convertedOrderId,
			created_at AS createdAt,
			updated_at AS updatedAt
		FROM package_requests`;

	const params: any = {};
	if (filters?.userId) {
		sql += ` WHERE user_id = @userId`;
		params.userId = filters.userId;
	}

	sql += ` ORDER BY created_at DESC;`;

	const query = db.prepare(sql);
	const rows = query.all(params) as (RawPackageRequestRow & { userId: string | null })[];
	return rows.map((row) => ({
		id: row.id,
		requestNumber: row.requestNumber,
		packageId: row.packageId,
		packageName: row.packageName,
		customerName: row.customerName,
		whatsapp: row.whatsapp,
		eventDate: row.eventDate,
		pax: Math.max(1, Number(row.pax)),
		location: row.location,
		notes: row.notes ?? '',
		status: normalizeRequestStatus(row.status),
		userId: row.userId,
		adminNote: row.adminNote ?? null,
		estimatedPrice: row.estimatedPrice !== null ? Math.max(0, Number(row.estimatedPrice)) : null,
		reviewedAt: row.reviewedAt ?? null,
		convertedOrderId: row.convertedOrderId ?? null,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	}));
}

export function updatePackageRequestReviewRecord(
	requestId: string,
	input: UpdatePackageRequestReviewInput
): UpdatedPackageRequestSummary | null {
	ensureDatabaseInitialized();
	const db = getDatabase();
	ensurePackageRequestReviewColumns(db);

	const selectQuery = db.prepare(
		`SELECT
			id AS id,
			request_number AS requestNumber,
			status AS status,
			admin_note AS adminNote,
			estimated_price AS estimatedPrice,
			reviewed_at AS reviewedAt,
			updated_at AS updatedAt
		FROM package_requests
		WHERE id = @id
		LIMIT 1;`
	);

	const existing = selectQuery.get({ id: requestId }) as RawPackageRequestUpdateRow | undefined;
	if (!existing) {
		return null;
	}

	const timestamp = new Date().toISOString();
	const updateQuery = db.prepare(
		`UPDATE package_requests
		SET status = @status,
			admin_note = @adminNote,
			estimated_price = @estimatedPrice,
			reviewed_at = @reviewedAt,
			updated_at = @updatedAt
		WHERE id = @id;`
	);

	updateQuery.run({
		id: requestId,
		status: input.status,
		adminNote: input.adminNote,
		estimatedPrice: input.estimatedPrice,
		reviewedAt: timestamp,
		updatedAt: timestamp
	});

	return {
		id: existing.id,
		requestNumber: existing.requestNumber,
		status: normalizeReviewStatus(input.status),
		adminNote: input.adminNote,
		estimatedPrice: input.estimatedPrice,
		reviewedAt: timestamp,
		updatedAt: timestamp
	};
}

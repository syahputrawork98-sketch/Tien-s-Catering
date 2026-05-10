import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';
import {
	type CreatePackageRequestInput,
	type CreatedPackageRequestSummary,
	packageRequestStatuses,
	type PackageRequestRecord,
	type PackageRequestStatus
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
	createdAt: string;
	updatedAt: string;
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

export function createPackageRequestRecord(
	input: CreatePackageRequestInput
): CreatedPackageRequestSummary {
	ensureDatabaseInitialized();
	const db = getDatabase();

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
		createdAt: timestamp
	};
}

export function listPackageRequestRecords(): PackageRequestRecord[] {
	ensureDatabaseInitialized();
	const db = getDatabase();

	const query = db.prepare(
		`SELECT
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
			created_at AS createdAt,
			updated_at AS updatedAt
		FROM package_requests
		ORDER BY created_at DESC;`
	);

	const rows = query.all() as RawPackageRequestRow[];
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
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	}));
}

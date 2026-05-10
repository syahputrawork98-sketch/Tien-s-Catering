export const packageRequestStatuses = [
	'new',
	'reviewing',
	'quoted',
	'rejected',
	'cancelled',
	'converted_to_order'
] as const;

export type PackageRequestStatus = (typeof packageRequestStatuses)[number];

export type CreatePackageRequestInput = {
	packageId: string;
	packageNameSnapshot: string;
	customerName: string;
	whatsapp: string;
	eventDate: string;
	pax: number;
	location: string;
	notes: string;
	status: PackageRequestStatus;
};

export type CreatedPackageRequestSummary = {
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
	status: PackageRequestStatus;
	createdAt: string;
};

export type PackageRequestRecord = {
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
	status: PackageRequestStatus;
	createdAt: string;
	updatedAt: string;
};

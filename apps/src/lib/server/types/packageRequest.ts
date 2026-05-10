export const packageRequestStatuses = [
	'new',
	'reviewing',
	'quoted',
	'rejected',
	'cancelled',
	'converted_to_order'
] as const;

export type PackageRequestStatus = (typeof packageRequestStatuses)[number];
export const packageRequestReviewStatuses = ['new', 'reviewing', 'quoted', 'rejected', 'cancelled'] as const;
export type PackageRequestReviewStatus = (typeof packageRequestReviewStatuses)[number];

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
	adminNote: string | null;
	estimatedPrice: number | null;
	reviewedAt: string | null;
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
	adminNote: string | null;
	estimatedPrice: number | null;
	reviewedAt: string | null;
};

export type UpdatePackageRequestReviewInput = {
	status: PackageRequestReviewStatus;
	adminNote: string | null;
	estimatedPrice: number | null;
};

export type UpdatedPackageRequestSummary = {
	id: string;
	requestNumber: string;
	status: PackageRequestReviewStatus;
	adminNote: string | null;
	estimatedPrice: number | null;
	reviewedAt: string | null;
	updatedAt: string;
};

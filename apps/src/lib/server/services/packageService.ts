import { listPackageRecords, type PackageRecord } from '$lib/server/repositories/packageRepository';

export type ReadOnlyPackageItem = PackageRecord;

export function getReadOnlyPackages(): ReadOnlyPackageItem[] {
	return listPackageRecords();
}

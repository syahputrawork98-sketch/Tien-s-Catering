import { getMenuStockRecords, type MenuStockRecord } from '$lib/server/repositories/menuRepository';

export type ReadOnlyMenuItem = MenuStockRecord;

export function getReadOnlyMenus(): ReadOnlyMenuItem[] {
	return getMenuStockRecords();
}

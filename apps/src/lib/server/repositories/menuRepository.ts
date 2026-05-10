import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';

export type MenuStockRecord = {
	id: string;
	name: string;
	description: string;
	category: string;
	basePrice: number;
	image: string;
	activeDate: string;
	dailyStock: number;
	remainingStock: number;
	stockLabel: string;
	status: 'active' | 'sold_out';
};

type RawMenuStockRow = {
	id: string;
	name: string;
	description: string;
	category: string;
	basePrice: number;
	image: string;
	activeDate: string;
	dailyStock: number;
	remainingStock: number;
	stockLabel: string;
	status: string;
};

export function getMenuStockRecords(): MenuStockRecord[] {
	ensureDatabaseInitialized();
	const db = getDatabase();

	const query = db.prepare(
		`SELECT
			m.id AS id,
			m.name AS name,
			m.description AS description,
			m.category AS category,
			m.base_price AS basePrice,
			m.image AS image,
			s.active_date AS activeDate,
			s.daily_stock AS dailyStock,
			s.remaining_stock AS remainingStock,
			s.stock_label AS stockLabel,
			s.status AS status
		FROM menu_daily_stock s
		INNER JOIN menus m ON m.id = s.menu_id
		ORDER BY s.active_date ASC, m.name ASC;`
	);

	const rows = query.all() as RawMenuStockRow[];

	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		category: row.category,
		basePrice: Number(row.basePrice),
		image: row.image,
		activeDate: row.activeDate,
		dailyStock: Math.max(0, Number(row.dailyStock)),
		remainingStock: Math.max(0, Number(row.remainingStock)),
		stockLabel: row.stockLabel,
		status: row.status === 'sold_out' ? 'sold_out' : 'active'
	}));
}

export const createTablesSql = [
	`CREATE TABLE IF NOT EXISTS dev_personas (
		code TEXT PRIMARY KEY,
		label TEXT NOT NULL,
		description TEXT NOT NULL
	);`,
	`CREATE TABLE IF NOT EXISTS menus (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		description TEXT NOT NULL,
		category TEXT NOT NULL,
		base_price INTEGER NOT NULL,
		image TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'active'
	);`,
	`CREATE TABLE IF NOT EXISTS menu_daily_stock (
		menu_id TEXT NOT NULL,
		active_date TEXT NOT NULL,
		daily_stock INTEGER NOT NULL,
		remaining_stock INTEGER NOT NULL,
		stock_label TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'active',
		PRIMARY KEY (menu_id, active_date),
		FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE CASCADE
	);`
] as const;

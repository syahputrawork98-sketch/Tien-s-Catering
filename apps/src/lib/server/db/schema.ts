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
	);`,
	`CREATE TABLE IF NOT EXISTS packages (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		slug TEXT NOT NULL UNIQUE,
		description TEXT NOT NULL,
		category TEXT NOT NULL,
		package_category TEXT,
		base_price INTEGER NOT NULL,
		image TEXT NOT NULL,
		images_json TEXT NOT NULL DEFAULT '[]',
		min_pax INTEGER NOT NULL DEFAULT 1,
		package_items_json TEXT NOT NULL DEFAULT '[]',
		features_json TEXT NOT NULL DEFAULT '[]',
		suitable_for_json TEXT NOT NULL DEFAULT '[]',
		status TEXT NOT NULL DEFAULT 'active',
		is_active INTEGER NOT NULL DEFAULT 1,
		is_available INTEGER NOT NULL DEFAULT 1,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);`,
	`CREATE TABLE IF NOT EXISTS orders (
		id TEXT PRIMARY KEY,
		order_number TEXT NOT NULL UNIQUE,
		customer_name TEXT NOT NULL,
		whatsapp TEXT NOT NULL,
		delivery_date TEXT NOT NULL,
		notes TEXT NOT NULL DEFAULT '',
		status TEXT NOT NULL DEFAULT 'new',
		payment_status TEXT NOT NULL DEFAULT 'unpaid',
		subtotal INTEGER NOT NULL DEFAULT 0,
		tax_amount INTEGER NOT NULL DEFAULT 0,
		delivery_fee INTEGER NOT NULL DEFAULT 0,
		total_amount INTEGER NOT NULL DEFAULT 0,
		dev_persona_code TEXT,
		stock_status TEXT NOT NULL DEFAULT 'not_deducted',
		stock_deducted_at TEXT,
		stock_released_at TEXT,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);`,
	`CREATE TABLE IF NOT EXISTS order_items (
		id TEXT PRIMARY KEY,
		order_id TEXT NOT NULL,
		menu_id TEXT,
		name TEXT NOT NULL,
		quantity INTEGER NOT NULL,
		price INTEGER NOT NULL,
		subtotal INTEGER NOT NULL,
		FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
	);`,
	`CREATE TABLE IF NOT EXISTS delivery_info (
		order_id TEXT PRIMARY KEY,
		department_or_unit TEXT,
		floor TEXT,
		location_note TEXT,
		address_summary TEXT,
		FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
	);`,
	`CREATE TABLE IF NOT EXISTS payment_info (
		order_id TEXT PRIMARY KEY,
		payment_method TEXT NOT NULL,
		payment_status TEXT NOT NULL,
		total_amount INTEGER NOT NULL,
		paid_amount INTEGER NOT NULL DEFAULT 0,
		remaining_amount INTEGER NOT NULL,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
	);`
] as const;

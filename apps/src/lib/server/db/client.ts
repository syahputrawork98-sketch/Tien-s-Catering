import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { env } from '$env/dynamic/private';
import { devMenuSeeds } from '$lib/server/dev-data/menus';
import { devPersonaSeeds } from '$lib/server/dev-data/personas';
import { createTablesSql } from './schema';

const defaultDbPath = join(process.cwd(), '.local-db', 'tiens-catering.local.sqlite');
const sqliteDbPath = env.TC_SQLITE_PATH?.trim() || defaultDbPath;

let database: Database.Database | null = null;
let isInitialized = false;

function getWritableDbPath() {
	mkdirSync(dirname(sqliteDbPath), { recursive: true });
	return sqliteDbPath;
}

function seedDevPersonas(db: Database.Database) {
	const insertPersona = db.prepare(
		`INSERT OR REPLACE INTO dev_personas (code, label, description)
		 VALUES (@code, @label, @description);`
	);
	const runSeed = db.transaction(() => {
		for (const persona of devPersonaSeeds) {
			insertPersona.run(persona);
		}
	});

	runSeed();
}

function seedMenusAndStocks(db: Database.Database) {
	const insertMenu = db.prepare(
		`INSERT OR REPLACE INTO menus (id, name, description, category, base_price, image, status)
		 VALUES (@id, @name, @description, @category, @basePrice, @image, @status);`
	);

	const insertDailyStock = db.prepare(
		`INSERT OR REPLACE INTO menu_daily_stock
		 (menu_id, active_date, daily_stock, remaining_stock, stock_label, status)
		 VALUES (@id, @activeDate, @dailyStock, @remainingStock, @stockLabel, @status);`
	);

	const runSeed = db.transaction(() => {
		for (const menu of devMenuSeeds) {
			insertMenu.run(menu);
			insertDailyStock.run(menu);
		}
	});

	runSeed();
}

export function getDatabase() {
	if (database) return database;

	const dbFilePath = getWritableDbPath();
	const db = new Database(dbFilePath);

	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	database = db;
	return db;
}

export function ensureDatabaseInitialized() {
	if (isInitialized) return;

	const db = getDatabase();
	for (const sql of createTablesSql) {
		db.exec(sql);
	}

	seedDevPersonas(db);
	seedMenusAndStocks(db);

	isInitialized = true;
}

export function getLocalDatabasePath() {
	return sqliteDbPath;
}

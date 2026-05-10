import { mockMenus } from '$lib/mock/menu';
import type { PageLoad } from './$types';

type ApiMenuItem = {
	id: string;
	name: string;
	description: string;
	category: string;
	basePrice: number;
	image: string;
	activeDate?: string;
	dailyStock?: number;
	remainingStock?: number;
	stockLabel?: string;
	status?: string;
	stock: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function toSafeString(value: unknown, fallback = ''): string {
	if (typeof value !== 'string') return fallback;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : fallback;
}

function toOptionalString(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function toSafeNumber(value: unknown, fallback = 0): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function toOptionalStock(value: unknown): number | undefined {
	if (value === undefined || value === null) return undefined;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return undefined;
	return Math.max(0, Math.floor(parsed));
}

function adaptApiMenuItem(raw: unknown, index: number): ApiMenuItem | null {
	if (!isRecord(raw)) return null;

	const dailyStock = toOptionalStock(raw.dailyStock);
	const remainingStock = toOptionalStock(raw.remainingStock);

	return {
		id: toSafeString(raw.id, `api-menu-${index + 1}`),
		name: toSafeString(raw.name, 'Menu Harian'),
		description: toSafeString(raw.description, ''),
		category: toSafeString(raw.category, 'Umum'),
		basePrice: Math.max(0, Math.floor(toSafeNumber(raw.basePrice, 0))),
		image: toSafeString(raw.image, '/images/placeholder-menu.jpg'),
		activeDate: toOptionalString(raw.activeDate),
		dailyStock,
		remainingStock,
		stockLabel: toOptionalString(raw.stockLabel),
		status: toSafeString(raw.status, 'active'),
		stock: remainingStock ?? dailyStock ?? 0
	};
}

export const load: PageLoad = async ({ url, fetch }) => {
	// Generate metadata for the 7-day Date Scroller
	const dateItems = Array.from({ length: 7 }).map((_, i) => {
		const d = new Date();
		d.setDate(d.getDate() + i);
		const dateStr = d.toISOString().split('T')[0];

		return {
			date: dateStr,
			label: i === 0 ? 'HARI INI' : d.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase(),
			dayNum: d.getDate(),
			fullLabel: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
		};
	});

	const selectedDate = url.searchParams.get('date') || dateItems[0].date;

	let menus = mockMenus;
	let dataSource: 'api' | 'mock' = 'mock';

	try {
		const response = await fetch('/api/menus');
		if (!response.ok) {
			throw new Error(`Menu API gagal: HTTP ${response.status}`);
		}

		const payload = (await response.json()) as unknown;
		if (!isRecord(payload) || !Array.isArray(payload.items)) {
			throw new Error('Format response /api/menus tidak valid');
		}

		menus = payload.items
			.map((item, index) => adaptApiMenuItem(item, index))
			.filter((item): item is ApiMenuItem => item !== null);
		dataSource = 'api';
	} catch (error) {
		console.warn('Fallback ke mockMenus karena gagal membaca /api/menus', error);
	}

	return {
		menus,
		selectedDate,
		dateItems,
		dataSource
	};
};

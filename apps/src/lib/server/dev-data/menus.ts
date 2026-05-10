import { mockCatalogItems } from '$lib/mock/catalog';

export type DevMenuSeed = {
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
	status: 'active';
};

const todayIsoDate = new Date().toISOString().slice(0, 10);

export const devMenuSeeds: DevMenuSeed[] = mockCatalogItems
	.filter((item) => item.type === 'menu')
	.map((item) => {
		const safeDailyStock = Math.max(0, Math.floor(item.dailyStock ?? 0));

		return {
			id: item.id,
			name: item.name,
			description: item.description,
			category: item.category,
			basePrice: item.basePrice,
			image: item.image || '/images/placeholder-menu.jpg',
			activeDate: item.activeDate || todayIsoDate,
			dailyStock: safeDailyStock,
			remainingStock: safeDailyStock,
			stockLabel: item.stockLabel || (safeDailyStock > 0 ? 'Tersedia' : 'Habis'),
			status: 'active'
		};
	});

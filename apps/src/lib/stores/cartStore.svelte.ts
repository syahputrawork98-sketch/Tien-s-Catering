import { browser } from '$app/environment';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	image: string;
	category: string;
	quantity: number;
	availableStock?: number;
	deliveryDate: string; // ISO Date String YYYY-MM-DD
}

type AddItemMenuPayload = {
	id: string;
	name: string;
	price: number;
	image: string;
	category: string;
	stock?: number;
	dailyStock?: number;
	availableStock?: number;
};

export type AddItemResult = 'added' | 'out_of_stock' | 'stock_limit_reached';
export type UpdateQuantityResult =
	| 'updated'
	| 'removed'
	| 'stock_limit_reached'
	| 'not_found';

class CartStore {
	items = $state<CartItem[]>([]);
	isDrawerOpen = $state(false);

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('cart');
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					this.items = this.normalizeSavedCart(parsed);
				} catch (e) {
					console.error('Failed to parse cart from localStorage', e);
				}
			}
		}

		// Effect to save to localStorage whenever items change
		$effect.root(() => {
			$effect(() => {
				if (browser) {
					localStorage.setItem('cart', JSON.stringify(this.items));
				}
			});
		});
	}

	private sanitizeStock(value: unknown): number | undefined {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) return undefined;
		return Math.max(0, Math.floor(parsed));
	}

	private resolveMenuStock(menu: AddItemMenuPayload): number | undefined {
		return this.sanitizeStock(menu.availableStock ?? menu.stock ?? menu.dailyStock);
	}

	private resolveItemStock(item: CartItem): number | undefined {
		return this.sanitizeStock(item.availableStock);
	}

	private normalizeSavedCart(rawItems: unknown): CartItem[] {
		if (!Array.isArray(rawItems)) return [];

		return rawItems
			.map((raw) => {
				if (!raw || typeof raw !== 'object') return null;

				const item = raw as Record<string, unknown>;
				const id = typeof item.id === 'string' ? item.id : '';
				const name = typeof item.name === 'string' ? item.name : '';
				const image = typeof item.image === 'string' ? item.image : '';
				const category = typeof item.category === 'string' ? item.category : '';
				const deliveryDate = typeof item.deliveryDate === 'string' ? item.deliveryDate : '';

				const price = Number(item.price);
				const quantity = Math.floor(Number(item.quantity));

				if (!id || !name || !Number.isFinite(price) || quantity <= 0) {
					return null;
				}

				const normalized: CartItem = {
					id,
					name,
					price,
					image,
					category,
					quantity,
					deliveryDate
				};

				const normalizedStock = this.sanitizeStock(
					item.availableStock ?? item.stock ?? item.dailyStock
				);
				if (normalizedStock !== undefined) {
					normalized.availableStock = normalizedStock;
				}

				return normalized;
			})
			.filter((item): item is CartItem => item !== null);
	}

	addItem(menu: AddItemMenuPayload, date: string): AddItemResult {
		// We group by both ID AND Date. 
		// If a user adds the same menu for two different dates, they should be different lines.
		const existing = this.items.find((i) => i.id === menu.id && i.deliveryDate === date);
		const menuStock = this.resolveMenuStock(menu);
		const effectiveStock = menuStock ?? existing?.availableStock;

		if (effectiveStock !== undefined && effectiveStock <= 0) {
			return 'out_of_stock';
		}
		
		if (existing) {
			if (menuStock !== undefined) {
				existing.availableStock = menuStock;
			}

			if (existing.availableStock !== undefined && existing.quantity >= existing.availableStock) {
				return 'stock_limit_reached';
			}

			existing.quantity += 1;
		} else {
			const newItem: CartItem = {
				id: menu.id,
				name: menu.name,
				price: menu.price,
				image: menu.image,
				category: menu.category,
				quantity: 1,
				deliveryDate: date
			};

			if (effectiveStock !== undefined) {
				newItem.availableStock = effectiveStock;
			}

			this.items.push(newItem);
		}
		this.isDrawerOpen = true; // Auto open when adding
		return 'added';
	}

	removeItem(id: string, date: string) {
		this.items = this.items.filter((i) => !(i.id === id && i.deliveryDate === date));
	}

	updateQuantity(id: string, date: string, delta: number): UpdateQuantityResult {
		const item = this.items.find((i) => i.id === id && i.deliveryDate === date);
		if (!item) {
			return 'not_found';
		}

		const newQty = item.quantity + delta;
		if (newQty <= 0) {
			this.removeItem(id, date);
			return 'removed';
		}

		const stockLimit = this.resolveItemStock(item);
		if (delta > 0 && stockLimit !== undefined && newQty > stockLimit) {
			return 'stock_limit_reached';
		}

		item.quantity = newQty;
		return 'updated';
	}

	clear() {
		this.items = [];
	}

	totalItems = $derived(this.items.reduce((acc, i) => acc + i.quantity, 0));
	totalPrice = $derived(this.items.reduce((acc, i) => acc + i.quantity * i.price, 0));

	toggleDrawer() {
		this.isDrawerOpen = !this.isDrawerOpen;
	}
}

export const cart = new CartStore();

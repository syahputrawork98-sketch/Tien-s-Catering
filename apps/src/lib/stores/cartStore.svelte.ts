import { browser } from '$app/environment';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	image: string;
	category: string;
	quantity: number;
	deliveryDate: string; // ISO Date String YYYY-MM-DD
}

class CartStore {
	items = $state<CartItem[]>([]);
	isDrawerOpen = $state(false);

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('cart');
			if (saved) {
				try {
					this.items = JSON.parse(saved);
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

	addItem(menu: { id: string; name: string; price: number; image: string; category: string }, date: string) {
		// We group by both ID AND Date. 
		// If a user adds the same menu for two different dates, they should be different lines.
		const existing = this.items.find((i) => i.id === menu.id && i.deliveryDate === date);
		
		if (existing) {
			existing.quantity += 1;
		} else {
			this.items.push({ ...menu, quantity: 1, deliveryDate: date });
		}
		this.isDrawerOpen = true; // Auto open when adding
	}

	removeItem(id: string, date: string) {
		this.items = this.items.filter((i) => !(i.id === id && i.deliveryDate === date));
	}

	updateQuantity(id: string, date: string, delta: number) {
		const item = this.items.find((i) => i.id === id && i.deliveryDate === date);
		if (item) {
			const newQty = item.quantity + delta;
			if (newQty <= 0) {
				this.removeItem(id, date);
			} else {
				item.quantity = newQty;
			}
		}
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

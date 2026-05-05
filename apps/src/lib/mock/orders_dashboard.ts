export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    menuName: string;
    orderDate: string;
    deliveryDate: string;
    status: OrderStatus;
    total: number;
    items: OrderItem[];
    type: 'active' | 'history';
}

export const dashboardOrders: Order[] = [
    // Active Orders
    {
        id: '1',
        orderNumber: 'TC-2026-001',
        menuName: 'Paket Buffet Premium A',
        orderDate: '2026-05-05',
        deliveryDate: '2026-05-10',
        status: 'PENDING',
        total: 2500000,
        type: 'active',
        items: [{ name: 'Buffet Premium A', quantity: 50, price: 50000 }]
    },
    {
        id: '2',
        orderNumber: 'TC-2026-002',
        menuName: 'Nasi Box Ayam Bakar',
        orderDate: '2026-05-05',
        deliveryDate: '2026-05-06',
        status: 'PROCESSING',
        total: 750000,
        type: 'active',
        items: [{ name: 'Nasi Box Ayam Bakar', quantity: 30, price: 25000 }]
    },
    {
        id: '3',
        orderNumber: 'TC-2026-003',
        menuName: 'Snack Box Arisan',
        orderDate: '2026-05-04',
        deliveryDate: '2026-05-05',
        status: 'SHIPPED',
        total: 450000,
        type: 'active',
        items: [{ name: 'Snack Box Arisan', quantity: 30, price: 15000 }]
    },
    // History Orders
    {
        id: '4',
        orderNumber: 'TC-2026-004',
        menuName: 'Paket Wedding Bronze',
        orderDate: '2026-05-01',
        deliveryDate: '2026-05-02',
        status: 'COMPLETED',
        total: 15000000,
        type: 'history',
        items: [{ name: 'Paket Wedding Bronze', quantity: 200, price: 75000 }]
    },
    {
        id: '5',
        orderNumber: 'TC-2026-005',
        menuName: 'Tumpeng Mini Ultah',
        orderDate: '2026-05-01',
        deliveryDate: '2026-05-02',
        status: 'COMPLETED',
        total: 850000,
        type: 'history',
        items: [{ name: 'Tumpeng Mini Ultah', quantity: 10, price: 85000 }]
    },
    {
        id: '6',
        orderNumber: 'TC-2026-006',
        menuName: 'Coffee Break Meeting',
        orderDate: '2026-04-25',
        deliveryDate: '2026-04-26',
        status: 'COMPLETED',
        total: 1200000,
        type: 'history',
        items: [{ name: 'Coffee Break Meeting', quantity: 40, price: 30000 }]
    },
    {
        id: '7',
        orderNumber: 'TC-2026-007',
        menuName: 'Nasi Liwet Sunda',
        orderDate: '2026-04-20',
        deliveryDate: '2026-04-21',
        status: 'CANCELLED',
        total: 600000,
        type: 'history',
        items: [{ name: 'Nasi Liwet Sunda', quantity: 20, price: 30000 }]
    }
];

export function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(value);
}

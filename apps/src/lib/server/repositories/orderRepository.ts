import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';
import type {
	CreateOrderInput,
	CreatedOrderSummary,
	PaymentStatus,
	OrderStatus,
	OrderListItem,
	OrderListRecord,
	UpdatedOrderPaymentStatusSummary,
	UpdatedOrderStatusSummary
} from '$lib/server/types/order';

function formatOrderNumberTimestamp(now: Date) {
	const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
		now.getDate()
	).padStart(2, '0')}`;
	const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
		2,
		'0'
	)}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
	const randomPart = crypto.randomUUID().replaceAll('-', '').slice(0, 4).toUpperCase();

	return `TC-${datePart}-${timePart}${randomPart}`;
}

export function createOrderRecord(input: CreateOrderInput): CreatedOrderSummary {
	ensureDatabaseInitialized();
	const db = getDatabase();

	const insertOrder = db.prepare(
		`INSERT INTO orders (
			id,
			order_number,
			customer_name,
			whatsapp,
			delivery_date,
			notes,
			status,
			payment_status,
			subtotal,
			tax_amount,
			delivery_fee,
			total_amount,
			dev_persona_code,
			created_at,
			updated_at
		) VALUES (
			@id,
			@orderNumber,
			@customerName,
			@whatsapp,
			@deliveryDate,
			@notes,
			@status,
			@paymentStatus,
			@subtotal,
			@taxAmount,
			@deliveryFee,
			@totalAmount,
			@devPersonaCode,
			@createdAt,
			@updatedAt
		);`
	);

	const insertOrderItem = db.prepare(
		`INSERT INTO order_items (
			id,
			order_id,
			menu_id,
			name,
			quantity,
			price,
			subtotal
		) VALUES (
			@id,
			@orderId,
			@menuId,
			@name,
			@quantity,
			@price,
			@subtotal
		);`
	);

	const insertDeliveryInfo = db.prepare(
		`INSERT INTO delivery_info (
			order_id,
			department_or_unit,
			floor,
			location_note,
			address_summary
		) VALUES (
			@orderId,
			@departmentOrUnit,
			@floor,
			@locationNote,
			@addressSummary
		);`
	);

	const insertPaymentInfo = db.prepare(
		`INSERT INTO payment_info (
			order_id,
			payment_method,
			payment_status,
			total_amount,
			paid_amount,
			remaining_amount,
			created_at,
			updated_at
		) VALUES (
			@orderId,
			@paymentMethod,
			@paymentStatus,
			@totalAmount,
			@paidAmount,
			@remainingAmount,
			@createdAt,
			@updatedAt
		);`
	);

	const runCreateOrder = db.transaction((payload: CreateOrderInput): CreatedOrderSummary => {
		const now = new Date();
		const timestamp = now.toISOString();
		const orderId = crypto.randomUUID();
		const orderNumber = formatOrderNumberTimestamp(now);

		insertOrder.run({
			id: orderId,
			orderNumber,
			customerName: payload.customerName,
			whatsapp: payload.whatsapp,
			deliveryDate: payload.deliveryDate,
			notes: payload.notes,
			status: 'new',
			paymentStatus: payload.paymentStatus,
			subtotal: payload.totals.subtotal,
			taxAmount: payload.totals.taxAmount,
			deliveryFee: payload.totals.deliveryFee,
			totalAmount: payload.totals.total,
			devPersonaCode: payload.devPersonaCode,
			createdAt: timestamp,
			updatedAt: timestamp
		});

		for (const item of payload.items) {
			insertOrderItem.run({
				id: crypto.randomUUID(),
				orderId,
				menuId: item.menuId,
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				subtotal: item.subtotal
			});
		}

		insertDeliveryInfo.run({
			orderId,
			departmentOrUnit: payload.deliveryInfo.departmentOrUnit,
			floor: payload.deliveryInfo.floor,
			locationNote: payload.deliveryInfo.locationNote,
			addressSummary: payload.deliveryInfo.addressSummary
		});

		const paidAmount = 0;
		const remainingAmount = payload.totals.total;

		insertPaymentInfo.run({
			orderId,
			paymentMethod: payload.paymentMethod,
			paymentStatus: payload.paymentStatus,
			totalAmount: payload.totals.total,
			paidAmount,
			remainingAmount,
			createdAt: timestamp,
			updatedAt: timestamp
		});

		return {
			id: orderId,
			orderNumber,
			customerName: payload.customerName,
			status: 'new',
			paymentStatus: payload.paymentStatus,
			total: payload.totals.total
		};
	});

	return runCreateOrder(input);
}

type RawOrderRow = {
	id: string;
	orderNumber: string;
	customerName: string;
	whatsapp: string;
	orderDate: string;
	deliveryDate: string;
	status: string;
	subtotal: number;
	taxAmount: number;
	deliveryFee: number;
	totalAmount: number;
	notes: string;
	devPersonaCode: string | null;
	departmentOrUnit: string | null;
	floor: string | null;
	locationNote: string | null;
	addressSummary: string | null;
	paymentMethod: string | null;
	paymentStatus: string | null;
	paidAmount: number | null;
	remainingAmount: number | null;
	paymentTotalAmount: number | null;
};

type RawOrderItemRow = {
	id: string;
	orderId: string;
	menuId: string | null;
	name: string;
	quantity: number;
	price: number;
	subtotal: number;
};

type RawOrderStatusRow = {
	id: string;
	orderNumber: string;
	status: string;
	updatedAt: string;
};

type RawOrderPaymentRow = {
	orderId: string;
	orderNumber: string;
	totalAmount: number;
};

export function listOrderRecords(): OrderListRecord[] {
	ensureDatabaseInitialized();
	const db = getDatabase();

	const orderQuery = db.prepare(
		`SELECT
			o.id AS id,
			o.order_number AS orderNumber,
			o.customer_name AS customerName,
			o.whatsapp AS whatsapp,
			o.created_at AS orderDate,
			o.delivery_date AS deliveryDate,
			o.status AS status,
			o.subtotal AS subtotal,
			o.tax_amount AS taxAmount,
			o.delivery_fee AS deliveryFee,
			o.total_amount AS totalAmount,
			o.notes AS notes,
			o.dev_persona_code AS devPersonaCode,
			d.department_or_unit AS departmentOrUnit,
			d.floor AS floor,
			d.location_note AS locationNote,
			d.address_summary AS addressSummary,
			p.payment_method AS paymentMethod,
			p.payment_status AS paymentStatus,
			p.paid_amount AS paidAmount,
			p.remaining_amount AS remainingAmount,
			p.total_amount AS paymentTotalAmount
		FROM orders o
		LEFT JOIN delivery_info d ON d.order_id = o.id
		LEFT JOIN payment_info p ON p.order_id = o.id
		ORDER BY o.created_at DESC;`
	);

	const orderItemQuery = db.prepare(
		`SELECT
			id AS id,
			order_id AS orderId,
			menu_id AS menuId,
			name AS name,
			quantity AS quantity,
			price AS price,
			subtotal AS subtotal
		FROM order_items
		ORDER BY rowid ASC;`
	);

	const orderRows = orderQuery.all() as RawOrderRow[];
	const orderItemRows = orderItemQuery.all() as RawOrderItemRow[];

	const orderItemsByOrderId = new Map<string, OrderListItem[]>();
	for (const row of orderItemRows) {
		const orderItem: OrderListItem = {
			id: row.id,
			menuId: row.menuId,
			name: row.name,
			quantity: Math.max(0, Number(row.quantity)),
			price: Math.max(0, Number(row.price)),
			subtotal: Math.max(0, Number(row.subtotal))
		};

		const existingItems = orderItemsByOrderId.get(row.orderId);
		if (existingItems) {
			existingItems.push(orderItem);
		} else {
			orderItemsByOrderId.set(row.orderId, [orderItem]);
		}
	}

	return orderRows.map((row) => {
		const normalizedTotal = Math.max(0, Number(row.totalAmount));
		const paymentMethod = row.paymentMethod ?? 'unknown';
		const paymentStatus = row.paymentStatus ?? 'unpaid';
		const paidAmount = Math.max(0, Number(row.paidAmount ?? 0));
		const remainingAmount = Math.max(0, Number(row.remainingAmount ?? normalizedTotal));
		const paymentTotalAmount = Math.max(0, Number(row.paymentTotalAmount ?? normalizedTotal));

		return {
			id: row.id,
			orderNumber: row.orderNumber,
			customerName: row.customerName,
			whatsapp: row.whatsapp,
			orderDate: row.orderDate,
			deliveryDate: row.deliveryDate,
			status: row.status || 'new',
			paymentMethod,
			paymentStatus,
			subtotal: Math.max(0, Number(row.subtotal)),
			taxAmount: Math.max(0, Number(row.taxAmount)),
			deliveryFee: Math.max(0, Number(row.deliveryFee)),
			total: normalizedTotal,
			notes: row.notes ?? '',
			devPersonaCode: row.devPersonaCode,
			deliveryInfo: {
				departmentOrUnit: row.departmentOrUnit,
				floor: row.floor,
				locationNote: row.locationNote,
				addressSummary: row.addressSummary
			},
			payment: {
				method: paymentMethod,
				status: paymentStatus,
				totalAmount: paymentTotalAmount,
				paidAmount,
				remainingAmount
			},
			items: orderItemsByOrderId.get(row.id) ?? []
		} satisfies OrderListRecord;
	});
}

export function updateOrderStatusRecord(
	orderId: string,
	status: OrderStatus
): UpdatedOrderStatusSummary | null {
	ensureDatabaseInitialized();
	const db = getDatabase();

	const timestamp = new Date().toISOString();
	const updateOrderStatus = db.prepare(
		`UPDATE orders
		SET status = @status,
			updated_at = @updatedAt
		WHERE id = @id;`
	);
	const selectUpdatedOrder = db.prepare(
		`SELECT
			id AS id,
			order_number AS orderNumber,
			status AS status,
			updated_at AS updatedAt
		FROM orders
		WHERE id = @id
		LIMIT 1;`
	);

	const updateResult = updateOrderStatus.run({
		id: orderId,
		status,
		updatedAt: timestamp
	});

	if (updateResult.changes === 0) {
		return null;
	}

	const updatedOrder = selectUpdatedOrder.get({ id: orderId }) as RawOrderStatusRow | undefined;
	if (!updatedOrder) {
		return null;
	}

	return {
		id: updatedOrder.id,
		orderNumber: updatedOrder.orderNumber,
		status,
		updatedAt: updatedOrder.updatedAt
	};
}

export function updateOrderPaymentStatusRecord(
	orderId: string,
	paymentStatus: PaymentStatus
): UpdatedOrderPaymentStatusSummary | null {
	ensureDatabaseInitialized();
	const db = getDatabase();

	const paymentQuery = db.prepare(
		`SELECT
			o.id AS orderId,
			o.order_number AS orderNumber,
			p.total_amount AS totalAmount
		FROM orders o
		INNER JOIN payment_info p ON p.order_id = o.id
		WHERE o.id = @orderId
		LIMIT 1;`
	);

	const paymentRow = paymentQuery.get({ orderId }) as RawOrderPaymentRow | undefined;
	if (!paymentRow) {
		return null;
	}

	const totalAmount = Math.max(0, Number(paymentRow.totalAmount));
	const paidAmount = paymentStatus === 'paid' ? totalAmount : 0;
	const remainingAmount = paymentStatus === 'paid' ? 0 : totalAmount;

	const paymentUpdate = db.prepare(
		`UPDATE payment_info
		SET payment_status = @paymentStatus,
			paid_amount = @paidAmount,
			remaining_amount = @remainingAmount
		WHERE order_id = @orderId;`
	);

	const updateResult = paymentUpdate.run({
		orderId,
		paymentStatus,
		paidAmount,
		remainingAmount
	});

	if (updateResult.changes === 0) {
		return null;
	}

	return {
		orderId: paymentRow.orderId,
		orderNumber: paymentRow.orderNumber,
		paymentStatus,
		paidAmount,
		remainingAmount
	};
}

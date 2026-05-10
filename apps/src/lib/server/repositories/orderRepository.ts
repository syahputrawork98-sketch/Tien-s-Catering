import { ensureDatabaseInitialized, getDatabase } from '$lib/server/db/client';
import type { CreateOrderInput, CreatedOrderSummary } from '$lib/server/types/order';

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

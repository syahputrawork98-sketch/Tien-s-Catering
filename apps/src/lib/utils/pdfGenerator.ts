import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface OrderItem {
	menu?: {
		name: string;
	};
	priceSnapshot: string | number;
	quantity: number;
}

export interface OrderData {
	id: string;
	createdAt: string | Date;
	grandTotal: string | number;
	status: string;
	user?: {
		name: string;
		phone: string;
		category: string;
		instansiName?: string;
	};
	orderItems: OrderItem[];
}

export function generateThermalReceipt(order: OrderData) {
	// 80mm width in points (1mm = 2.83465 points)
	const width = 80;
	// Dynamic height calculation
	const itemCount = order.orderItems?.length || 0;
	const height = 140 + itemCount * 12; // Increased base height and per-item height

	const doc = new jsPDF({
		orientation: 'p',
		unit: 'mm',
		format: [width, height]
	});

	const formatIDR = (val: string | number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(Number(val));
	};

	const formatDate = (date: string | Date) => {
		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	};

	let currY = 12;

	// 1. Header (Gourmet Branded)
	doc.setFontSize(18);
	doc.setFont('Helvetica', 'bold');
	doc.setTextColor(40, 40, 40);
	doc.text('GOURMET HUB', width / 2, currY, { align: 'center' });
	
	currY += 5;
	doc.setFontSize(7);
	doc.setFont('Helvetica', 'normal');
	doc.setTextColor(100, 100, 100);
	doc.text('INTERNAL INSTANSI CATERING SOLUTION', width / 2, currY, { align: 'center' });
	
	currY += 6;
	doc.setFontSize(8);
	doc.setTextColor(60, 60, 60);
	doc.text('Jl. Raya Hub No. 123, Kawasan Industri', width / 2, currY, { align: 'center' });
	doc.text('WhatsApp: 0812-3456-7890', width / 2, currY + 4, { align: 'center' });

	currY += 10;
	doc.setDrawColor(200, 200, 200);
	doc.line(10, currY, width - 10, currY);

	// 2. Metadata
	currY += 8;
	doc.setFontSize(8);
	doc.setFont('Helvetica', 'bold');
	doc.setTextColor(40, 40, 40);
	doc.text('DATA PESANAN', 10, currY);
	
	doc.setFontSize(7);
	doc.setFont('Helvetica', 'normal');
	doc.setTextColor(120, 120, 120);
	doc.text(formatDate(order.createdAt), width - 10, currY, { align: 'right' });

	currY += 5;
	doc.setTextColor(80, 80, 80);
	doc.text(`ID STROKE :`, 10, currY);
	doc.setFont('Helvetica', 'bold');
	doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, 30, currY);

	currY += 4;
	doc.setFont('Helvetica', 'normal');
	doc.text(`CUSTOMER  :`, 10, currY);
	doc.setFont('Helvetica', 'bold');
	doc.text(`${order.user?.name || 'UMUM'}`, 30, currY);

	if (order.user?.instansiName) {
		currY += 4;
		doc.setFont('Helvetica', 'normal');
		doc.text(`INSTANSI  :`, 10, currY);
		doc.setFont('Helvetica', 'bold');
		doc.text(`${order.user.instansiName}`, 30, currY);
	}

	currY += 6;
	doc.line(10, currY, width - 10, currY);

	// 3. Items Table
	currY += 5;
	const tableData = order.orderItems.map((item) => [
		`${item.menu?.name || 'Menu Item'}`,
		`${item.quantity}`,
		formatIDR(item.priceSnapshot),
		formatIDR(Number(item.priceSnapshot) * item.quantity)
	]);

	autoTable(doc, {
		startY: currY,
		head: [['Menu', 'Qty', 'Harga', 'Subtotal']],
		body: tableData,
		theme: 'plain',
		styles: { 
			fontSize: 7, 
			cellPadding: 1.5,
			textColor: [60, 60, 60],
			font: 'Helvetica'
		},
		headStyles: {
			fontStyle: 'bold',
			textColor: [40, 40, 40]
		},
		columnStyles: {
			0: { cellWidth: 32 },
			1: { cellWidth: 8, halign: 'center' },
			2: { cellWidth: 15, halign: 'right' },
			3: { cellWidth: 15, halign: 'right' }
		},
		margin: { left: 5, right: 5 }
	});

	// Get Y after table
	currY = (doc as any).lastAutoTable.finalY + 6;

	// 4. Summary
	doc.line(10, currY, width - 10, currY);
	
	currY += 8;
	doc.setFontSize(10);
	doc.setFont('Helvetica', 'bold');
	doc.setTextColor(40, 40, 40);
	doc.text('TOTAL PEMBAYARAN', 10, currY);
	
	doc.setFontSize(11);
	doc.setTextColor(190, 80, 0); // Subtle orange for branding
	doc.text(formatIDR(order.grandTotal), width - 10, currY, { align: 'right' });

	currY += 10;
	doc.setFontSize(8);
	doc.setFont('Helvetica', 'bold');
	doc.setTextColor(40, 40, 40);
	const statusText = `STATUS: ${order.status.toUpperCase()}`;
	doc.text(statusText, width / 2, currY, { align: 'center' });

	// 5. Footer
	currY += 15;
	doc.setFontSize(7);
	doc.setFont('Helvetica', 'italic');
	doc.setTextColor(120, 120, 120);
	doc.text('Terima kasih telah mempercayai layanan kami.', width / 2, currY, { align: 'center' });
	doc.text('Have a delicious day! 🍱', width / 2, currY + 4, { align: 'center' });

	// Trigger Download
	doc.save(`Receipt_${order.id.slice(0, 8)}.pdf`);
}


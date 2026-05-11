import { json } from '@sveltejs/kit';
import { uploadPaymentProof } from '$lib/server/services/orderService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const orderId = params.id;
	if (!orderId) {
		return json({ message: 'Order ID wajib diisi.' }, { status: 400 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('proof') as File;

		if (!file || !(file instanceof File)) {
			return json({ message: 'File bukti pembayaran wajib diunggah.' }, { status: 400 });
		}

		// Basic validations
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
		if (!allowedTypes.includes(file.type)) {
			return json(
				{ message: 'Tipe file tidak didukung. Harap unggah gambar (JPG/PNG/WEBP) atau PDF.' },
				{ status: 400 }
			);
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' }, { status: 400 });
		}

		// Simulation: Convert file to base64 Data URL for local DB storage
		// This avoids file system permission issues in dev environment
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64 = buffer.toString('base64');
		const dataUrl = `data:${file.type};base64,${base64}`;

		const result = uploadPaymentProof(orderId, {
			fileName: file.name,
			filePath: dataUrl, // Storing data URL as path for local simulation
			mimeType: file.type,
			fileSize: file.size
		});

		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({
			message: 'Bukti pembayaran berhasil diunggah dan menunggu verifikasi.',
			paymentStatus: result.paymentStatus,
			proof: {
				id: result.proof.id,
				fileName: result.proof.fileName,
				uploadedAt: result.proof.uploadedAt
			}
		});
	} catch (error) {
		console.error('Error uploading payment proof:', error);
		return json({ message: 'Terjadi kesalahan saat mengunggah bukti pembayaran.' }, { status: 500 });
	}
};

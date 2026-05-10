import { json } from '@sveltejs/kit';
import { updatePackageRequestReview } from '$lib/server/services/packageRequestService';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = updatePackageRequestReview(params.id, payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({ request: result.request });
	} catch (error) {
		console.error('Failed to update package request review.', error);
		return json({ message: 'Gagal memperbarui review request paket.' }, { status: 500 });
	}
};

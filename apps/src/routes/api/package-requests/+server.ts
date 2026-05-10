import { json } from '@sveltejs/kit';
import { createPackageRequest, getPackageRequests } from '$lib/server/services/packageRequestService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const items = getPackageRequests();
		return json({ items });
	} catch (error) {
		console.error('Failed to fetch package requests.', error);
		return json({ message: 'Gagal mengambil data request paket.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = createPackageRequest(payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: 400 });
		}

		return json({ request: result.request }, { status: 201 });
	} catch (error) {
		console.error('Failed to create package request.', error);
		return json({ message: 'Gagal membuat request paket.' }, { status: 500 });
	}
};

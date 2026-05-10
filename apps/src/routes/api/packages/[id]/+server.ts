import { json } from '@sveltejs/kit';
import { updatePackage } from '$lib/server/services/packageService';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ message: 'Invalid JSON payload.' }, { status: 400 });
	}

	try {
		const result = updatePackage(params.id, payload);
		if (!result.ok) {
			return json({ message: result.message }, { status: result.status });
		}

		return json({ item: result.item });
	} catch (error) {
		console.error('Failed to update package.', error);
		return json({ message: 'Gagal memperbarui paket.' }, { status: 500 });
	}
};

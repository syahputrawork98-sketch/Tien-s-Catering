import { json } from '@sveltejs/kit';
import { getReadOnlyPackages } from '$lib/server/services/packageService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const items = getReadOnlyPackages();
		return json({ items });
	} catch (error) {
		console.error('Failed to fetch local packages.', error);
		return json({ message: 'Gagal mengambil data paket.' }, { status: 500 });
	}
};

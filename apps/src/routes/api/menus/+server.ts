import { json } from '@sveltejs/kit';
import { getReadOnlyMenus } from '$lib/server/services/menuService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const items = getReadOnlyMenus();

	return json({ items });
};

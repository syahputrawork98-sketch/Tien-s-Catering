import { json } from '@sveltejs/kit';
import { ensureDatabaseInitialized } from '$lib/server/db/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	ensureDatabaseInitialized();

	return json({
		ok: true,
		service: 'tiens-catering',
		mode: 'local-development'
	});
};

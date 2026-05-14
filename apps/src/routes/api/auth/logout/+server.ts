import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('session_user_id', { path: '/' });
	return json({ success: true });
};

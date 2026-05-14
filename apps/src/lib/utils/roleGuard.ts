/**
 * roleGuard.ts — Minimal role-based access helper
 *
 * Batch 52: Basic Role Access Guard
 * Scope: Local-safe, tidak ada production RBAC penuh.
 */

import type { AuthUser } from '$lib/services/auth';

// ─── Role definitions ─────────────────────────────────────────
export type AppRole = 'CUSTOMER' | 'CS' | 'ADMIN';

/**
 * Map AuthUser.role → AppRole.
 * Normalizes backend role strings.
 */
export function toAppRole(role: string | undefined | null): AppRole {
	if (role === 'ADMIN') return 'ADMIN';
	if (role === 'CS') return 'CS';
	return 'CUSTOMER';
}

/**
 * Get the default landing route after login for a given role.
 */
export function defaultRouteForRole(role: AppRole): string {
	if (role === 'ADMIN') return '/dashboard/admin';
	if (role === 'CS') return '/dashboard/cs';
	return '/dashboard';
}

/**
 * Check if a user is allowed to access a given area.
 *
 * @param user        - The authenticated user (or null = unauthenticated).
 * @param requiredRole - Minimum role required. 'CUSTOMER' means any auth user.
 * @param personaMode  - True if developer persona mode is active (bypasses for demo).
 */
export function canAccess(
	user: AuthUser | null,
	requiredRole: AppRole,
	personaMode: boolean
): boolean {
	// Dev persona bypass — labeled as simulation only
	if (personaMode) return true;

	if (!user) return false;

	const userRole = toAppRole(user.role);

	if (requiredRole === 'CUSTOMER') return true; // any authenticated user
	if (requiredRole === 'CS') return userRole === 'CS' || userRole === 'ADMIN';
	if (requiredRole === 'ADMIN') return userRole === 'ADMIN';

	return false;
}

/**
 * Human-readable label for roles.
 */
export function roleLabelId(role: AppRole): string {
	if (role === 'ADMIN') return 'Administrator';
	if (role === 'CS') return 'Customer Service';
	return 'Customer';
}

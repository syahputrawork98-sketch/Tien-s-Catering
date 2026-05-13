import { mockUsers, type MockRole } from '$lib/mock/session';
import { mockAccounts } from '$lib/mock/accounts';
import { browser } from '$app/environment';

const ROLE_STORAGE_KEY = 'tiens_mock_role';
const ACCOUNT_STORAGE_KEY_PREFIX = 'tiens_mock_active_account_id_';

function getInitialRole(): MockRole {
  if (!browser) return 'USER';
  const saved = localStorage.getItem(ROLE_STORAGE_KEY);
  if (saved === 'USER' || saved === 'CUSTOMER_SERVICE' || saved === 'ADMIN') {
    return saved;
  }
  return 'USER';
}

function getInitialAccountId(role: MockRole): string {
  if (!browser) return mockUsers[role].id;
  const saved = localStorage.getItem(ACCOUNT_STORAGE_KEY_PREFIX + role);
  if (saved) return saved;
  return mockUsers[role].id;
}

let activeRole = $state<MockRole>('USER');
let activeAccountIds = $state<Record<MockRole, string>>({
  USER: 'user-001',
  CUSTOMER_SERVICE: 'cs-001',
  ADMIN: 'admin-001'
});

export const mockSession = {
  get role() {
    return activeRole;
  },

  get user() {
    const currentId = activeAccountIds[activeRole];
    const account = mockAccounts.find(a => a.id === currentId && a.role === activeRole);
    if (account) {
      return {
        id: account.id,
        name: account.name,
        email: account.email || '',
        role: account.role as MockRole
      };
    }
    // Fallback to default mock users
    return mockUsers[activeRole];
  },

  setRole(role: MockRole) {
    activeRole = role;
    if (browser) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
  },

  setAccountId(id: string) {
    activeAccountIds[activeRole] = id;
    if (browser) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY_PREFIX + activeRole, id);
    }
  },

  init() {
    if (browser) {
      activeRole = getInitialRole();
      activeAccountIds.USER = getInitialAccountId('USER');
      activeAccountIds.CUSTOMER_SERVICE = getInitialAccountId('CUSTOMER_SERVICE');
      activeAccountIds.ADMIN = getInitialAccountId('ADMIN');
    }
  }
};

import { mockUsers, type MockRole } from '$lib/mock/session';
import { browser } from '$app/environment';

const STORAGE_KEY = 'tiens_mock_role';

function getInitialRole(): MockRole {
  if (!browser) return 'USER';

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === 'USER' || saved === 'CUSTOMER_SERVICE' || saved === 'ADMIN') {
    return saved;
  }

  return 'USER';
}

let activeRole = $state<MockRole>('USER');

export const mockSession = {
  get role() {
    return activeRole;
  },

  get user() {
    return mockUsers[activeRole];
  },

  setRole(role: MockRole) {
    activeRole = role;

    if (browser) {
      localStorage.setItem(STORAGE_KEY, role);
    }
  },

  init() {
    activeRole = getInitialRole();
  }
};

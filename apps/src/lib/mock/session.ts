export type MockRole = 'USER' | 'CUSTOMER_SERVICE' | 'ADMIN';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: MockRole;
};

export const mockUsers: Record<MockRole, MockUser> = {
  USER: {
    id: 'user-001',
    name: 'Customer Demo',
    email: 'customer@tienscatering.test',
    role: 'USER'
  },
  CUSTOMER_SERVICE: {
    id: 'cs-001',
    name: 'CS Demo',
    email: 'cs@tienscatering.test',
    role: 'CUSTOMER_SERVICE'
  },
  ADMIN: {
    id: 'admin-001',
    name: 'Admin Demo',
    email: 'admin@tienscatering.test',
    role: 'ADMIN'
  }
};

export const roleLabels: Record<MockRole, string> = {
  USER: 'Customer',
  CUSTOMER_SERVICE: 'Customer Service',
  ADMIN: 'Admin'
};

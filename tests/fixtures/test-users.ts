/**
 * Test Users Fixtures
 * Sample user data for testing
 */

import { randomUUID } from 'crypto';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: string;
  city?: string;
}

export function generateTestUser(): TestUser {
  const id = randomUUID().slice(0, 8);
  return {
    username: `testuser_${id}`,
    email: `test_${id}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${id}`,
    role: 'dancer',
    city: 'Buenos Aires',
  };
}

export const predefinedTestUsers: TestUser[] = [
  {
    username: 'test_dancer',
    email: 'dancer@test.com',
    password: 'DancerPass123!',
    name: 'Test Dancer',
    role: 'dancer',
    city: 'Buenos Aires',
  },
  {
    username: 'test_teacher',
    email: 'teacher@test.com',
    password: 'TeacherPass123!',
    name: 'Test Teacher',
    role: 'teacher',
    city: 'New York',
  },
  {
    username: 'test_organizer',
    email: 'organizer@test.com',
    password: 'OrganizerPass123!',
    name: 'Test Organizer',
    role: 'organizer',
    city: 'Berlin',
  },
  {
    username: 'test_vendor',
    email: 'vendor@test.com',
    password: 'VendorPass123!',
    name: 'Test Vendor',
    role: 'vendor',
    city: 'Paris',
  },
];

export const adminUser: TestUser = {
  username: 'admin',
  email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  name: 'Admin User',
  role: 'admin',
  city: 'Buenos Aires',
};

export function generateBulkTestUsers(count: number): TestUser[] {
  return Array.from({ length: count }, () => generateTestUser());
}

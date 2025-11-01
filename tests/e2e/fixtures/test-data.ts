import { nanoid } from 'nanoid';

export const generateTestUser = () => ({
  username: `testuser_${nanoid(8)}`,
  email: `test_${nanoid(8)}@mundotango.com`,
  password: 'TestPassword123!',
  name: 'Test User',
  bio: 'Passionate tango dancer and test user',
});

export const generateTestPost = () => ({
  content: `Test post content ${nanoid(6)} - This is a test post for E2E testing`,
  visibility: 'public',
});

export const generateTestEvent = () => ({
  title: `Test Tango Milonga ${nanoid(6)}`,
  description: 'A beautiful evening of tango dancing for testing',
  eventType: 'milonga',
  location: 'Buenos Aires, Argentina',
  venue: 'Test Venue',
  city: 'Buenos Aires',
  country: 'Argentina',
  price: '25',
  currency: 'USD',
  isPaid: true,
  isOnline: false,
  status: 'published',
});

export const generateTestCommunity = () => ({
  name: `Test Tango Community ${nanoid(6)}`,
  description: 'A test community for tango enthusiasts',
  groupType: 'city',
  privacy: 'public',
});

export const generateTestHousingListing = () => ({
  title: `Cozy Apartment in Buenos Aires ${nanoid(6)}`,
  description: 'Perfect for tango dancers visiting BA',
  propertyType: 'apartment',
  city: 'Buenos Aires',
  country: 'Argentina',
  price: '800',
  currency: 'USD',
  bedrooms: 2,
  bathrooms: 1,
  available: true,
});

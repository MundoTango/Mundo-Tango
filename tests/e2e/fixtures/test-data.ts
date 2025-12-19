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

export const generateTestTeacherProfile = () => ({
  tagline: 'Experienced tango instructor teaching authentic Argentine style',
  bio: 'With over 15 years of experience teaching tango in Buenos Aires and internationally, I specialize in helping dancers develop authentic connection and musicality. My approach combines traditional technique with modern pedagogical methods.',
  teachingPhilosophy: 'I believe in creating a supportive environment where students can explore tango at their own pace while developing strong fundamentals.',
  specializations: ['vals', 'milonga', 'traditional'],
  yearsTeaching: 15,
  teachingStyles: ['salon', 'milonguero'],
  skillLevels: ['beginner', 'intermediate', 'advanced'],
  languages: ['English', 'Spanish', 'Portuguese'],
  weeklyClasses: 12,
  privateLesson: true,
  groupLesson: true,
  workshopTravel: true,
  onlineTeaching: true,
  hourlyRateMin: 50,
  hourlyRateMax: 100,
  currency: 'USD',
  availableDays: ['monday', 'wednesday', 'friday', 'saturday'],
  city: 'Buenos Aires',
  country: 'Argentina',
  verified: false,
});

export const generateTestDjProfile = () => ({
  artistName: `DJ Tango Test ${nanoid(4)}`,
  bio: 'Professional tango DJ with extensive knowledge of traditional and nuevo tango music. I create unique tandas that keep dancers engaged and connected to the music throughout the night.',
  tagline: 'Keeping the ronda flowing with perfect tandas',
  genres: ['traditional', 'nuevo', 'alternative'],
  musicEras: ['golden age', 'contemporary'],
  specialties: ['milongas', 'marathons', 'festivals'],
  yearsExperience: 8,
  eventsPlayed: 150,
  eventTypes: ['milonga', 'marathon', 'festival'],
  equipment: ['laptop', 'controller', 'sound system'],
  travelAvailable: true,
  eventRateMin: 200,
  eventRateMax: 500,
  currency: 'USD',
  city: 'Berlin',
  country: 'Germany',
  verified: false,
});

export const generateTestMusicianProfile = () => ({
  artistName: `Músico Test ${nanoid(4)}`,
  bio: 'Passionate bandoneon player specializing in traditional tango orchestras and contemporary ensembles. Available for milongas, concerts, and recording sessions.',
  tagline: 'Bringing authentic tango sound to your event',
  primaryInstrument: 'bandoneon',
  instruments: ['bandoneon', 'piano'],
  genres: ['traditional tango', 'nuevo tango'],
  ensembleTypes: ['orquesta tipica', 'quartet', 'solo'],
  yearsExperience: 12,
  performanceTypes: ['milonga', 'concert', 'recording'],
  available: true,
  performanceRateMin: 300,
  performanceRateMax: 800,
  currency: 'USD',
  city: 'Buenos Aires',
  country: 'Argentina',
  verified: false,
});

export const generateTestAlbum = () => ({
  name: `Test Album ${nanoid(6)}`,
  description: 'A beautiful collection of tango memories for testing',
  privacy: 'public',
});

export const generateTestMedia = () => ({
  caption: `Test media ${nanoid(6)}`,
  type: 'image',
  url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
  thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200',
});

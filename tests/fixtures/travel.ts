/**
 * Travel System Test Fixtures
 * Provides test data for trips, itineraries, expenses, companions
 */

export const testTrip = {
  destination: 'Buenos Aires, Argentina',
  startDate: '2025-06-01',
  endDate: '2025-06-08',
  eventId: 1,
  tripDuration: 7,
  budget: '2500',
  travelStyle: 'cultural-immersion',
  budgetLevel: 'mid-range'
};

export const testItineraryActivities = [
  {
    title: 'Advanced Tango Workshop with Maestro García',
    type: 'workshop' as const,
    startTime: '10:00',
    duration: 120,
    location: 'Studio Tango Centro, San Telmo'
  },
  {
    title: 'Lunch at La Brigada',
    type: 'meal' as const,
    startTime: '13:00',
    duration: 90,
    location: 'La Brigada, San Telmo'
  },
  {
    title: 'Milonga Practice Session',
    type: 'practice' as const,
    startTime: '16:00',
    duration: 120,
    location: 'Milonga La Viruta'
  },
  {
    title: 'City Tour - Caminito & La Boca',
    type: 'sightseeing' as const,
    startTime: '10:00',
    duration: 180,
    location: 'La Boca District'
  }
];

export const testExpenses = [
  {
    category: 'accommodation' as const,
    amount: 800,
    currency: 'USD',
    description: 'Hotel stay - 7 nights',
    date: '2025-06-01'
  },
  {
    category: 'food' as const,
    amount: 450,
    currency: 'USD',
    description: 'Meals and dining',
    date: '2025-06-02'
  },
  {
    category: 'activities' as const,
    amount: 600,
    currency: 'USD',
    description: 'Workshop registrations',
    date: '2025-06-01'
  },
  {
    category: 'transport' as const,
    amount: 350,
    currency: 'USD',
    description: 'Flights and local transport',
    date: '2025-05-25'
  },
  {
    category: 'other' as const,
    amount: 200,
    currency: 'USD',
    description: 'Souvenirs and miscellaneous',
    date: '2025-06-05'
  }
];

export const testCompanionPreferences = {
  travelStyle: 'adventure',
  budgetLevel: 'budget-friendly',
  interests: ['tango', 'culture', 'food', 'nightlife']
};

export const testRoommatePreferences = {
  gender: 'any',
  smoking: false,
  noiseLevel: 'quiet'
};

export const testAccommodationSearch = {
  priceRange: {
    min: 50,
    max: 150
  },
  location: 'San Telmo, Buenos Aires',
  amenities: ['wifi', 'breakfast', 'air-conditioning']
};

export const testFlightSearch = {
  departure: 'New York, NY (JFK)',
  arrival: 'Buenos Aires, Argentina (EZE)',
  departureDate: '2025-06-01',
  returnDate: '2025-06-08'
};

export const sampleTrips = [
  {
    id: 1,
    userId: 1,
    city: 'Buenos Aires',
    country: 'Argentina',
    startDate: '2025-06-01',
    endDate: '2025-06-08',
    tripDuration: 7,
    budget: '2500',
    status: 'planning'
  },
  {
    id: 2,
    userId: 1,
    city: 'Paris',
    country: 'France',
    startDate: '2025-07-15',
    endDate: '2025-07-22',
    tripDuration: 7,
    budget: '3500',
    status: 'confirmed'
  },
  {
    id: 3,
    userId: 1,
    city: 'Istanbul',
    country: 'Turkey',
    startDate: '2025-09-01',
    endDate: '2025-09-10',
    tripDuration: 9,
    budget: '2000',
    status: 'planning'
  }
];

export const sampleCompanions = [
  {
    id: 1,
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    travelStyle: 'cultural-immersion',
    budgetLevel: 'mid-range',
    compatibilityScore: 92,
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    email: 'carlos@example.com',
    travelStyle: 'adventure',
    budgetLevel: 'budget-friendly',
    compatibilityScore: 85,
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 3,
    name: 'Sofia Chen',
    email: 'sofia@example.com',
    travelStyle: 'luxury',
    budgetLevel: 'high-end',
    compatibilityScore: 78,
    avatar: 'https://i.pravatar.cc/150?img=5'
  }
];

export const sampleAccommodations = [
  {
    id: 1,
    name: 'Tango House San Telmo',
    type: 'hotel',
    pricePerNight: 120,
    rating: 4.5,
    location: 'San Telmo',
    amenities: ['wifi', 'breakfast', 'air-conditioning', 'rooftop-terrace'],
    distanceToEvent: '0.5 km'
  },
  {
    id: 2,
    name: 'Buenos Aires Tango Loft',
    type: 'airbnb',
    pricePerNight: 85,
    rating: 4.8,
    location: 'Palermo',
    amenities: ['wifi', 'kitchen', 'air-conditioning', 'dance-space'],
    distanceToEvent: '2.5 km'
  },
  {
    id: 3,
    name: 'Milonga Boutique Hotel',
    type: 'hotel',
    pricePerNight: 200,
    rating: 5.0,
    location: 'Recoleta',
    amenities: ['wifi', 'breakfast', 'spa', 'tango-lessons', 'rooftop-bar'],
    distanceToEvent: '1.2 km'
  }
];

export const sampleFlights = [
  {
    id: 1,
    airline: 'American Airlines',
    departure: 'JFK',
    arrival: 'EZE',
    departureTime: '2025-06-01T20:00:00Z',
    arrivalTime: '2025-06-02T10:30:00Z',
    duration: '10h 30m',
    stops: 0,
    price: 850,
    bookingClass: 'economy'
  },
  {
    id: 2,
    airline: 'United Airlines',
    departure: 'JFK',
    arrival: 'EZE',
    departureTime: '2025-06-01T22:30:00Z',
    arrivalTime: '2025-06-02T14:00:00Z',
    duration: '11h 30m',
    stops: 1,
    price: 720,
    bookingClass: 'economy'
  },
  {
    id: 3,
    airline: 'LATAM',
    departure: 'JFK',
    arrival: 'EZE',
    departureTime: '2025-06-01T18:00:00Z',
    arrivalTime: '2025-06-02T08:00:00Z',
    duration: '10h 00m',
    stops: 0,
    price: 950,
    bookingClass: 'business'
  }
];

export interface TangoCity {
  id: number;
  city: string;
  country: string;
  region: string;
  coordinates: { lat: number; lng: number };
  tangoScene: 'major' | 'active' | 'growing' | 'emerging';
  estimatedDancers: number;
  weeklyMilongas: number;
  hasTeachers: boolean;
  hasSchools: boolean;
}

export const tangoCities: TangoCity[] = [
  // ARGENTINA - The birthplace of tango
  { id: 1, city: "Buenos Aires", country: "Argentina", region: "South America", coordinates: { lat: -34.6037, lng: -58.3816 }, tangoScene: "major", estimatedDancers: 50000, weeklyMilongas: 100, hasTeachers: true, hasSchools: true },
  { id: 2, city: "Córdoba", country: "Argentina", region: "South America", coordinates: { lat: -31.4201, lng: -64.1888 }, tangoScene: "active", estimatedDancers: 3000, weeklyMilongas: 15, hasTeachers: true, hasSchools: true },
  { id: 3, city: "Rosario", country: "Argentina", region: "South America", coordinates: { lat: -32.9468, lng: -60.6393 }, tangoScene: "active", estimatedDancers: 2500, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 4, city: "Mendoza", country: "Argentina", region: "South America", coordinates: { lat: -32.8895, lng: -68.8458 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 5, city: "La Plata", country: "Argentina", region: "South America", coordinates: { lat: -34.9205, lng: -57.9536 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 6, city: "Mar del Plata", country: "Argentina", region: "South America", coordinates: { lat: -38.0055, lng: -57.5426 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 7, city: "Tucumán", country: "Argentina", region: "South America", coordinates: { lat: -26.8083, lng: -65.2176 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 8, city: "Salta", country: "Argentina", region: "South America", coordinates: { lat: -24.7821, lng: -65.4232 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 9, city: "Santa Fe", country: "Argentina", region: "South America", coordinates: { lat: -31.6107, lng: -60.6973 }, tangoScene: "growing", estimatedDancers: 700, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 10, city: "Bahía Blanca", country: "Argentina", region: "South America", coordinates: { lat: -38.7196, lng: -62.2724 }, tangoScene: "emerging", estimatedDancers: 400, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // URUGUAY
  { id: 11, city: "Montevideo", country: "Uruguay", region: "South America", coordinates: { lat: -34.9011, lng: -56.1645 }, tangoScene: "major", estimatedDancers: 5000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 12, city: "Punta del Este", country: "Uruguay", region: "South America", coordinates: { lat: -34.9667, lng: -54.9500 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // BRAZIL
  { id: 13, city: "São Paulo", country: "Brazil", region: "South America", coordinates: { lat: -23.5505, lng: -46.6333 }, tangoScene: "major", estimatedDancers: 8000, weeklyMilongas: 30, hasTeachers: true, hasSchools: true },
  { id: 14, city: "Rio de Janeiro", country: "Brazil", region: "South America", coordinates: { lat: -22.9068, lng: -43.1729 }, tangoScene: "active", estimatedDancers: 3000, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 15, city: "Porto Alegre", country: "Brazil", region: "South America", coordinates: { lat: -30.0346, lng: -51.2177 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 16, city: "Curitiba", country: "Brazil", region: "South America", coordinates: { lat: -25.4290, lng: -49.2671 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 17, city: "Belo Horizonte", country: "Brazil", region: "South America", coordinates: { lat: -19.9191, lng: -43.9386 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 18, city: "Brasília", country: "Brazil", region: "South America", coordinates: { lat: -15.8267, lng: -47.9218 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 19, city: "Florianópolis", country: "Brazil", region: "South America", coordinates: { lat: -27.5949, lng: -48.5482 }, tangoScene: "emerging", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // CHILE
  { id: 20, city: "Santiago", country: "Chile", region: "South America", coordinates: { lat: -33.4489, lng: -70.6693 }, tangoScene: "active", estimatedDancers: 3000, weeklyMilongas: 15, hasTeachers: true, hasSchools: true },
  { id: 21, city: "Valparaíso", country: "Chile", region: "South America", coordinates: { lat: -33.0472, lng: -71.6127 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // COLOMBIA
  { id: 22, city: "Bogotá", country: "Colombia", region: "South America", coordinates: { lat: 4.7110, lng: -74.0721 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 23, city: "Medellín", country: "Colombia", region: "South America", coordinates: { lat: 6.2442, lng: -75.5812 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 24, city: "Cali", country: "Colombia", region: "South America", coordinates: { lat: 3.4516, lng: -76.5320 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },

  // PERU
  { id: 25, city: "Lima", country: "Peru", region: "South America", coordinates: { lat: -12.0464, lng: -77.0428 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },

  // VENEZUELA
  { id: 26, city: "Caracas", country: "Venezuela", region: "South America", coordinates: { lat: 10.4806, lng: -66.9036 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // ECUADOR
  { id: 27, city: "Quito", country: "Ecuador", region: "South America", coordinates: { lat: -0.1807, lng: -78.4678 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // MEXICO
  { id: 28, city: "Mexico City", country: "Mexico", region: "North America", coordinates: { lat: 19.4326, lng: -99.1332 }, tangoScene: "major", estimatedDancers: 5000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 29, city: "Guadalajara", country: "Mexico", region: "North America", coordinates: { lat: 20.6597, lng: -103.3496 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 30, city: "Monterrey", country: "Mexico", region: "North America", coordinates: { lat: 25.6866, lng: -100.3161 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },

  // USA
  { id: 31, city: "New York", country: "USA", region: "North America", coordinates: { lat: 40.7128, lng: -74.0060 }, tangoScene: "major", estimatedDancers: 10000, weeklyMilongas: 40, hasTeachers: true, hasSchools: true },
  { id: 32, city: "Los Angeles", country: "USA", region: "North America", coordinates: { lat: 34.0522, lng: -118.2437 }, tangoScene: "major", estimatedDancers: 6000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 33, city: "San Francisco", country: "USA", region: "North America", coordinates: { lat: 37.7749, lng: -122.4194 }, tangoScene: "major", estimatedDancers: 4000, weeklyMilongas: 20, hasTeachers: true, hasSchools: true },
  { id: 34, city: "Chicago", country: "USA", region: "North America", coordinates: { lat: 41.8781, lng: -87.6298 }, tangoScene: "active", estimatedDancers: 2500, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 35, city: "Miami", country: "USA", region: "North America", coordinates: { lat: 25.7617, lng: -80.1918 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 36, city: "Boston", country: "USA", region: "North America", coordinates: { lat: 42.3601, lng: -71.0589 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 37, city: "Washington DC", country: "USA", region: "North America", coordinates: { lat: 38.9072, lng: -77.0369 }, tangoScene: "active", estimatedDancers: 1800, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 38, city: "Seattle", country: "USA", region: "North America", coordinates: { lat: 47.6062, lng: -122.3321 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 7, hasTeachers: true, hasSchools: true },
  { id: 39, city: "Austin", country: "USA", region: "North America", coordinates: { lat: 30.2672, lng: -97.7431 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 40, city: "Denver", country: "USA", region: "North America", coordinates: { lat: 39.7392, lng: -104.9903 }, tangoScene: "active", estimatedDancers: 900, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 41, city: "Portland", country: "USA", region: "North America", coordinates: { lat: 45.5152, lng: -122.6784 }, tangoScene: "active", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 42, city: "Philadelphia", country: "USA", region: "North America", coordinates: { lat: 39.9526, lng: -75.1652 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 43, city: "San Diego", country: "USA", region: "North America", coordinates: { lat: 32.7157, lng: -117.1611 }, tangoScene: "active", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 44, city: "Minneapolis", country: "USA", region: "North America", coordinates: { lat: 44.9778, lng: -93.2650 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: true },
  { id: 45, city: "Atlanta", country: "USA", region: "North America", coordinates: { lat: 33.7490, lng: -84.3880 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 46, city: "Houston", country: "USA", region: "North America", coordinates: { lat: 29.7604, lng: -95.3698 }, tangoScene: "growing", estimatedDancers: 700, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 47, city: "Dallas", country: "USA", region: "North America", coordinates: { lat: 32.7767, lng: -96.7970 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 48, city: "Phoenix", country: "USA", region: "North America", coordinates: { lat: 33.4484, lng: -112.0740 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 49, city: "New Orleans", country: "USA", region: "North America", coordinates: { lat: 29.9511, lng: -90.0715 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 50, city: "Detroit", country: "USA", region: "North America", coordinates: { lat: 42.3314, lng: -83.0458 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // CANADA
  { id: 51, city: "Toronto", country: "Canada", region: "North America", coordinates: { lat: 43.6532, lng: -79.3832 }, tangoScene: "major", estimatedDancers: 3000, weeklyMilongas: 15, hasTeachers: true, hasSchools: true },
  { id: 52, city: "Montreal", country: "Canada", region: "North America", coordinates: { lat: 45.5017, lng: -73.5673 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 53, city: "Vancouver", country: "Canada", region: "North America", coordinates: { lat: 49.2827, lng: -123.1207 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 7, hasTeachers: true, hasSchools: true },
  { id: 54, city: "Calgary", country: "Canada", region: "North America", coordinates: { lat: 51.0447, lng: -114.0719 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 55, city: "Ottawa", country: "Canada", region: "North America", coordinates: { lat: 45.4215, lng: -75.6972 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // GERMANY
  { id: 56, city: "Berlin", country: "Germany", region: "Europe", coordinates: { lat: 52.5200, lng: 13.4050 }, tangoScene: "major", estimatedDancers: 8000, weeklyMilongas: 35, hasTeachers: true, hasSchools: true },
  { id: 57, city: "Munich", country: "Germany", region: "Europe", coordinates: { lat: 48.1351, lng: 11.5820 }, tangoScene: "active", estimatedDancers: 2500, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 58, city: "Hamburg", country: "Germany", region: "Europe", coordinates: { lat: 53.5511, lng: 9.9937 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 59, city: "Frankfurt", country: "Germany", region: "Europe", coordinates: { lat: 50.1109, lng: 8.6821 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 60, city: "Cologne", country: "Germany", region: "Europe", coordinates: { lat: 50.9375, lng: 6.9603 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 61, city: "Stuttgart", country: "Germany", region: "Europe", coordinates: { lat: 48.7758, lng: 9.1829 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 62, city: "Düsseldorf", country: "Germany", region: "Europe", coordinates: { lat: 51.2277, lng: 6.7735 }, tangoScene: "growing", estimatedDancers: 700, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 63, city: "Hanover", country: "Germany", region: "Europe", coordinates: { lat: 52.3759, lng: 9.7320 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 64, city: "Leipzig", country: "Germany", region: "Europe", coordinates: { lat: 51.3397, lng: 12.3731 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 65, city: "Freiburg", country: "Germany", region: "Europe", coordinates: { lat: 47.9990, lng: 7.8421 }, tangoScene: "emerging", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // FRANCE
  { id: 66, city: "Paris", country: "France", region: "Europe", coordinates: { lat: 48.8566, lng: 2.3522 }, tangoScene: "major", estimatedDancers: 12000, weeklyMilongas: 50, hasTeachers: true, hasSchools: true },
  { id: 67, city: "Lyon", country: "France", region: "Europe", coordinates: { lat: 45.7640, lng: 4.8357 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 68, city: "Marseille", country: "France", region: "Europe", coordinates: { lat: 43.2965, lng: 5.3698 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 69, city: "Toulouse", country: "France", region: "Europe", coordinates: { lat: 43.6047, lng: 1.4442 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 70, city: "Nice", country: "France", region: "Europe", coordinates: { lat: 43.7102, lng: 7.2620 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 71, city: "Bordeaux", country: "France", region: "Europe", coordinates: { lat: 44.8378, lng: -0.5792 }, tangoScene: "growing", estimatedDancers: 700, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 72, city: "Nantes", country: "France", region: "Europe", coordinates: { lat: 47.2184, lng: -1.5536 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 73, city: "Strasbourg", country: "France", region: "Europe", coordinates: { lat: 48.5734, lng: 7.7521 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 74, city: "Montpellier", country: "France", region: "Europe", coordinates: { lat: 43.6108, lng: 3.8767 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // ITALY
  { id: 75, city: "Rome", country: "Italy", region: "Europe", coordinates: { lat: 41.9028, lng: 12.4964 }, tangoScene: "major", estimatedDancers: 5000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 76, city: "Milan", country: "Italy", region: "Europe", coordinates: { lat: 45.4642, lng: 9.1900 }, tangoScene: "major", estimatedDancers: 4000, weeklyMilongas: 20, hasTeachers: true, hasSchools: true },
  { id: 77, city: "Florence", country: "Italy", region: "Europe", coordinates: { lat: 43.7696, lng: 11.2558 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 78, city: "Turin", country: "Italy", region: "Europe", coordinates: { lat: 45.0703, lng: 7.6869 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 79, city: "Bologna", country: "Italy", region: "Europe", coordinates: { lat: 44.4949, lng: 11.3426 }, tangoScene: "active", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 80, city: "Naples", country: "Italy", region: "Europe", coordinates: { lat: 40.8518, lng: 14.2681 }, tangoScene: "growing", estimatedDancers: 700, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 81, city: "Venice", country: "Italy", region: "Europe", coordinates: { lat: 45.4408, lng: 12.3155 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 82, city: "Genoa", country: "Italy", region: "Europe", coordinates: { lat: 44.4056, lng: 8.9463 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // SPAIN
  { id: 83, city: "Madrid", country: "Spain", region: "Europe", coordinates: { lat: 40.4168, lng: -3.7038 }, tangoScene: "major", estimatedDancers: 6000, weeklyMilongas: 30, hasTeachers: true, hasSchools: true },
  { id: 84, city: "Barcelona", country: "Spain", region: "Europe", coordinates: { lat: 41.3851, lng: 2.1734 }, tangoScene: "major", estimatedDancers: 5000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 85, city: "Valencia", country: "Spain", region: "Europe", coordinates: { lat: 39.4699, lng: -0.3763 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 86, city: "Seville", country: "Spain", region: "Europe", coordinates: { lat: 37.3891, lng: -5.9845 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 87, city: "Bilbao", country: "Spain", region: "Europe", coordinates: { lat: 43.2630, lng: -2.9350 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 88, city: "Málaga", country: "Spain", region: "Europe", coordinates: { lat: 36.7213, lng: -4.4214 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 89, city: "Granada", country: "Spain", region: "Europe", coordinates: { lat: 37.1773, lng: -3.5986 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // UNITED KINGDOM
  { id: 90, city: "London", country: "United Kingdom", region: "Europe", coordinates: { lat: 51.5074, lng: -0.1278 }, tangoScene: "major", estimatedDancers: 8000, weeklyMilongas: 35, hasTeachers: true, hasSchools: true },
  { id: 91, city: "Manchester", country: "United Kingdom", region: "Europe", coordinates: { lat: 53.4808, lng: -2.2426 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 92, city: "Edinburgh", country: "United Kingdom", region: "Europe", coordinates: { lat: 55.9533, lng: -3.1883 }, tangoScene: "active", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 93, city: "Bristol", country: "United Kingdom", region: "Europe", coordinates: { lat: 51.4545, lng: -2.5879 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 94, city: "Birmingham", country: "United Kingdom", region: "Europe", coordinates: { lat: 52.4862, lng: -1.8904 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 95, city: "Cambridge", country: "United Kingdom", region: "Europe", coordinates: { lat: 52.2053, lng: 0.1218 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 96, city: "Oxford", country: "United Kingdom", region: "Europe", coordinates: { lat: 51.7520, lng: -1.2577 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 97, city: "Glasgow", country: "United Kingdom", region: "Europe", coordinates: { lat: 55.8642, lng: -4.2518 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // NETHERLANDS
  { id: 98, city: "Amsterdam", country: "Netherlands", region: "Europe", coordinates: { lat: 52.3676, lng: 4.9041 }, tangoScene: "major", estimatedDancers: 3000, weeklyMilongas: 15, hasTeachers: true, hasSchools: true },
  { id: 99, city: "Rotterdam", country: "Netherlands", region: "Europe", coordinates: { lat: 51.9225, lng: 4.4792 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 100, city: "The Hague", country: "Netherlands", region: "Europe", coordinates: { lat: 52.0705, lng: 4.3007 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 101, city: "Utrecht", country: "Netherlands", region: "Europe", coordinates: { lat: 52.0907, lng: 5.1214 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // BELGIUM
  { id: 102, city: "Brussels", country: "Belgium", region: "Europe", coordinates: { lat: 50.8503, lng: 4.3517 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 103, city: "Antwerp", country: "Belgium", region: "Europe", coordinates: { lat: 51.2194, lng: 4.4025 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 104, city: "Ghent", country: "Belgium", region: "Europe", coordinates: { lat: 51.0543, lng: 3.7174 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // AUSTRIA
  { id: 105, city: "Vienna", country: "Austria", region: "Europe", coordinates: { lat: 48.2082, lng: 16.3738 }, tangoScene: "major", estimatedDancers: 4000, weeklyMilongas: 20, hasTeachers: true, hasSchools: true },
  { id: 106, city: "Salzburg", country: "Austria", region: "Europe", coordinates: { lat: 47.8095, lng: 13.0550 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 107, city: "Graz", country: "Austria", region: "Europe", coordinates: { lat: 47.0707, lng: 15.4395 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // SWITZERLAND
  { id: 108, city: "Zurich", country: "Switzerland", region: "Europe", coordinates: { lat: 47.3769, lng: 8.5417 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 109, city: "Geneva", country: "Switzerland", region: "Europe", coordinates: { lat: 46.2044, lng: 6.1432 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 110, city: "Basel", country: "Switzerland", region: "Europe", coordinates: { lat: 47.5596, lng: 7.5886 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 111, city: "Bern", country: "Switzerland", region: "Europe", coordinates: { lat: 46.9480, lng: 7.4474 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // POLAND
  { id: 112, city: "Warsaw", country: "Poland", region: "Europe", coordinates: { lat: 52.2297, lng: 21.0122 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 113, city: "Krakow", country: "Poland", region: "Europe", coordinates: { lat: 50.0647, lng: 19.9450 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 114, city: "Wroclaw", country: "Poland", region: "Europe", coordinates: { lat: 51.1079, lng: 17.0385 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 115, city: "Gdansk", country: "Poland", region: "Europe", coordinates: { lat: 54.3520, lng: 18.6466 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 116, city: "Poznan", country: "Poland", region: "Europe", coordinates: { lat: 52.4064, lng: 16.9252 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // CZECH REPUBLIC
  { id: 117, city: "Prague", country: "Czech Republic", region: "Europe", coordinates: { lat: 50.0755, lng: 14.4378 }, tangoScene: "active", estimatedDancers: 2500, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 118, city: "Brno", country: "Czech Republic", region: "Europe", coordinates: { lat: 49.1951, lng: 16.6068 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },

  // HUNGARY
  { id: 119, city: "Budapest", country: "Hungary", region: "Europe", coordinates: { lat: 47.4979, lng: 19.0402 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },

  // RUSSIA
  { id: 120, city: "Moscow", country: "Russia", region: "Europe", coordinates: { lat: 55.7558, lng: 37.6173 }, tangoScene: "major", estimatedDancers: 6000, weeklyMilongas: 30, hasTeachers: true, hasSchools: true },
  { id: 121, city: "Saint Petersburg", country: "Russia", region: "Europe", coordinates: { lat: 59.9343, lng: 30.3351 }, tangoScene: "active", estimatedDancers: 2500, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 122, city: "Novosibirsk", country: "Russia", region: "Asia", coordinates: { lat: 55.0084, lng: 82.9357 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 123, city: "Yekaterinburg", country: "Russia", region: "Asia", coordinates: { lat: 56.8389, lng: 60.6057 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // UKRAINE
  { id: 124, city: "Kyiv", country: "Ukraine", region: "Europe", coordinates: { lat: 50.4501, lng: 30.5234 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 125, city: "Odessa", country: "Ukraine", region: "Europe", coordinates: { lat: 46.4825, lng: 30.7233 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 126, city: "Lviv", country: "Ukraine", region: "Europe", coordinates: { lat: 49.8397, lng: 24.0297 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // GREECE
  { id: 127, city: "Athens", country: "Greece", region: "Europe", coordinates: { lat: 37.9838, lng: 23.7275 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 128, city: "Thessaloniki", country: "Greece", region: "Europe", coordinates: { lat: 40.6401, lng: 22.9444 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },

  // PORTUGAL
  { id: 129, city: "Lisbon", country: "Portugal", region: "Europe", coordinates: { lat: 38.7223, lng: -9.1393 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 130, city: "Porto", country: "Portugal", region: "Europe", coordinates: { lat: 41.1579, lng: -8.6291 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },

  // SCANDINAVIA
  { id: 131, city: "Stockholm", country: "Sweden", region: "Europe", coordinates: { lat: 59.3293, lng: 18.0686 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 132, city: "Gothenburg", country: "Sweden", region: "Europe", coordinates: { lat: 57.7089, lng: 11.9746 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 133, city: "Malmö", country: "Sweden", region: "Europe", coordinates: { lat: 55.6050, lng: 13.0038 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 134, city: "Copenhagen", country: "Denmark", region: "Europe", coordinates: { lat: 55.6761, lng: 12.5683 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 135, city: "Oslo", country: "Norway", region: "Europe", coordinates: { lat: 59.9139, lng: 10.7522 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 136, city: "Bergen", country: "Norway", region: "Europe", coordinates: { lat: 60.3913, lng: 5.3221 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 137, city: "Helsinki", country: "Finland", region: "Europe", coordinates: { lat: 60.1699, lng: 24.9384 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },

  // IRELAND
  { id: 138, city: "Dublin", country: "Ireland", region: "Europe", coordinates: { lat: 53.3498, lng: -6.2603 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },

  // ROMANIA
  { id: 139, city: "Bucharest", country: "Romania", region: "Europe", coordinates: { lat: 44.4268, lng: 26.1025 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 140, city: "Cluj-Napoca", country: "Romania", region: "Europe", coordinates: { lat: 46.7712, lng: 23.6236 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // BULGARIA
  { id: 141, city: "Sofia", country: "Bulgaria", region: "Europe", coordinates: { lat: 42.6977, lng: 23.3219 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },

  // SERBIA
  { id: 142, city: "Belgrade", country: "Serbia", region: "Europe", coordinates: { lat: 44.7866, lng: 20.4489 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },

  // CROATIA
  { id: 143, city: "Zagreb", country: "Croatia", region: "Europe", coordinates: { lat: 45.8150, lng: 15.9819 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },

  // SLOVENIA
  { id: 144, city: "Ljubljana", country: "Slovenia", region: "Europe", coordinates: { lat: 46.0569, lng: 14.5058 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // TURKEY
  { id: 145, city: "Istanbul", country: "Turkey", region: "Europe", coordinates: { lat: 41.0082, lng: 28.9784 }, tangoScene: "major", estimatedDancers: 4000, weeklyMilongas: 20, hasTeachers: true, hasSchools: true },
  { id: 146, city: "Ankara", country: "Turkey", region: "Asia", coordinates: { lat: 39.9334, lng: 32.8597 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 147, city: "Izmir", country: "Turkey", region: "Asia", coordinates: { lat: 38.4237, lng: 27.1428 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // ISRAEL
  { id: 148, city: "Tel Aviv", country: "Israel", region: "Middle East", coordinates: { lat: 32.0853, lng: 34.7818 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 149, city: "Jerusalem", country: "Israel", region: "Middle East", coordinates: { lat: 31.7683, lng: 35.2137 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // JAPAN
  { id: 150, city: "Tokyo", country: "Japan", region: "Asia", coordinates: { lat: 35.6762, lng: 139.6503 }, tangoScene: "major", estimatedDancers: 8000, weeklyMilongas: 35, hasTeachers: true, hasSchools: true },
  { id: 151, city: "Osaka", country: "Japan", region: "Asia", coordinates: { lat: 34.6937, lng: 135.5023 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 152, city: "Kyoto", country: "Japan", region: "Asia", coordinates: { lat: 35.0116, lng: 135.7681 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 153, city: "Nagoya", country: "Japan", region: "Asia", coordinates: { lat: 35.1815, lng: 136.9066 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 154, city: "Fukuoka", country: "Japan", region: "Asia", coordinates: { lat: 33.5904, lng: 130.4017 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 155, city: "Sapporo", country: "Japan", region: "Asia", coordinates: { lat: 43.0618, lng: 141.3545 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // SOUTH KOREA
  { id: 156, city: "Seoul", country: "South Korea", region: "Asia", coordinates: { lat: 37.5665, lng: 126.9780 }, tangoScene: "major", estimatedDancers: 5000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 157, city: "Busan", country: "South Korea", region: "Asia", coordinates: { lat: 35.1796, lng: 129.0756 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 158, city: "Daegu", country: "South Korea", region: "Asia", coordinates: { lat: 35.8714, lng: 128.6014 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // TAIWAN
  { id: 159, city: "Taipei", country: "Taiwan", region: "Asia", coordinates: { lat: 25.0330, lng: 121.5654 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 160, city: "Taichung", country: "Taiwan", region: "Asia", coordinates: { lat: 24.1477, lng: 120.6736 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // CHINA
  { id: 161, city: "Shanghai", country: "China", region: "Asia", coordinates: { lat: 31.2304, lng: 121.4737 }, tangoScene: "major", estimatedDancers: 6000, weeklyMilongas: 25, hasTeachers: true, hasSchools: true },
  { id: 162, city: "Beijing", country: "China", region: "Asia", coordinates: { lat: 39.9042, lng: 116.4074 }, tangoScene: "active", estimatedDancers: 3000, weeklyMilongas: 15, hasTeachers: true, hasSchools: true },
  { id: 163, city: "Guangzhou", country: "China", region: "Asia", coordinates: { lat: 23.1291, lng: 113.2644 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 164, city: "Shenzhen", country: "China", region: "Asia", coordinates: { lat: 22.5431, lng: 114.0579 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 165, city: "Hangzhou", country: "China", region: "Asia", coordinates: { lat: 30.2741, lng: 120.1551 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: false },
  { id: 166, city: "Chengdu", country: "China", region: "Asia", coordinates: { lat: 30.5728, lng: 104.0668 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: false },
  { id: 167, city: "Nanjing", country: "China", region: "Asia", coordinates: { lat: 32.0603, lng: 118.7969 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 168, city: "Wuhan", country: "China", region: "Asia", coordinates: { lat: 30.5928, lng: 114.3055 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 169, city: "Xi'an", country: "China", region: "Asia", coordinates: { lat: 34.3416, lng: 108.9398 }, tangoScene: "emerging", estimatedDancers: 400, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // HONG KONG & MACAU
  { id: 170, city: "Hong Kong", country: "Hong Kong", region: "Asia", coordinates: { lat: 22.3193, lng: 114.1694 }, tangoScene: "active", estimatedDancers: 2000, weeklyMilongas: 10, hasTeachers: true, hasSchools: true },
  { id: 171, city: "Macau", country: "Macau", region: "Asia", coordinates: { lat: 22.1987, lng: 113.5439 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // SINGAPORE & MALAYSIA
  { id: 172, city: "Singapore", country: "Singapore", region: "Asia", coordinates: { lat: 1.3521, lng: 103.8198 }, tangoScene: "active", estimatedDancers: 2500, weeklyMilongas: 12, hasTeachers: true, hasSchools: true },
  { id: 173, city: "Kuala Lumpur", country: "Malaysia", region: "Asia", coordinates: { lat: 3.1390, lng: 101.6869 }, tangoScene: "growing", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 174, city: "Penang", country: "Malaysia", region: "Asia", coordinates: { lat: 5.4164, lng: 100.3327 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // THAILAND
  { id: 175, city: "Bangkok", country: "Thailand", region: "Asia", coordinates: { lat: 13.7563, lng: 100.5018 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 176, city: "Chiang Mai", country: "Thailand", region: "Asia", coordinates: { lat: 18.7883, lng: 98.9853 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 177, city: "Phuket", country: "Thailand", region: "Asia", coordinates: { lat: 7.8804, lng: 98.3923 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // VIETNAM
  { id: 178, city: "Ho Chi Minh City", country: "Vietnam", region: "Asia", coordinates: { lat: 10.8231, lng: 106.6297 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 179, city: "Hanoi", country: "Vietnam", region: "Asia", coordinates: { lat: 21.0278, lng: 105.8342 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // PHILIPPINES
  { id: 180, city: "Manila", country: "Philippines", region: "Asia", coordinates: { lat: 14.5995, lng: 120.9842 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 181, city: "Cebu City", country: "Philippines", region: "Asia", coordinates: { lat: 10.3157, lng: 123.8854 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // INDONESIA
  { id: 182, city: "Jakarta", country: "Indonesia", region: "Asia", coordinates: { lat: -6.2088, lng: 106.8456 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 183, city: "Bali", country: "Indonesia", region: "Asia", coordinates: { lat: -8.3405, lng: 115.0920 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 184, city: "Surabaya", country: "Indonesia", region: "Asia", coordinates: { lat: -7.2575, lng: 112.7521 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // INDIA
  { id: 185, city: "Mumbai", country: "India", region: "Asia", coordinates: { lat: 19.0760, lng: 72.8777 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 186, city: "New Delhi", country: "India", region: "Asia", coordinates: { lat: 28.6139, lng: 77.2090 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 187, city: "Bangalore", country: "India", region: "Asia", coordinates: { lat: 12.9716, lng: 77.5946 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 188, city: "Chennai", country: "India", region: "Asia", coordinates: { lat: 13.0827, lng: 80.2707 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 189, city: "Pune", country: "India", region: "Asia", coordinates: { lat: 18.5204, lng: 73.8567 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 190, city: "Hyderabad", country: "India", region: "Asia", coordinates: { lat: 17.3850, lng: 78.4867 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 191, city: "Kolkata", country: "India", region: "Asia", coordinates: { lat: 22.5726, lng: 88.3639 }, tangoScene: "emerging", estimatedDancers: 250, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // AUSTRALIA & NEW ZEALAND
  { id: 192, city: "Sydney", country: "Australia", region: "Oceania", coordinates: { lat: -33.8688, lng: 151.2093 }, tangoScene: "major", estimatedDancers: 4000, weeklyMilongas: 20, hasTeachers: true, hasSchools: true },
  { id: 193, city: "Melbourne", country: "Australia", region: "Oceania", coordinates: { lat: -37.8136, lng: 144.9631 }, tangoScene: "major", estimatedDancers: 3500, weeklyMilongas: 18, hasTeachers: true, hasSchools: true },
  { id: 194, city: "Brisbane", country: "Australia", region: "Oceania", coordinates: { lat: -27.4698, lng: 153.0251 }, tangoScene: "active", estimatedDancers: 1200, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 195, city: "Perth", country: "Australia", region: "Oceania", coordinates: { lat: -31.9505, lng: 115.8605 }, tangoScene: "active", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 196, city: "Adelaide", country: "Australia", region: "Oceania", coordinates: { lat: -34.9285, lng: 138.6007 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 197, city: "Canberra", country: "Australia", region: "Oceania", coordinates: { lat: -35.2809, lng: 149.1300 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 198, city: "Auckland", country: "New Zealand", region: "Oceania", coordinates: { lat: -36.8485, lng: 174.7633 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 199, city: "Wellington", country: "New Zealand", region: "Oceania", coordinates: { lat: -41.2865, lng: 174.7762 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: true },
  { id: 200, city: "Christchurch", country: "New Zealand", region: "Oceania", coordinates: { lat: -43.5321, lng: 172.6362 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // SOUTH AFRICA
  { id: 201, city: "Cape Town", country: "South Africa", region: "Africa", coordinates: { lat: -33.9249, lng: 18.4241 }, tangoScene: "active", estimatedDancers: 1000, weeklyMilongas: 6, hasTeachers: true, hasSchools: true },
  { id: 202, city: "Johannesburg", country: "South Africa", region: "Africa", coordinates: { lat: -26.2041, lng: 28.0473 }, tangoScene: "active", estimatedDancers: 800, weeklyMilongas: 5, hasTeachers: true, hasSchools: true },
  { id: 203, city: "Durban", country: "South Africa", region: "Africa", coordinates: { lat: -29.8587, lng: 31.0218 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // EGYPT
  { id: 204, city: "Cairo", country: "Egypt", region: "Africa", coordinates: { lat: 30.0444, lng: 31.2357 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: true },
  { id: 205, city: "Alexandria", country: "Egypt", region: "Africa", coordinates: { lat: 31.2001, lng: 29.9187 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // MOROCCO
  { id: 206, city: "Casablanca", country: "Morocco", region: "Africa", coordinates: { lat: 33.5731, lng: -7.5898 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 207, city: "Marrakech", country: "Morocco", region: "Africa", coordinates: { lat: 31.6295, lng: -7.9811 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // NIGERIA
  { id: 208, city: "Lagos", country: "Nigeria", region: "Africa", coordinates: { lat: 6.5244, lng: 3.3792 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // KENYA
  { id: 209, city: "Nairobi", country: "Kenya", region: "Africa", coordinates: { lat: -1.2921, lng: 36.8219 }, tangoScene: "emerging", estimatedDancers: 250, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // UAE
  { id: 210, city: "Dubai", country: "UAE", region: "Middle East", coordinates: { lat: 25.2048, lng: 55.2708 }, tangoScene: "active", estimatedDancers: 1500, weeklyMilongas: 8, hasTeachers: true, hasSchools: true },
  { id: 211, city: "Abu Dhabi", country: "UAE", region: "Middle East", coordinates: { lat: 24.4539, lng: 54.3773 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // QATAR
  { id: 212, city: "Doha", country: "Qatar", region: "Middle East", coordinates: { lat: 25.2854, lng: 51.5310 }, tangoScene: "growing", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // SAUDI ARABIA
  { id: 213, city: "Riyadh", country: "Saudi Arabia", region: "Middle East", coordinates: { lat: 24.7136, lng: 46.6753 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 214, city: "Jeddah", country: "Saudi Arabia", region: "Middle East", coordinates: { lat: 21.4858, lng: 39.1925 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // LEBANON
  { id: 215, city: "Beirut", country: "Lebanon", region: "Middle East", coordinates: { lat: 33.8938, lng: 35.5018 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: true },

  // ADDITIONAL EUROPEAN CITIES
  { id: 216, city: "Riga", country: "Latvia", region: "Europe", coordinates: { lat: 56.9496, lng: 24.1052 }, tangoScene: "growing", estimatedDancers: 600, weeklyMilongas: 4, hasTeachers: true, hasSchools: true },
  { id: 217, city: "Tallinn", country: "Estonia", region: "Europe", coordinates: { lat: 59.4370, lng: 24.7536 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 218, city: "Vilnius", country: "Lithuania", region: "Europe", coordinates: { lat: 54.6872, lng: 25.2797 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 219, city: "Bratislava", country: "Slovakia", region: "Europe", coordinates: { lat: 48.1486, lng: 17.1077 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 220, city: "Luxembourg City", country: "Luxembourg", region: "Europe", coordinates: { lat: 49.6116, lng: 6.1319 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },

  // ADDITIONAL ASIAN CITIES
  { id: 221, city: "Kobe", country: "Japan", region: "Asia", coordinates: { lat: 34.6901, lng: 135.1956 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 222, city: "Yokohama", country: "Japan", region: "Asia", coordinates: { lat: 35.4437, lng: 139.6380 }, tangoScene: "growing", estimatedDancers: 500, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 223, city: "Incheon", country: "South Korea", region: "Asia", coordinates: { lat: 37.4563, lng: 126.7052 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },

  // ADDITIONAL LATIN AMERICAN CITIES
  { id: 224, city: "Asunción", country: "Paraguay", region: "South America", coordinates: { lat: -25.2637, lng: -57.5759 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 225, city: "La Paz", country: "Bolivia", region: "South America", coordinates: { lat: -16.4897, lng: -68.1193 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 226, city: "Havana", country: "Cuba", region: "Caribbean", coordinates: { lat: 23.1136, lng: -82.3666 }, tangoScene: "emerging", estimatedDancers: 300, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 227, city: "San Juan", country: "Puerto Rico", region: "Caribbean", coordinates: { lat: 18.4655, lng: -66.1057 }, tangoScene: "emerging", estimatedDancers: 250, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 228, city: "Santo Domingo", country: "Dominican Republic", region: "Caribbean", coordinates: { lat: 18.4861, lng: -69.9312 }, tangoScene: "emerging", estimatedDancers: 200, weeklyMilongas: 2, hasTeachers: true, hasSchools: false },
  { id: 229, city: "Panama City", country: "Panama", region: "Central America", coordinates: { lat: 8.9824, lng: -79.5199 }, tangoScene: "growing", estimatedDancers: 400, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
  { id: 230, city: "San José", country: "Costa Rica", region: "Central America", coordinates: { lat: 9.9281, lng: -84.0907 }, tangoScene: "growing", estimatedDancers: 350, weeklyMilongas: 3, hasTeachers: true, hasSchools: false },
];

export function getCityById(id: number): TangoCity | undefined {
  return tangoCities.find(city => city.id === id);
}

export function getCitiesByCountry(country: string): TangoCity[] {
  return tangoCities.filter(city => city.country.toLowerCase() === country.toLowerCase());
}

export function getCitiesByRegion(region: string): TangoCity[] {
  return tangoCities.filter(city => city.region.toLowerCase() === region.toLowerCase());
}

export function getCitiesByScene(scene: TangoCity['tangoScene']): TangoCity[] {
  return tangoCities.filter(city => city.tangoScene === scene);
}

export function searchCities(query: string): TangoCity[] {
  const lowerQuery = query.toLowerCase();
  return tangoCities.filter(city => 
    city.city.toLowerCase().includes(lowerQuery) ||
    city.country.toLowerCase().includes(lowerQuery) ||
    city.region.toLowerCase().includes(lowerQuery)
  );
}

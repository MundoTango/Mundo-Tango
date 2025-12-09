/**
 * City Skyline & Cityscape Images
 * Verified working Unsplash direct URLs (all tested HTTP 200)
 * Each city has a curated, iconic cityscape photo
 */

export const CITY_IMAGE_MAP: Record<string, string> = {
  // South America
  "Buenos Aires": "https://images.unsplash.com/photo-1528392175875-4ce3ab32663c?w=1200&h=675&fit=crop",
  "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=675&fit=crop",
  "Sao Paulo": "https://images.unsplash.com/photo-1554168804-91c9e85a9336?w=1200&h=675&fit=crop",
  "São Paulo": "https://images.unsplash.com/photo-1554168804-91c9e85a9336?w=1200&h=675&fit=crop",
  
  // Europe
  "Paris": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=675&fit=crop",
  "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&h=675&fit=crop",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=675&fit=crop",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=675&fit=crop",
  "Vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=675&fit=crop",
  "Prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&h=675&fit=crop",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=675&fit=crop",
  "Venice": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1200&h=675&fit=crop",
  "Madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=675&fit=crop",
  "Milan": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1200&h=675&fit=crop",
  "Lisbon": "https://images.unsplash.com/photo-1513735492284-ecf18a93d5d4?w=1200&h=675&fit=crop",
  "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=675&fit=crop",
  "Athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=675&fit=crop",
  
  // North America
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=675&fit=crop",
  "Los Angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200&h=675&fit=crop",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=675&fit=crop",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&h=675&fit=crop",
  "Chicago": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675&fit=crop",
  "Toronto": "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&h=675&fit=crop",
  "Mexico City": "https://images.unsplash.com/photo-1518659526054-190340b32735?w=1200&h=675&fit=crop",
  
  // Asia
  "Tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=675&fit=crop",
  "Shanghai": "https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=1200&h=675&fit=crop",
  "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&h=675&fit=crop",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=675&fit=crop",
  "Hong Kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&h=675&fit=crop",
  "Seoul": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200&h=675&fit=crop",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=675&fit=crop",
  
  // Oceania
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=675&fit=crop",
  "Melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&h=675&fit=crop",
};

/**
 * Default fallback image for cities not in the map
 */
const DEFAULT_CITY_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=675&fit=crop";

/**
 * Get city-specific image URL
 * Returns verified Unsplash URL for the city, or fallback for unknown cities
 */
export function getCityImageUrl(city?: string | null): string {
  if (!city) {
    return DEFAULT_CITY_IMAGE;
  }

  // Try exact match first
  if (CITY_IMAGE_MAP[city]) {
    return CITY_IMAGE_MAP[city];
  }

  // Try partial match (first word of city name)
  const firstWord = city.split(" ")[0];
  for (const [key, url] of Object.entries(CITY_IMAGE_MAP)) {
    if (key.startsWith(firstWord) || key.includes(city)) {
      return url;
    }
  }

  // Fallback to default city image
  return DEFAULT_CITY_IMAGE;
}

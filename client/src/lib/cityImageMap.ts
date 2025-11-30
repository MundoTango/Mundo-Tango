/**
 * City Skyline & Cityscape Images
 * Uses Unsplash source API for reliable city imagery
 * Format: https://source.unsplash.com/1200x675/?{search-term}
 */

export const CITY_SEARCH_TERMS: Record<string, string> = {
  "Buenos Aires": "buenos+aires+skyline",
  "Paris": "paris+eiffel+tower",
  "Barcelona": "barcelona+sagrada+familia",
  "Berlin": "berlin+skyline",
  "London": "london+big+ben",
  "New York": "new+york+skyline",
  "Tokyo": "tokyo+shibuya",
  "Toronto": "toronto+cn+tower",
  "Sydney": "sydney+opera+house",
  "Melbourne": "melbourne+city",
  "Los Angeles": "los+angeles+skyline",
  "San Francisco": "san+francisco+bridge",
  "Miami": "miami+skyline",
  "Chicago": "chicago+skyline",
  "Amsterdam": "amsterdam+canals",
  "Vienna": "vienna+architecture",
  "Prague": "prague+castle",
  "Rome": "rome+colosseum",
  "Venice": "venice+canals",
  "Madrid": "madrid+city",
  "Lisbon": "lisbon+castle",
  "Istanbul": "istanbul+bosphorus",
  "Bangkok": "bangkok+skyline",
  "Singapore": "singapore+skyline",
  "Hong Kong": "hong+kong+harbor",
  "Seoul": "seoul+city",
  "Dubai": "dubai+skyline",
  "Mexico City": "mexico+city+skyline",
  "Rio de Janeiro": "rio+de+janeiro",
  "Sao Paulo": "sao+paulo+skyline",
  "São Paulo": "sao+paulo+skyline",
  "Athens": "athens+acropolis",
};

/**
 * Get city-specific image URL using Unsplash source API
 * Returns properly formatted Unsplash source URL with search terms
 */
export function getCityImageUrl(city?: string | null): string {
  if (!city) {
    return "https://source.unsplash.com/1200x675/?tango,dance";
  }

  // Try exact match first
  if (CITY_SEARCH_TERMS[city]) {
    return `https://source.unsplash.com/1200x675/?${CITY_SEARCH_TERMS[city]}`;
  }

  // Try partial match (first word of city name)
  const firstWord = city.split(" ")[0];
  if (CITY_SEARCH_TERMS[firstWord]) {
    return `https://source.unsplash.com/1200x675/?${CITY_SEARCH_TERMS[firstWord]}`;
  }

  // Fallback to generic tango image
  return "https://source.unsplash.com/1200x675/?tango,dance";
}

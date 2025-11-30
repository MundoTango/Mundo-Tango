/**
 * City Skyline & Cityscape Images
 * Uses LoremFlickr for reliable city-specific imagery (no API key required)
 * Lock parameter ensures consistent images for same city
 */

export const CITY_KEYWORDS: Record<string, string> = {
  "Buenos Aires": "buenos,aires,argentina,skyline",
  "Paris": "paris,eiffel,tower,france",
  "Barcelona": "barcelona,sagrada,familia,spain",
  "Berlin": "berlin,germany,skyline,city",
  "London": "london,big,ben,england",
  "New York": "new,york,manhattan,skyline",
  "Tokyo": "tokyo,japan,shibuya,city",
  "Toronto": "toronto,canada,cn,tower",
  "Sydney": "sydney,opera,house,australia",
  "Melbourne": "melbourne,australia,city,skyline",
  "Los Angeles": "los,angeles,hollywood,california",
  "San Francisco": "san,francisco,golden,gate",
  "Miami": "miami,beach,florida,skyline",
  "Chicago": "chicago,skyline,illinois,city",
  "Amsterdam": "amsterdam,canals,netherlands,city",
  "Vienna": "vienna,austria,architecture,city",
  "Prague": "prague,castle,czech,city",
  "Rome": "rome,colosseum,italy,city",
  "Venice": "venice,canals,italy,gondola",
  "Madrid": "madrid,spain,city,architecture",
  "Lisbon": "lisbon,portugal,city,skyline",
  "Istanbul": "istanbul,bosphorus,turkey,mosque",
  "Bangkok": "bangkok,thailand,temple,city",
  "Singapore": "singapore,marina,bay,skyline",
  "Hong Kong": "hong,kong,harbor,skyline",
  "Seoul": "seoul,korea,city,tower",
  "Dubai": "dubai,burj,khalifa,skyline",
  "Mexico City": "mexico,city,architecture,zocalo",
  "Rio de Janeiro": "rio,janeiro,christ,redeemer",
  "Sao Paulo": "sao,paulo,brazil,skyline",
  "São Paulo": "sao,paulo,brazil,skyline",
  "Athens": "athens,acropolis,greece,parthenon",
};

/**
 * Get city-specific image URL
 * Uses LoremFlickr with city keywords for relevant imagery
 */
export function getCityImageUrl(city?: string | null): string {
  const lockId = city ? Math.abs(city.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 100 : 1;
  
  if (!city) {
    return `https://loremflickr.com/1200/675/tango,dance?lock=1`;
  }

  // Try exact match first
  if (CITY_KEYWORDS[city]) {
    return `https://loremflickr.com/1200/675/${CITY_KEYWORDS[city]}?lock=${lockId}`;
  }

  // Try partial match (first word of city name)
  const firstWord = city.split(" ")[0];
  if (CITY_KEYWORDS[firstWord]) {
    return `https://loremflickr.com/1200/675/${CITY_KEYWORDS[firstWord]}?lock=${lockId}`;
  }

  // Fallback using city name as search
  return `https://loremflickr.com/1200/675/${city.toLowerCase().replace(/\s+/g, ',')},city,skyline?lock=${lockId}`;
}

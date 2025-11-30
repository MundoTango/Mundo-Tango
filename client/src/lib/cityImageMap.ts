/**
 * City Skyline & Cityscape Images
 * Direct Unsplash URLs for reliable city imagery
 */

export const CITY_IMAGE_MAP: Record<string, string> = {
  "Buenos Aires": "https://images.unsplash.com/photo-1595678029658-94cb5e533b55?w=1200&h=675&fit=crop&crop=faces",
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=675&fit=crop&crop=faces",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=675&fit=crop&crop=faces",
  "Berlin": "https://images.unsplash.com/photo-1566455957124-215d42a88fb2?w=1200&h=675&fit=crop&crop=faces",
  "London": "https://images.unsplash.com/photo-1533622547393-94f3e9e01e1e?w=1200&h=675&fit=crop&crop=faces",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=675&fit=crop&crop=faces",
  "Tokyo": "https://images.unsplash.com/photo-1540959375944-7049f642e9d4?w=1200&h=675&fit=crop&crop=faces",
  "Toronto": "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&h=675&fit=crop&crop=faces",
  "Sydney": "https://images.unsplash.com/photo-1506973404872-a4a7615e3fb0?w=1200&h=675&fit=crop&crop=faces",
  "Melbourne": "https://images.unsplash.com/photo-1579154204601-01d82a27c6f2?w=1200&h=675&fit=crop&crop=faces",
  "Los Angeles": "https://images.unsplash.com/photo-1516738901601-4f67e4051c14?w=1200&h=675&fit=crop&crop=faces",
  "San Francisco": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=675&fit=crop&crop=faces",
  "Miami": "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=675&fit=crop&crop=faces",
  "Chicago": "https://images.unsplash.com/photo-1494145904049-0dca7dc20965?w=1200&h=675&fit=crop&crop=faces",
  "Amsterdam": "https://images.unsplash.com/photo-1565008576549-4569b338fdc5?w=1200&h=675&fit=crop&crop=faces",
  "Vienna": "https://images.unsplash.com/photo-1516209294119-c61ccf33c084?w=1200&h=675&fit=crop&crop=faces",
  "Prague": "https://images.unsplash.com/photo-1512207736139-c8ac1a9b2d48?w=1200&h=675&fit=crop&crop=faces",
  "Rome": "https://images.unsplash.com/photo-1552832860-cfcdcd32ecc5?w=1200&h=675&fit=crop&crop=faces",
  "Venice": "https://images.unsplash.com/photo-1582010694319-640f85b2e3ca?w=1200&h=675&fit=crop&crop=faces",
  "Madrid": "https://images.unsplash.com/photo-1605771497491-2e6e5b5c5c5c?w=1200&h=675&fit=crop&crop=faces",
  "Lisbon": "https://images.unsplash.com/photo-1573422974827-d4dcfcbd9e85?w=1200&h=675&fit=crop&crop=faces",
  "Istanbul": "https://images.unsplash.com/photo-1512453475877-b8d662b67cb3?w=1200&h=675&fit=crop&crop=faces",
  "Bangkok": "https://images.unsplash.com/photo-1552465881-721f78ad4d1c?w=1200&h=675&fit=crop&crop=faces",
  "Singapore": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=675&fit=crop&crop=faces",
  "Hong Kong": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe3e?w=1200&h=675&fit=crop&crop=faces",
  "Seoul": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=675&fit=crop&crop=faces",
  "Dubai": "https://images.unsplash.com/photo-1512491768340-251e2be2107b?w=1200&h=675&fit=crop&crop=faces",
  "Mexico City": "https://images.unsplash.com/photo-1518154506305-a76b0e90a413?w=1200&h=675&fit=crop&crop=faces",
  "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99daa64bbb5d?w=1200&h=675&fit=crop&crop=faces",
  "Sao Paulo": "https://images.unsplash.com/photo-1554694752-8f64ddba8b51?w=1200&h=675&fit=crop&crop=faces",
  "São Paulo": "https://images.unsplash.com/photo-1554694752-8f64ddba8b51?w=1200&h=675&fit=crop&crop=faces",
  "Athens": "https://images.unsplash.com/photo-1570108497870-7a8e8e61b96e?w=1200&h=675&fit=crop&crop=faces",
};

/**
 * Get city-specific image URL
 * Returns direct Unsplash URL for reliable loading in all contexts
 */
export function getCityImageUrl(city?: string | null): string {
  if (!city) {
    return "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=675&fit=crop&crop=faces";
  }

  // Try exact match first
  if (CITY_IMAGE_MAP[city]) {
    return CITY_IMAGE_MAP[city];
  }

  // Try partial match (first word of city name)
  const firstWord = city.split(" ")[0];
  if (CITY_IMAGE_MAP[firstWord]) {
    return CITY_IMAGE_MAP[firstWord];
  }

  // Fallback to generic tango image
  return "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=675&fit=crop&crop=faces";
}

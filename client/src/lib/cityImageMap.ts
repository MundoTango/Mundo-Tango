/**
 * City Skyline & Cityscape Images
 * Maps cities to their iconic skyline/cityscape Unsplash images
 * Used for group cover photos in GroupsPage
 */

export const CITY_IMAGE_MAP: Record<string, string> = {
  // Major Tango Cities
  "Buenos Aires": "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1200&auto=format&fit=crop&q=80", // Buenos Aires Obelisco skyline
  "Paris": "https://images.unsplash.com/photo-1499856871957-5b8620a32237?w=1200&auto=format&fit=crop&q=80", // Eiffel Tower/Paris skyline
  "Barcelona": "https://images.unsplash.com/photo-1562883714039-c1c1e2b57ecb?w=1200&auto=format&fit=crop&q=80", // Sagrada Familia
  "Berlin": "https://images.unsplash.com/photo-1571735119606-7d44c5e9f0cd?w=1200&auto=format&fit=crop&q=80", // Berlin cityscape
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80", // Big Ben/London skyline
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80", // NYC skyline
  "Tokyo": "https://images.unsplash.com/photo-1540959375944-7049f642e9d4?w=1200&auto=format&fit=crop&q=80", // Tokyo neon/skyline
  "Toronto": "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&auto=format&fit=crop&q=80", // CN Tower
  "Sydney": "https://images.unsplash.com/photo-1506973404872-a4a7615e3fb0?w=1200&auto=format&fit=crop&q=80", // Opera House
  "Melbourne": "https://images.unsplash.com/photo-1506973404872-a4a7615e3fb0?w=1200&auto=format&fit=crop&q=80", // Melbourne street art
  "Los Angeles": "https://images.unsplash.com/photo-1516738901601-4f67e4051c14?w=1200&auto=format&fit=crop&q=80", // LA skyline
  "San Francisco": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop&q=80", // Golden Gate Bridge
  "Miami": "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&auto=format&fit=crop&q=80", // Miami skyline
  "Chicago": "https://images.unsplash.com/photo-1494145904049-0dca7dc20965?w=1200&auto=format&fit=crop&q=80", // Chicago skyline
  "Amsterdam": "https://images.unsplash.com/photo-1565008576549-4569b338fdc5?w=1200&auto=format&fit=crop&q=80", // Amsterdam canals
  "Vienna": "https://images.unsplash.com/photo-1575883328134-b280d127e63f?w=1200&auto=format&fit=crop&q=80", // Vienna classical architecture
  "Prague": "https://images.unsplash.com/photo-1512207736139-c8ac1a9b2d48?w=1200&auto=format&fit=crop&q=80", // Prague cityscape
  "Rome": "https://images.unsplash.com/photo-1552832860-cfcdcd32ecc5?w=1200&auto=format&fit=crop&q=80", // Colosseum
  "Venice": "https://images.unsplash.com/photo-1582010694319-640f85b2e3ca?w=1200&auto=format&fit=crop&q=80", // Venice canals
  "Madrid": "https://images.unsplash.com/photo-1554696311-bedc6691588f?w=1200&auto=format&fit=crop&q=80", // Madrid cityscape
  "Lisbon": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80", // Lisbon castle
  "Istanbul": "https://images.unsplash.com/photo-1512453475877-b8d662b67cb3?w=1200&auto=format&fit=crop&q=80", // Istanbul skyline
  "Bangkok": "https://images.unsplash.com/photo-1552465881-721f78ad4d1c?w=1200&auto=format&fit=crop&q=80", // Bangkok skyline
  "Singapore": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop&q=80", // Singapore skyline
  "Hong Kong": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop&q=80", // Hong Kong harbor
  "Seoul": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&auto=format&fit=crop&q=80", // Seoul cityscape
  "Dubai": "https://images.unsplash.com/photo-1512453475877-b8d662b67cb3?w=1200&auto=format&fit=crop&q=80", // Dubai skyline
  "Mexico City": "https://images.unsplash.com/photo-1518154506305-a76b0e90a413?w=1200&auto=format&fit=crop&q=80", // Mexico City skyline
  "Rio de Janeiro": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80", // Rio Christ the Redeemer
  "Sao Paulo": "https://images.unsplash.com/photo-1554694752-8f64ddba8b51?w=1200&auto=format&fit=crop&q=80", // São Paulo skyline
};

/**
 * Get city-specific image URL
 * Falls back to generic tango image if city not mapped
 */
export function getCityImageUrl(city?: string | null): string {
  if (!city) {
    return "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80"; // Generic tango/dance
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

  // Fallback to generic image
  return "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80";
}

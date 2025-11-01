/**
 * City Cityscape Photography System
 * 
 * Automatically selects and assigns cityscape cover images to city communities
 * Uses Unsplash API or curated database for high-quality urban photography
 */

interface CityscapeImage {
  url: string;
  thumbnailUrl: string;
  source: 'unsplash' | 'curated' | 'user';
  credit: string;
  photographerName?: string;
  photographerUrl?: string;
}

/**
 * Curated cityscape images for major tango cities
 * Fallback when Unsplash is unavailable
 */
const CURATED_CITYSCAPES: Record<string, CityscapeImage> = {
  'Buenos Aires': {
    url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400',
    source: 'curated',
    credit: 'Photo by Andrés Medina on Unsplash',
    photographerName: 'Andrés Medina',
    photographerUrl: 'https://unsplash.com/@andresmedina'
  },
  'Paris': {
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
    source: 'curated',
    credit: 'Photo by Alex Azabache on Unsplash',
    photographerName: 'Alex Azabache',
    photographerUrl: 'https://unsplash.com/@alexazabache'
  },
  'Istanbul': {
    url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400',
    source: 'curated',
    credit: 'Photo by Willian Justen de Vasconcellos on Unsplash',
    photographerName: 'Willian Justen de Vasconcellos',
    photographerUrl: 'https://unsplash.com/@willianjusten'
  },
  'New York': {
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    source: 'curated',
    credit: 'Photo by Luca Bravo on Unsplash',
    photographerName: 'Luca Bravo',
    photographerUrl: 'https://unsplash.com/@lucabravo'
  },
  'Tokyo': {
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    source: 'curated',
    credit: 'Photo by Louie Martinez on Unsplash',
    photographerName: 'Louie Martinez',
    photographerUrl: 'https://unsplash.com/@toodistant'
  },
  'Berlin': {
    url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400',
    source: 'curated',
    credit: 'Photo by Florian Wehde on Unsplash',
    photographerName: 'Florian Wehde',
    photographerUrl: 'https://unsplash.com/@florianwehde'
  },
  'London': {
    url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    source: 'curated',
    credit: 'Photo by Benjamin Davies on Unsplash',
    photographerName: 'Benjamin Davies',
    photographerUrl: 'https://unsplash.com/@bendavisual'
  },
  'San Francisco': {
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    source: 'curated',
    credit: 'Photo by Maarten van den Heuvel on Unsplash',
    photographerName: 'Maarten van den Heuvel',
    photographerUrl: 'https://unsplash.com/@mvdheuvel'
  },
  'Barcelona': {
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
    source: 'curated',
    credit: 'Photo by Aleksandar Pasaric on Unsplash',
    photographerName: 'Aleksandar Pasaric',
    photographerUrl: 'https://unsplash.com/@apasaric'
  },
  'Moscow': {
    url: 'https://images.unsplash.com/photo-1513326738677-b964603b136d',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400',
    source: 'curated',
    credit: 'Photo by Nikolay Vorobyev on Unsplash',
    photographerName: 'Nikolay Vorobyev',
    photographerUrl: 'https://unsplash.com/@nikolayv'
  }
};

/**
 * Generic cityscape for cities without curated images
 */
const DEFAULT_CITYSCAPE: CityscapeImage = {
  url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
  thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
  source: 'curated',
  credit: 'Photo by Pedro Lastra on Unsplash',
  photographerName: 'Pedro Lastra',
  photographerUrl: 'https://unsplash.com/@peterlaster'
};

/**
 * Get cityscape image for a city
 * First checks curated database, then falls back to default
 */
export function getCityscapeImage(cityName: string): CityscapeImage {
  // Check if we have a curated image for this city
  const curated = CURATED_CITYSCAPES[cityName];
  if (curated) {
    return curated;
  }
  
  // Check for close matches (e.g., "New York City" -> "New York")
  const cityNameLower = cityName.toLowerCase();
  for (const [curatedCity, image] of Object.entries(CURATED_CITYSCAPES)) {
    if (cityNameLower.includes(curatedCity.toLowerCase()) || 
        curatedCity.toLowerCase().includes(cityNameLower)) {
      return image;
    }
  }
  
  // Return default cityscape
  return DEFAULT_CITYSCAPE;
}

/**
 * Auto-assign cityscape to community
 * Returns database-ready object
 */
export function assignCityscapeToCommunity(cityName: string): {
  coverPhotoUrl: string;
  coverPhotoSource: string;
  coverPhotoCredit: string;
} {
  const cityscape = getCityscapeImage(cityName);
  
  return {
    coverPhotoUrl: cityscape.url,
    coverPhotoSource: cityscape.source,
    coverPhotoCredit: cityscape.credit
  };
}

/**
 * Batch assign cityscapes to multiple cities
 */
export function batchAssignCityscapes(
  cityNames: string[]
): Map<string, {
  coverPhotoUrl: string;
  coverPhotoSource: string;
  coverPhotoCredit: string;
}> {
  const assignments = new Map();
  
  for (const cityName of cityNames) {
    assignments.set(cityName, assignCityscapeToCommunity(cityName));
  }
  
  return assignments;
}

/**
 * Get list of cities with curated cityscapes
 */
export function getCitiesWithCuratedImages(): string[] {
  return Object.keys(CURATED_CITYSCAPES);
}

/**
 * Check if city has curated cityscape
 */
export function hasCuratedCityscape(cityName: string): boolean {
  return cityName in CURATED_CITYSCAPES;
}

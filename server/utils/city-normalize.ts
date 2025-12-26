/**
 * City Name Normalization Utilities
 * MB.MD v9.9.3 Canonical Matching Requirement
 * 
 * Normalizes city names for consistent matching across:
 * - travel_plans.city
 * - housing_listings.city
 * - cities.name
 */

// Comprehensive list of prefixes to strip (includes common Spanish/Portuguese/English variants)
const CITY_PREFIXES = [
  // Spanish prefixes (longest first for proper matching)
  'ciudad autonoma de',
  'ciudad autónoma de',
  'area metropolitana de',
  'área metropolitana de',
  'comunidad autonoma de',
  'comunidad autónoma de',
  'ciudad de',
  'distrito de',
  'municipio de',
  'provincia de',
  'departamento de',
  'comunidad de',
  'region de',
  'región de',
  'canton',
  'cantón',
  'gran',
  // Portuguese prefixes
  'regiao metropolitana de',
  'região metropolitana de',
  'area metropolitana do',
  'área metropolitana do',
  'cidade de',
  'municipio de',
  'município de',
  'estado de',
  'grande',
  // English prefixes
  'the city of',
  'city of',
  'greater',
  'metro',
  'metropolitan',
  'state of',
  'region of',
  'county of',
  'borough of',
  'town of',
  'village of',
  // French prefixes
  'communaute de',
  'communauté de',
  'ville de',
  'région de',
  // German prefixes
  'gemeinde',
  'stadt',
  // Italian prefixes
  'citta di',
  'città di',
  'comune di',
  'provincia di',
];

// Comprehensive list of suffixes to strip
const CITY_SUFFIXES = [
  // Application-specific (longest first)
  'tango community',
  'tango',
  // Common geographic suffixes
  'metropolitan area',
  'metro area',
  'region',
  'city',
  'area',
  'district',
  'county',
  'province',
  'state',
  'd.c.',
  'dc',
];

// Country names to strip from "City, Country" format
const COUNTRY_NAMES = [
  'argentina', 'brazil', 'brasil', 'chile', 'colombia', 'uruguay', 'paraguay',
  'peru', 'venezuela', 'ecuador', 'bolivia', 'mexico', 'costa rica', 'panama',
  'guatemala', 'honduras', 'el salvador', 'nicaragua', 'cuba', 'dominican republic',
  'puerto rico', 'united states', 'usa', 'us', 'canada', 'uk', 'united kingdom',
  'england', 'france', 'germany', 'italy', 'spain', 'portugal', 'netherlands',
  'belgium', 'switzerland', 'austria', 'poland', 'czech republic', 'czechia',
  'hungary', 'romania', 'bulgaria', 'greece', 'turkey', 'russia', 'ukraine',
  'israel', 'egypt', 'south africa', 'australia', 'new zealand', 'japan',
  'china', 'south korea', 'korea', 'taiwan', 'singapore', 'thailand', 'vietnam',
  'indonesia', 'malaysia', 'philippines', 'india', 'pakistan', 'uae', 'dubai',
];

/**
 * Normalize a city name for canonical matching
 * Handles: diacritics, prefixes, suffixes, country names, case, and whitespace
 */
export function normalizeCityName(name: string): string {
  if (!name) return '';
  
  // First, handle "City, Country" format - take just the city part
  let input = name;
  if (input.includes(',')) {
    input = input.split(',')[0].trim();
  }
  // Also handle "City - Country" or "City – Country" format
  if (input.includes(' - ') || input.includes(' – ')) {
    input = input.split(/\s[-–]\s/)[0].trim();
  }
  
  let normalized = input
    // Convert to lowercase
    .toLowerCase()
    // Normalize Unicode (NFD) then remove diacritics (combining marks)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace special characters with space
    .replace(/['".\-_()]/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  // Strip common prefixes (list is ordered longest first)
  for (const prefix of CITY_PREFIXES) {
    // Normalize the prefix too for comparison
    const normalizedPrefix = prefix
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalized.startsWith(normalizedPrefix + ' ')) {
      normalized = normalized.slice(normalizedPrefix.length + 1).trim();
      break; // Only strip one prefix
    }
  }
  
  // Strip common suffixes (list is ordered longest first) - allow multiple passes
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of CITY_SUFFIXES) {
      const normalizedSuffix = suffix
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (normalized.endsWith(' ' + normalizedSuffix)) {
        normalized = normalized.slice(0, -(normalizedSuffix.length + 1)).trim();
        changed = true;
        break;
      }
    }
  }
  
  // Strip country names from the end (in case comma wasn't used)
  for (const country of COUNTRY_NAMES) {
    const normalizedCountry = country
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalized.endsWith(' ' + normalizedCountry)) {
      normalized = normalized.slice(0, -(normalizedCountry.length + 1)).trim();
      break;
    }
  }
  
  return normalized;
}

/**
 * Create a URL-safe slug from a city name
 */
export function cityToSlug(name: string): string {
  return normalizeCityName(name)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Check if two city names match canonically
 * Uses normalized comparison to handle diacritics, prefixes, suffixes
 */
export function citiesMatch(city1: string, city2: string): boolean {
  const norm1 = normalizeCityName(city1);
  const norm2 = normalizeCityName(city2);
  return norm1 === norm2;
}

/**
 * Get SQL-safe pattern for ILIKE matching with normalized city name
 * Returns the normalized name for use in SQL queries
 */
export function getNormalizedCityPattern(name: string): string {
  return normalizeCityName(name);
}

// Test cases for the normalization:
// "Buenos Aires" -> "buenos aires"
// "Ciudad Autónoma de Buenos Aires" -> "buenos aires"
// "São Paulo" -> "sao paulo"
// "Bogotá D.C." -> "bogota"
// "Greater London" -> "london"
// "Buenos Aires Tango Community" -> "buenos aires"
// "Ciudad de México" -> "mexico"

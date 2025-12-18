/**
 * Timezone utilities - infer timezone from user's location
 */

// City to timezone mapping
export const CITY_TIMEZONE_MAP: Record<string, string> = {
  'Buenos Aires': 'America/Argentina/Buenos_Aires',
  'New York': 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'London': 'Europe/London',
  'Paris': 'Europe/Paris',
  'Berlin': 'Europe/Berlin',
  'Tokyo': 'Asia/Tokyo',
  'Sydney': 'Australia/Sydney',
  'Toronto': 'America/Toronto',
  'Mexico City': 'America/Mexico_City',
  'Madrid': 'Europe/Madrid',
  'Barcelona': 'Europe/Madrid',
  'São Paulo': 'America/Sao_Paulo',
  'Rio de Janeiro': 'America/Sao_Paulo',
  'Moscow': 'Europe/Moscow',
  'Bangkok': 'Asia/Bangkok',
  'Singapore': 'Asia/Singapore',
  'Hong Kong': 'Asia/Hong_Kong',
  'Seoul': 'Asia/Seoul',
  'Mumbai': 'Asia/Kolkata',
  'Dubai': 'Asia/Dubai',
  'Istanbul': 'Europe/Istanbul',
  'Mexico': 'America/Mexico_City',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'USA': 'America/New_York',
  'UK': 'Europe/London',
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Spain': 'Europe/Madrid',
  'Italy': 'Europe/Rome',
  'Japan': 'Asia/Tokyo',
  'Australia': 'Australia/Sydney',
  'Canada': 'America/Toronto',
  'China': 'Asia/Shanghai',
  'India': 'Asia/Kolkata',
  'Russia': 'Europe/Moscow',
};

export function getTimezoneFromCity(city: string | null | undefined): string {
  if (!city) return 'UTC';
  
  // Exact match first
  if (CITY_TIMEZONE_MAP[city]) {
    return CITY_TIMEZONE_MAP[city];
  }
  
  // Try partial match (case-insensitive)
  const lowerCity = city.toLowerCase();
  for (const [key, tz] of Object.entries(CITY_TIMEZONE_MAP)) {
    if (key.toLowerCase().includes(lowerCity) || lowerCity.includes(key.toLowerCase())) {
      return tz;
    }
  }
  
  return 'UTC';
}

export function formatTimezoneAbbr(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}

export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    // This is a simplified approach - for production, use a library like date-fns-tz
    return formatTimezoneAbbr(timezone);
  } catch {
    return 'UTC';
  }
}

/**
 * FREE API SERVICE - Open Source Data Enrichment
 * MB.MD v9.9.3 - Leveraging public-apis GitHub Repository
 * 
 * Integrates free/open APIs for:
 * - City data enrichment
 * - Weather information
 * - Event discovery
 * - Geolocation services
 * - Currency conversion
 */

import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface CityInfo {
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

export interface WeatherInfo {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
}

export interface CountryInfo {
  name: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  languages: string[];
  currencies: { code: string; name: string; symbol: string }[];
  flag: string;
  timezones: string[];
}

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  timestamp: Date;
}

export interface EventAPIResult {
  source: string;
  events: Array<{
    title: string;
    date: Date;
    location: string;
    description?: string;
    url?: string;
    category?: string;
  }>;
}

// ============================================================================
// FREE API SERVICE
// ============================================================================

export class FreeAPIService {
  private cache = new Map<string, { data: any; expires: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get city information from GeoNames or OSM
   */
  async getCityInfo(cityName: string): Promise<CityInfo | null> {
    const cacheKey = `city:${cityName.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try Nominatim (OpenStreetMap) first - no API key needed
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: cityName,
            format: 'json',
            limit: 1,
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'MundoTango/1.0'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const cityInfo: CityInfo = {
          name: result.address?.city || result.address?.town || result.name,
          country: result.address?.country || '',
          countryCode: result.address?.country_code?.toUpperCase() || '',
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          population: 0, // OSM doesn't provide population
          timezone: '' // Will be enriched separately
        };

        this.setCache(cacheKey, cityInfo);
        return cityInfo;
      }

      return null;
    } catch (error) {
      console.error('[FreeAPI] City lookup failed:', error);
      return null;
    }
  }

  /**
   * Get weather information from Open-Meteo (completely free, no API key)
   */
  async getWeather(lat: number, lon: number): Promise<WeatherInfo | null> {
    const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        'https://api.open-meteo.com/v1/forecast',
        {
          params: {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m'
          }
        }
      );

      const current = response.data.current;
      const weatherInfo: WeatherInfo = {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        description: this.weatherCodeToDescription(current.weather_code),
        icon: this.weatherCodeToIcon(current.weather_code),
        windSpeed: current.wind_speed_10m
      };

      this.setCache(cacheKey, weatherInfo);
      return weatherInfo;
    } catch (error) {
      console.error('[FreeAPI] Weather lookup failed:', error);
      return null;
    }
  }

  /**
   * Get country information from REST Countries API (free, no key)
   */
  async getCountryInfo(countryCode: string): Promise<CountryInfo | null> {
    const cacheKey = `country:${countryCode.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://restcountries.com/v3.1/alpha/${countryCode}`
      );

      if (response.data && response.data.length > 0) {
        const country = response.data[0];
        const countryInfo: CountryInfo = {
          name: country.name.common,
          capital: country.capital?.[0] || '',
          region: country.region,
          subregion: country.subregion,
          population: country.population,
          languages: Object.values(country.languages || {}),
          currencies: Object.entries(country.currencies || {}).map(([code, data]: any) => ({
            code,
            name: data.name,
            symbol: data.symbol
          })),
          flag: country.flags?.svg || country.flags?.png || '',
          timezones: country.timezones || []
        };

        this.setCache(cacheKey, countryInfo);
        return countryInfo;
      }

      return null;
    } catch (error) {
      console.error('[FreeAPI] Country lookup failed:', error);
      return null;
    }
  }

  /**
   * Get exchange rates from ExchangeRate-API (free tier available)
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate | null> {
    const cacheKey = `exchange:${from.toLowerCase()}:${to.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Using Frankfurter API (free, no key, ECB data)
      const response = await axios.get(
        `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}`
      );

      if (response.data && response.data.rates) {
        const exchangeRate: ExchangeRate = {
          base: from.toUpperCase(),
          target: to.toUpperCase(),
          rate: response.data.rates[to.toUpperCase()],
          timestamp: new Date(response.data.date)
        };

        this.setCache(cacheKey, exchangeRate);
        return exchangeRate;
      }

      return null;
    } catch (error) {
      console.error('[FreeAPI] Exchange rate lookup failed:', error);
      return null;
    }
  }

  /**
   * Get IP geolocation (ip-api.com - free for non-commercial)
   */
  async getGeoFromIP(ip: string): Promise<CityInfo | null> {
    const cacheKey = `geo:${ip}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);

      if (response.data && response.data.status === 'success') {
        const data = response.data;
        const cityInfo: CityInfo = {
          name: data.city,
          country: data.country,
          countryCode: data.countryCode,
          latitude: data.lat,
          longitude: data.lon,
          population: 0,
          timezone: data.timezone
        };

        this.setCache(cacheKey, cityInfo);
        return cityInfo;
      }

      return null;
    } catch (error) {
      console.error('[FreeAPI] IP geolocation failed:', error);
      return null;
    }
  }

  /**
   * Search Wikipedia for tango-related information
   */
  async searchWikipedia(query: string): Promise<string | null> {
    try {
      const response = await axios.get(
        'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query)
      );

      if (response.data && response.data.extract) {
        return response.data.extract;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get public holidays for event planning
   */
  async getPublicHolidays(countryCode: string, year: number): Promise<Array<{ date: string; name: string }>> {
    const cacheKey = `holidays:${countryCode}:${year}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`
      );

      const holidays = response.data.map((h: any) => ({
        date: h.date,
        name: h.localName || h.name
      }));

      this.setCache(cacheKey, holidays);
      return holidays;
    } catch (error) {
      console.error('[FreeAPI] Holidays lookup failed:', error);
      return [];
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private weatherCodeToDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail'
    };
    return descriptions[code] || 'Unknown';
  }

  private weatherCodeToIcon(code: number): string {
    if (code === 0) return 'sun';
    if (code <= 3) return 'cloud-sun';
    if (code <= 48) return 'cloud-fog';
    if (code <= 55) return 'cloud-drizzle';
    if (code <= 65) return 'cloud-rain';
    if (code <= 75) return 'cloud-snow';
    if (code <= 82) return 'cloud-showers-heavy';
    return 'bolt';
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.cacheTimeout
    });
  }
}

// Singleton instance
export const freeAPIService = new FreeAPIService();

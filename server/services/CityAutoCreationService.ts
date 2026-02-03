import { db } from '../../database';
import { GeocodingService } from './GeocodingService';

export interface CityCreationResult {
  cityId: number;
  created: boolean;
  confidence: number;
  source: string;
}

export interface CityData {
  name: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  source: string;
}

export class CityAutoCreationService {
  private geocodingService: GeocodingService;
  private readonly MIN_CONFIDENCE = 0.75;

  constructor() {
    this.geocodingService = new GeocodingService();
  }

  /**
   * Automatically create or find a city record
   */
  async createOrFindCity(cityData: CityData): Promise<CityCreationResult> {
    try {
      // First, check if city already exists
      const existingCity = await this.findExistingCity(cityData);
      if (existingCity) {
        return {
          cityId: existingCity.id,
          created: false,
          confidence: 1.0,
          source: 'existing',
        };
      }

      // If no coordinates provided, geocode the city
      let latitude = cityData.latitude;
      let longitude = cityData.longitude;
      let confidence = 0.85; // Base confidence for provided data

      if (!latitude || !longitude) {
        const geocodeResult = await this.geocodingService.geocodeCity(
          cityData.name,
          cityData.state,
          cityData.country
        );

        if (!geocodeResult) {
          console.warn(`Failed to geocode city: ${cityData.name}, ${cityData.state}, ${cityData.country}`);
          return {
            cityId: -1,
            created: false,
            confidence: 0,
            source: 'failed_geocode',
          };
        }

        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        confidence = geocodeResult.confidence || 0.80;
      }

      // Only create city if confidence is high enough
      if (confidence < this.MIN_CONFIDENCE) {
        console.warn(
          `Confidence too low (${confidence}) to auto-create city: ${cityData.name}`
        );
        return {
          cityId: -1,
          created: false,
          confidence,
          source: 'low_confidence',
        };
      }

      // Create the city record
      const newCity = await db.query(
        `
        INSERT INTO cities (name, state, country, latitude, longitude, auto_created, auto_created_confidence, auto_created_source)
        VALUES ($1, $2, $3, $4, $5, true, $6, $7)
        RETURNING id
        `,
        [cityData.name, cityData.state, cityData.country, latitude, longitude, confidence, cityData.source]
      );

      const cityId = newCity.rows[0].id;

      console.log(
        `Auto-created city: ${cityData.name}, ${cityData.state}, ${cityData.country} (ID: ${cityId}, confidence: ${confidence})`
      );

      return {
        cityId,
        created: true,
        confidence,
        source: cityData.source,
      };
    } catch (error) {
      console.error('Error in createOrFindCity:', error);
      throw error;
    }
  }

  /**
   * Find existing city by name, state, and country
   */
  private async findExistingCity(cityData: CityData): Promise<{ id: number } | null> {
    try {
      const result = await db.query(
        `
        SELECT id FROM cities
        WHERE LOWER(name) = LOWER($1)
          AND LOWER(country) = LOWER($2)
          AND (state IS NULL OR LOWER(state) = LOWER($3))
        LIMIT 1
        `,
        [cityData.name, cityData.country, cityData.state || null]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error finding existing city:', error);
      return null;
    }
  }

  /**
   * Batch create or find multiple cities
   */
  async batchCreateOrFindCities(cities: CityData[]): Promise<CityCreationResult[]> {
    const results: CityCreationResult[] = [];

    for (const city of cities) {
      try {
        const result = await this.createOrFindCity(city);
        results.push(result);
      } catch (error) {
        console.error(`Error processing city ${city.name}:`, error);
        results.push({
          cityId: -1,
          created: false,
          confidence: 0,
          source: 'error',
        });
      }
    }

    return results;
  }

  /**
   * Update city confidence score
   */
  async updateCityConfidence(cityId: number, newConfidence: number, reason: string): Promise<void> {
    try {
      await db.query(
        `
        UPDATE cities
        SET auto_created_confidence = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [newConfidence, cityId]
      );

      console.log(`Updated city ${cityId} confidence to ${newConfidence} (${reason})`);
    } catch (error) {
      console.error('Error updating city confidence:', error);
      throw error;
    }
  }
}

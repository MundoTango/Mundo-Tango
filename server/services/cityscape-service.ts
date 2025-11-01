/**
 * CITYSCAPE PHOTO SERVICE
 * Auto-fetches beautiful cityscape photos from Pexels/Unsplash
 * Used for city community cover photos
 */

interface CityPhoto {
  url: string;
  source: 'pexels' | 'unsplash';
  credit: string;
  photographer: string;
}

export class CityscapeService {
  private pexelsApiKey = process.env.PEXELS_API_KEY;
  private unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

  /**
   * Fetch cityscape photo for a city
   * Tries Pexels first, falls back to Unsplash
   */
  async fetchCityscapePhoto(cityName: string): Promise<CityPhoto | null> {
    // Try Pexels first
    if (this.pexelsApiKey) {
      const pexelsPhoto = await this.fetchFromPexels(cityName);
      if (pexelsPhoto) return pexelsPhoto;
    }

    // Fallback to Unsplash
    if (this.unsplashAccessKey) {
      const unsplashPhoto = await this.fetchFromUnsplash(cityName);
      if (unsplashPhoto) return unsplashPhoto;
    }

    return null;
  }

  private async fetchFromPexels(cityName: string): Promise<CityPhoto | null> {
    try {
      const query = `${cityName} cityscape skyline`;
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: this.pexelsApiKey!,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        return {
          url: photo.src.large2x,
          source: 'pexels',
          credit: `Photo by ${photo.photographer} on Pexels`,
          photographer: photo.photographer,
        };
      }

      return null;
    } catch (error) {
      console.error('[Pexels] Error fetching cityscape:', error);
      return null;
    }
  }

  private async fetchFromUnsplash(cityName: string): Promise<CityPhoto | null> {
    try {
      const query = `${cityName} cityscape`;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return {
          url: photo.urls.regular,
          source: 'unsplash',
          credit: `Photo by ${photo.user.name} on Unsplash`,
          photographer: photo.user.name,
        };
      }

      return null;
    } catch (error) {
      console.error('[Unsplash] Error fetching cityscape:', error);
      return null;
    }
  }

  /**
   * Parse city name from location string
   * "Buenos Aires, Argentina" -> "Buenos Aires"
   * "Paris 11th arrondissement" -> "Paris"
   */
  parseCityFromLocation(location: string): string | null {
    if (!location) return null;
    
    // Remove everything after comma
    const parts = location.split(',');
    const city = parts[0].trim();
    
    // Remove district/arrondissement patterns
    const cleanCity = city.replace(/\s+\d+(st|nd|rd|th)\s+(district|arrondissement)/i, '').trim();
    
    return cleanCity || null;
  }
}

export const cityscapeService = new CityscapeService();

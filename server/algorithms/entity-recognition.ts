/**
 * A35: ENTITY RECOGNITION ALGORITHM
 * Identifies named entities in content
 */

interface Entity {
  text: string;
  type: 'person' | 'location' | 'organization' | 'event' | 'other';
  confidence: number;
}

export class EntityRecognitionAlgorithm {
  async recognizeEntities(content: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    // Simple pattern matching for locations
    const cities = ['Buenos Aires', 'Paris', 'New York', 'Berlin', 'London'];
    cities.forEach(city => {
      if (content.includes(city)) {
        entities.push({
          text: city,
          type: 'location',
          confidence: 0.9,
        });
      }
    });

    // Extract capitalized words as potential entities
    const words = content.split(/\s+/);
    words.forEach(word => {
      if (/^[A-Z][a-z]+$/.test(word) && word.length > 3) {
        entities.push({
          text: word,
          type: 'other',
          confidence: 0.6,
        });
      }
    });

    return entities;
  }
}

export const entityRecognition = new EntityRecognitionAlgorithm();

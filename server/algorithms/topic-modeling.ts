/**
 * A36: TOPIC MODELING ALGORITHM
 * Identifies main topics in content
 */

interface TopicResult {
  topics: string[];
  weights: number[];
  primaryTopic: string;
}

export class TopicModelingAlgorithm {
  private topicKeywords = {
    'tango-technique': ['technique', 'steps', 'posture', 'embrace', 'walk'],
    'events': ['milonga', 'festival', 'workshop', 'event', 'class'],
    'music': ['orchestra', 'tanda', 'cortina', 'vals', 'milonga'],
    'community': ['community', 'friends', 'dancers', 'social', 'connection'],
    'teaching': ['teach', 'learn', 'instructor', 'lesson', 'practice'],
  };

  async identifyTopics(content: string): Promise<TopicResult> {
    const lower = content.toLowerCase();
    const topics: string[] = [];
    const weights: number[] = [];

    Object.entries(this.topicKeywords).forEach(([topic, keywords]) => {
      const matches = keywords.filter(kw => lower.includes(kw)).length;
      if (matches > 0) {
        topics.push(topic);
        weights.push(matches / keywords.length);
      }
    });

    const primaryIdx = weights.indexOf(Math.max(...weights));
    const primaryTopic = topics[primaryIdx] || 'general';

    return { topics, weights, primaryTopic };
  }
}

export const topicModeling = new TopicModelingAlgorithm();

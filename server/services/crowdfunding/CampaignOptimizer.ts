import { db } from "@shared/db";
import { crowdfundingCampaigns, campaignRewards, campaignUpdates } from "@shared/schema";
import { eq } from "drizzle-orm";
import { OpenAIService } from "../ai/OpenAIService";

export interface OptimizationAnalysis {
  campaignId: number;
  overallScore: number;
  titleAnalysis: {
    score: number;
    currentTitle: string;
    suggestions: string[];
    improvedVersions: string[];
  };
  storyAnalysis: {
    score: number;
    readabilityScore: number;
    emotionalAppealScore: number;
    structureScore: number;
    improvements: string[];
    suggestedSections: {
      problem: string;
      solution: string;
      impact: string;
    };
  };
  imageAnalysis: {
    score: number;
    hasImage: boolean;
    suggestions: string[];
  };
  rewardTierOptimization: {
    score: number;
    currentTiers: number;
    recommendations: {
      suggestedPricing: number[];
      descriptions: string[];
      quantities: string[];
    };
  };
  updateStrategy: {
    score: number;
    currentFrequency: string;
    recommendedFrequency: string;
    contentSuggestions: string[];
  };
  callToAction: {
    score: number;
    currentCTA: string;
    improvedCTAs: string[];
  };
  socialProof: {
    suggestions: string[];
  };
  abTestingRecommendations: string[];
}

export class CampaignOptimizerAgent {
  async optimizeCampaign(campaignId: number): Promise<OptimizationAnalysis> {
    const campaign = await db.query.crowdfundingCampaigns.findFirst({
      where: eq(crowdfundingCampaigns.id, campaignId),
      with: {
        rewards: true,
        updates: true,
      }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const [
      titleAnalysis,
      storyAnalysis,
      imageAnalysis,
      rewardAnalysis,
      updateStrategy,
      ctaAnalysis,
      socialProof,
      abTesting
    ] = await Promise.all([
      this.analyzeTitleOptimization(campaign.title),
      this.analyzeStoryOptimization(campaign.story),
      this.analyzeImageOptimization(campaign.imageUrl),
      this.analyzeRewardTiers(campaign.rewards || []),
      this.analyzeUpdateStrategy(campaign.updates || [], campaign.createdAt),
      this.analyzeCallToAction(campaign.story),
      this.analyzeSocialProof(campaign),
      this.generateABTestingRecommendations(campaign)
    ]);

    const overallScore = Math.round(
      (titleAnalysis.score * 0.15 +
       storyAnalysis.score * 0.30 +
       imageAnalysis.score * 0.15 +
       rewardAnalysis.score * 0.20 +
       updateStrategy.score * 0.10 +
       ctaAnalysis.score * 0.10)
    );

    return {
      campaignId,
      overallScore,
      titleAnalysis,
      storyAnalysis,
      imageAnalysis,
      rewardTierOptimization: rewardAnalysis,
      updateStrategy,
      callToAction: ctaAnalysis,
      socialProof,
      abTestingRecommendations: abTesting,
    };
  }

  private async analyzeTitleOptimization(title: string): Promise<any> {
    let score = 50;
    const suggestions: string[] = [];

    const emotionalKeywords = ['help', 'support', 'save', 'dream', 'change', 'transform', 'inspire', 'create', 'build', 'hope'];
    const actionVerbs = ['build', 'make', 'launch', 'start', 'grow', 'achieve', 'reach', 'fund'];

    const lowerTitle = title.toLowerCase();
    const hasEmotional = emotionalKeywords.some(k => lowerTitle.includes(k));
    const hasAction = actionVerbs.some(v => lowerTitle.includes(v));

    if (!hasEmotional) {
      suggestions.push("Add emotional keywords like 'help', 'support', or 'transform' to create connection");
      score -= 15;
    } else {
      score += 10;
    }

    if (!hasAction) {
      suggestions.push("Include action verbs like 'build', 'launch', or 'achieve' to show momentum");
      score -= 10;
    } else {
      score += 10;
    }

    if (title.length < 30) {
      suggestions.push("Expand your title to 40-80 characters for better clarity");
      score -= 15;
    } else if (title.length > 100) {
      suggestions.push("Shorten your title to under 80 characters for better readability");
      score -= 10;
    } else if (title.length >= 40 && title.length <= 80) {
      score += 15;
    }

    if (!/[!?]/.test(title)) {
      suggestions.push("Consider adding an exclamation point or question mark for impact");
    } else {
      score += 5;
    }

    const improvedVersions = await this.generateImprovedTitles(title);

    return {
      score: Math.max(0, Math.min(100, score)),
      currentTitle: title,
      suggestions,
      improvedVersions,
    };
  }

  private async generateImprovedTitles(currentTitle: string): Promise<string[]> {
    try {
      const prompt = `Generate 3 improved crowdfunding campaign titles based on this one: "${currentTitle}"
      
Make them:
- Emotionally engaging with keywords like "help", "support", "transform"
- Include action verbs
- 40-80 characters long
- Inspiring and clear
- Different approaches (emotional appeal, urgency, aspirational)

Return ONLY the 3 titles, one per line, no numbering or explanations.`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 150,
      });

      return response.content
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating improved titles:', error);
      return [
        `Help ${currentTitle.split(' ').slice(0, 8).join(' ')}!`,
        `Support Our Mission: ${currentTitle.split(' ').slice(0, 6).join(' ')}`,
        `Transform Lives: ${currentTitle.split(' ').slice(0, 7).join(' ')}`,
      ];
    }
  }

  private async analyzeStoryOptimization(story: string): Promise<any> {
    let structureScore = 50;
    let readabilityScore = 50;
    let emotionalScore = 50;
    const improvements: string[] = [];

    if (story.length < 300) {
      improvements.push("Expand your story to at least 600 words for better conversion");
      structureScore -= 20;
    } else if (story.length > 300 && story.length < 600) {
      structureScore += 10;
    } else if (story.length >= 600) {
      structureScore += 20;
    }

    const paragraphs = story.split('\n\n').filter(p => p.trim());
    if (paragraphs.length < 3) {
      improvements.push("Break your story into at least 3-5 paragraphs for better readability");
      readabilityScore -= 15;
    } else {
      readabilityScore += 15;
    }

    const hasProblemSection = /problem|challenge|need|struggle|difficulty|obstacle/i.test(story);
    const hasSolutionSection = /solution|plan|will|goal|approach|strategy/i.test(story);
    const hasImpactSection = /impact|change|help|difference|transform|benefit/i.test(story);

    if (!hasProblemSection) {
      improvements.push("Add a clear problem statement explaining the challenge you're addressing");
      structureScore -= 15;
    }
    if (!hasSolutionSection) {
      improvements.push("Describe your solution and action plan clearly");
      structureScore -= 15;
    }
    if (!hasImpactSection) {
      improvements.push("Highlight the impact and how donations will make a difference");
      structureScore -= 15;
    }

    const emotionalKeywords = ['dream', 'hope', 'change', 'transform', 'inspire', 'overcome', 'achieve'];
    const emotionalCount = emotionalKeywords.filter(k => new RegExp(k, 'i').test(story)).length;
    emotionalScore += emotionalCount * 8;

    if (emotionalCount === 0) {
      improvements.push("Add emotional appeal with words like 'dream', 'hope', 'transform'");
    }

    const suggestedSections = await this.generateStorySections(story);

    const overallScore = Math.round((structureScore + readabilityScore + emotionalScore) / 3);

    return {
      score: Math.max(0, Math.min(100, overallScore)),
      readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
      emotionalAppealScore: Math.max(0, Math.min(100, emotionalScore)),
      structureScore: Math.max(0, Math.min(100, structureScore)),
      improvements,
      suggestedSections,
    };
  }

  private async generateStorySections(currentStory: string): Promise<any> {
    try {
      const prompt = `Based on this crowdfunding campaign story, generate three clear sections:

Current Story:
${currentStory}

Generate:
1. PROBLEM section (2-3 sentences describing the challenge)
2. SOLUTION section (2-3 sentences describing your approach/plan)
3. IMPACT section (2-3 sentences describing the difference donations will make)

Format:
PROBLEM: [text]
SOLUTION: [text]
IMPACT: [text]`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 400,
      });

      const sections = response.content.split('\n').reduce((acc: any, line) => {
        if (line.startsWith('PROBLEM:')) acc.problem = line.replace('PROBLEM:', '').trim();
        if (line.startsWith('SOLUTION:')) acc.solution = line.replace('SOLUTION:', '').trim();
        if (line.startsWith('IMPACT:')) acc.impact = line.replace('IMPACT:', '').trim();
        return acc;
      }, {});

      return sections;
    } catch (error) {
      console.error('Error generating story sections:', error);
      return {
        problem: "Clearly state the problem or need you're addressing",
        solution: "Describe your specific plan and how you'll use the funds",
        impact: "Explain the positive change donors will help create",
      };
    }
  }

  private async analyzeImageOptimization(imageUrl: string | null): Promise<any> {
    const hasImage = !!imageUrl;
    const suggestions: string[] = [];

    if (!hasImage) {
      return {
        score: 30,
        hasImage: false,
        suggestions: [
          "Add a high-quality main image (campaigns with images raise 3x more)",
          "Use an authentic photo showing your project, team, or cause",
          "Ensure image is at least 1200x630 pixels for best quality",
          "Show faces if possible - personal connections increase donations",
        ],
      };
    }

    return {
      score: 85,
      hasImage: true,
      suggestions: [
        "Ensure your image is high resolution (minimum 1200x630 pixels)",
        "Consider A/B testing different images to find what resonates",
        "Add text overlay with your campaign goal for clarity",
      ],
    };
  }

  private async analyzeRewardTiers(rewards: any[]): Promise<any> {
    let score = 50;
    const recommendations: any = {
      suggestedPricing: [25, 50, 100, 250, 500],
      descriptions: [],
      quantities: [],
    };

    if (rewards.length === 0) {
      return {
        score: 30,
        currentTiers: 0,
        recommendations: {
          suggestedPricing: [25, 50, 100, 250, 500],
          descriptions: [
            "Early Bird Special - Be one of the first supporters",
            "Supporter Tier - Help bring this project to life",
            "Champion Tier - Make a significant impact",
            "Benefactor Tier - Premium recognition and benefits",
            "Platinum Tier - Exclusive perks and lifetime gratitude",
          ],
          quantities: ["Unlimited", "Unlimited", "Limited to 100", "Limited to 50", "Limited to 20"],
        },
      };
    }

    if (rewards.length >= 3 && rewards.length <= 5) {
      score += 25;
    } else if (rewards.length < 3) {
      score -= 15;
    } else if (rewards.length > 8) {
      score -= 10;
    }

    const prices = rewards.map(r => r.price);
    const hasLowTier = prices.some(p => p >= 20 && p <= 30);
    const hasMidTier = prices.some(p => p >= 45 && p <= 75);
    const hasHighTier = prices.some(p => p >= 100 && p <= 150);

    if (hasLowTier) score += 10;
    if (hasMidTier) score += 10;
    if (hasHighTier) score += 10;

    const avgDescLength = rewards.reduce((sum, r) => sum + (r.description?.length || 0), 0) / rewards.length;
    if (avgDescLength > 80) {
      score += 10;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      currentTiers: rewards.length,
      recommendations,
    };
  }

  private async analyzeUpdateStrategy(updates: any[], createdAt: Date): Promise<any> {
    const daysSinceLaunch = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const updateCount = updates.length;

    let score = 50;
    let currentFrequency = 'None';
    const recommendedFrequency = '2-3 updates per week';
    const contentSuggestions: string[] = [];

    if (daysSinceLaunch > 0) {
      const weeksSinceLaunch = daysSinceLaunch / 7;
      const updatesPerWeek = updateCount / weeksSinceLaunch;

      if (updatesPerWeek >= 2 && updatesPerWeek <= 3) {
        score = 100;
        currentFrequency = 'Optimal (2-3 per week)';
      } else if (updatesPerWeek >= 1 && updatesPerWeek < 2) {
        score = 70;
        currentFrequency = 'Good (1-2 per week)';
      } else if (updatesPerWeek < 1) {
        score = 40;
        currentFrequency = 'Too infrequent';
        contentSuggestions.push("Increase update frequency to 2-3 times per week");
      } else {
        score = 60;
        currentFrequency = 'Too frequent';
        contentSuggestions.push("Reduce updates to 2-3 per week to avoid overwhelming donors");
      }
    }

    contentSuggestions.push(
      "Share milestone celebrations (25%, 50%, 75% funded)",
      "Post behind-the-scenes photos and videos",
      "Thank donors publicly (with permission)",
      "Share progress reports on how funds are being used",
      "Highlight donor stories and testimonials"
    );

    return {
      score,
      currentFrequency,
      recommendedFrequency,
      contentSuggestions,
    };
  }

  private async analyzeCallToAction(story: string): Promise<any> {
    let score = 50;
    const ctaKeywords = ['donate', 'contribute', 'support', 'help', 'join', 'back', 'pledge'];
    const urgencyWords = ['today', 'now', 'today', 'limited', 'soon'];

    const lowerStory = story.toLowerCase();
    const hasCTA = ctaKeywords.some(k => lowerStory.includes(k));
    const hasUrgency = urgencyWords.some(w => lowerStory.includes(w));

    if (hasCTA) score += 20;
    if (hasUrgency) score += 15;

    const currentCTA = this.extractCTA(story);
    const improvedCTAs = [
      "Support our mission today and help us reach our goal!",
      "Every donation brings us closer to making this dream a reality. Join us now!",
      "Be part of something special - contribute today and make a difference!",
      "Help us transform lives - your support matters. Donate now!",
      "Join our community of supporters and help us achieve this together!",
    ];

    return {
      score: Math.max(0, Math.min(100, score)),
      currentCTA,
      improvedCTAs,
    };
  }

  private extractCTA(story: string): string {
    const sentences = story.split(/[.!?]+/);
    const ctaKeywords = ['donate', 'contribute', 'support', 'help', 'join', 'back', 'pledge'];

    for (const sentence of sentences.reverse()) {
      const lower = sentence.toLowerCase();
      if (ctaKeywords.some(k => lower.includes(k))) {
        return sentence.trim();
      }
    }

    return "No clear call-to-action found";
  }

  private async analyzeSocialProof(campaign: any): Promise<any> {
    return {
      suggestions: [
        "Add testimonials from early supporters or beneficiaries",
        "Share endorsements from community leaders or experts",
        "Display backer count and social media follower numbers",
        "Include media coverage or press mentions if available",
        "Show photos/videos of people impacted by your cause",
        "Highlight credentials, experience, or track record",
      ],
    };
  }

  private async generateABTestingRecommendations(campaign: any): Promise<string[]> {
    return [
      "Test 2-3 different main images to see which drives more conversions",
      "Try different title variations emphasizing different emotions (hope vs urgency)",
      "Experiment with reward tier pricing ($49 vs $50, $99 vs $100)",
      "Test different story lengths (short vs detailed)",
      "Try different CTAs (emotional appeal vs logical reasoning)",
      "Test video vs image as main media",
      "Experiment with update frequency (2x vs 3x per week)",
    ];
  }
}

export const campaignOptimizerAgent = new CampaignOptimizerAgent();

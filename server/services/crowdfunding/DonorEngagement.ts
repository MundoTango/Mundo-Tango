import { db } from "@shared/db";
import { 
  fundingCampaigns,
  campaignDonations,
  users 
} from "@shared/schema";
import { eq, desc, and, gte, sql, count } from "drizzle-orm";
import { OpenAIService } from "../ai/OpenAIService";
import { AnthropicService } from "../ai/AnthropicService";

export interface DonorSegment {
  segmentName: string;
  donorCount: number;
  totalAmount: number;
  avgDonation: number;
  donors: Array<{
    userId: number;
    name: string;
    email: string;
    totalDonated: number;
    donationCount: number;
    lastDonation: Date;
  }>;
}

export interface DonorEngagementPlan {
  campaignId: number;
  segments: {
    whales: DonorSegment;
    recurring: DonorSegment;
    oneTime: DonorSegment;
    lapsed: DonorSegment;
  };
  thankYouMessages: {
    [key: string]: string;
  };
  milestoneMessages: {
    percent25: string;
    percent50: string;
    percent75: string;
    percent100: string;
  };
  updateSuggestions: string[];
  reEngagementCampaign: {
    subject: string;
    message: string;
    targetSegment: string;
  };
  viralSharingTemplates: {
    facebook: string;
    twitter: string;
    instagram: string;
    email: string;
  };
  retentionStrategies: string[];
}

export class DonorEngagementAgent {
  async analyzeAndEngageDonors(campaignId: number): Promise<DonorEngagementPlan> {
    const campaign = await db.query.fundingCampaigns.findFirst({
      where: eq(fundingCampaigns.id, campaignId),
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const [
      segments,
      thankYouMessages,
      milestoneMessages,
      updateSuggestions,
      reEngagementCampaign,
      viralTemplates,
      retentionStrategies
    ] = await Promise.all([
      this.segmentDonors(campaignId),
      this.generateThankYouMessages(campaign),
      this.generateMilestoneMessages(campaign),
      this.generateUpdateSuggestions(campaign),
      this.generateReEngagementCampaign(campaign),
      this.generateViralSharingTemplates(campaign),
      this.generateRetentionStrategies(campaign),
    ]);

    return {
      campaignId,
      segments,
      thankYouMessages,
      milestoneMessages,
      updateSuggestions,
      reEngagementCampaign,
      viralSharingTemplates: viralTemplates,
      retentionStrategies,
    };
  }

  private async segmentDonors(campaignId: number): Promise<any> {
    const donations = await db.query.campaignDonations.findMany({
      where: eq(campaignDonations.campaignId, campaignId),
      with: {
        donor: true,
      },
    });

    const donorMap = new Map<number, any>();
    donations.forEach(donation => {
      if (!donation.donorUserId) return;

      const existing = donorMap.get(donation.donorUserId);
      if (existing) {
        existing.totalDonated += donation.amount;
        existing.donationCount += 1;
        if (new Date(donation.donatedAt) > new Date(existing.lastDonation)) {
          existing.lastDonation = donation.donatedAt;
        }
      } else {
        donorMap.set(donation.donorUserId, {
          userId: donation.donorUserId,
          name: donation.donor?.name || 'Anonymous',
          email: donation.donor?.email || '',
          totalDonated: donation.amount,
          donationCount: 1,
          lastDonation: donation.donatedAt,
        });
      }
    });

    const donors = Array.from(donorMap.values());

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const whales = donors.filter(d => d.totalDonated >= 250);
    const recurring = donors.filter(d => d.donationCount >= 2 && d.totalDonated < 250);
    const oneTime = donors.filter(d => d.donationCount === 1 && new Date(d.lastDonation) >= thirtyDaysAgo);
    const lapsed = donors.filter(d => new Date(d.lastDonation) < thirtyDaysAgo);

    return {
      whales: this.formatSegment('High-Value Donors (Whales)', whales),
      recurring: this.formatSegment('Recurring Donors', recurring),
      oneTime: this.formatSegment('One-Time Donors', oneTime),
      lapsed: this.formatSegment('Lapsed Donors', lapsed),
    };
  }

  private formatSegment(name: string, donors: any[]): DonorSegment {
    const totalAmount = donors.reduce((sum, d) => sum + d.totalDonated, 0);
    const avgDonation = donors.length > 0 ? totalAmount / donors.length : 0;

    return {
      segmentName: name,
      donorCount: donors.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      avgDonation: Math.round(avgDonation * 100) / 100,
      donors,
    };
  }

  private async generateThankYouMessages(campaign: any): Promise<any> {
    try {
      const prompt = `Generate personalized thank-you messages for a crowdfunding campaign titled "${campaign.title}".

Create 5 different thank-you messages for different donation amounts:
1. Small donation ($1-$24)
2. Medium donation ($25-$99)
3. Large donation ($100-$249)
4. Major donation ($250-$499)
5. Mega donation ($500+)

Each message should:
- Be warm and genuine
- Mention the specific impact their donation will have
- Be 2-3 sentences
- Include a personal touch

Format:
SMALL: [message]
MEDIUM: [message]
LARGE: [message]
MAJOR: [message]
MEGA: [message]`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 500,
      });

      const messages = response.content.split('\n').reduce((acc: any, line) => {
        if (line.startsWith('SMALL:')) acc.small = line.replace('SMALL:', '').trim();
        if (line.startsWith('MEDIUM:')) acc.medium = line.replace('MEDIUM:', '').trim();
        if (line.startsWith('LARGE:')) acc.large = line.replace('LARGE:', '').trim();
        if (line.startsWith('MAJOR:')) acc.major = line.replace('MAJOR:', '').trim();
        if (line.startsWith('MEGA:')) acc.mega = line.replace('MEGA:', '').trim();
        return acc;
      }, {});

      return messages;
    } catch (error) {
      console.error('Error generating thank-you messages:', error);
      return {
        small: "Thank you so much for your support! Every dollar helps us get closer to our goal.",
        medium: "Your generous contribution means the world to us! You're helping make real change happen.",
        large: "Wow! Thank you for your incredible generosity. Your donation will have a significant impact on our mission.",
        major: "We're deeply grateful for your outstanding support. Your contribution will help transform lives!",
        mega: "Thank you for your extraordinary generosity! You're a true champion of our cause. We can't thank you enough!",
      };
    }
  }

  private async generateMilestoneMessages(campaign: any): Promise<any> {
    try {
      const prompt = `Generate 4 milestone celebration messages for a crowdfunding campaign titled "${campaign.title}" with a goal of $${campaign.goalAmount}.

Create messages for:
1. 25% funded
2. 50% funded
3. 75% funded
4. 100% funded (success!)

Each message should:
- Celebrate the achievement
- Thank supporters
- Build momentum for the next milestone
- Be enthusiastic and motivating
- Be 3-4 sentences

Format:
25%: [message]
50%: [message]
75%: [message]
100%: [message]`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 600,
      });

      const messages = response.content.split('\n').reduce((acc: any, line) => {
        if (line.startsWith('25%:')) acc.percent25 = line.replace('25%:', '').trim();
        if (line.startsWith('50%:')) acc.percent50 = line.replace('50%:', '').trim();
        if (line.startsWith('75%:')) acc.percent75 = line.replace('75%:', '').trim();
        if (line.startsWith('100%:')) acc.percent100 = line.replace('100%:', '').trim();
        return acc;
      }, {});

      return messages;
    } catch (error) {
      console.error('Error generating milestone messages:', error);
      return {
        percent25: "🎉 Amazing news! We've reached 25% of our goal! Thank you to every single supporter who believed in us. Let's keep this momentum going!",
        percent50: "🚀 Halfway there! We've hit 50% funding! Your support is incredible. We're so close to making this dream a reality. Share with your friends!",
        percent75: "💪 We're at 75%! This is incredible! We can see the finish line. With your continued support, we'll reach our goal. Let's do this together!",
        percent100: "🎊 WE DID IT! 100% FUNDED! Thank you to our amazing community of supporters. You've made this dream come true. We couldn't have done it without you!",
      };
    }
  }

  private async generateUpdateSuggestions(campaign: any): Promise<string[]> {
    return [
      "Share a behind-the-scenes photo or video of your progress",
      "Thank donors by name (with permission) and celebrate their impact",
      "Post a milestone celebration update (25%, 50%, 75%, 100% funded)",
      "Share a personal story from someone who will benefit from the campaign",
      "Provide a detailed progress report on how funds are being used",
      "Highlight a specific donor story or testimonial",
      "Share upcoming plans and next steps",
      "Post a Q&A answering common donor questions",
      "Share media coverage or press mentions",
      "Create urgency with countdown to campaign end date",
    ];
  }

  private async generateReEngagementCampaign(campaign: any): Promise<any> {
    try {
      const prompt = `Create a re-engagement email campaign for lapsed donors of "${campaign.title}".

The email should:
- Remind them of their previous support
- Update them on campaign progress
- Create urgency to donate again
- Be warm and personal
- Include a clear call-to-action

Generate:
1. Subject line (compelling, under 60 characters)
2. Email body (3-4 paragraphs, warm and engaging)

Format:
SUBJECT: [subject line]
BODY: [email body]`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 500,
      });

      const lines = response.content.split('\n');
      const subject = lines.find(l => l.startsWith('SUBJECT:'))?.replace('SUBJECT:', '').trim() || 
                     "We miss you! Help us reach our goal";
      const body = lines
        .slice(lines.findIndex(l => l.startsWith('BODY:')) + 1)
        .join('\n')
        .trim() || 
        "We wanted to reach out and thank you again for your previous support. We're making great progress, but we need your help to cross the finish line. Would you consider supporting us again?";

      return {
        subject,
        message: body,
        targetSegment: 'Lapsed Donors (inactive 30+ days)',
      };
    } catch (error) {
      console.error('Error generating re-engagement campaign:', error);
      return {
        subject: "We miss you! Help us reach our goal",
        message: "Thank you for your previous support of our campaign. We're making incredible progress and are so close to our goal. Would you consider supporting us again to help us finish strong?",
        targetSegment: 'Lapsed Donors',
      };
    }
  }

  private async generateViralSharingTemplates(campaign: any): Promise<any> {
    try {
      const prompt = `Create viral social sharing templates for "${campaign.title}".

Generate short, shareable posts for:
1. Facebook (2-3 sentences, engaging)
2. Twitter (under 280 characters, include hashtags)
3. Instagram (caption with emojis and hashtags)
4. Email (subject + 2 sentence body for forwarding)

Format:
FACEBOOK: [post]
TWITTER: [tweet]
INSTAGRAM: [caption]
EMAIL_SUBJECT: [subject]
EMAIL_BODY: [body]`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.9,
        maxTokens: 600,
      });

      const templates = response.content.split('\n').reduce((acc: any, line) => {
        if (line.startsWith('FACEBOOK:')) acc.facebook = line.replace('FACEBOOK:', '').trim();
        if (line.startsWith('TWITTER:')) acc.twitter = line.replace('TWITTER:', '').trim();
        if (line.startsWith('INSTAGRAM:')) acc.instagram = line.replace('INSTAGRAM:', '').trim();
        if (line.startsWith('EMAIL_SUBJECT:')) {
          acc.email = line.replace('EMAIL_SUBJECT:', '').trim();
        }
        if (line.startsWith('EMAIL_BODY:')) {
          acc.email += '\n\n' + line.replace('EMAIL_BODY:', '').trim();
        }
        return acc;
      }, {});

      return templates;
    } catch (error) {
      console.error('Error generating viral templates:', error);
      return {
        facebook: `I just supported "${campaign.title}" and you can too! Every contribution makes a difference. Join me in making this happen! [LINK]`,
        twitter: `Just backed "${campaign.title}"! Join me in supporting this amazing cause 🙌 #crowdfunding #community [LINK]`,
        instagram: `✨ Supporting an amazing cause: ${campaign.title}! 💙 Every donation counts. Link in bio to contribute! #crowdfunding #makeadifference #community`,
        email: `Subject: Help support ${campaign.title}\n\nI just contributed to an amazing campaign and thought you'd want to know about it too. Check it out and consider supporting if you can!`,
      };
    }
  }

  private async generateRetentionStrategies(campaign: any): Promise<string[]> {
    return [
      "Send personalized thank-you emails within 24 hours of donation",
      "Create a private Facebook group or Discord for donors to build community",
      "Offer exclusive updates or behind-the-scenes content for donors",
      "Recognize top donors publicly (with permission) on social media",
      "Send monthly progress reports even after campaign ends",
      "Invite donors to participate in decision-making or feedback",
      "Create a 'backer wall' showcasing all supporters",
      "Send handwritten thank-you notes to major donors",
      "Offer early access to future campaigns or projects",
      "Host a virtual thank-you event or webinar for donors",
    ];
  }

  async generatePersonalizedThankYou(
    campaignId: number,
    donorName: string,
    amount: number
  ): Promise<string> {
    const campaign = await db.query.fundingCampaigns.findFirst({
      where: eq(fundingCampaigns.id, campaignId),
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const tier = amount >= 500 ? 'mega' :
                 amount >= 250 ? 'major' :
                 amount >= 100 ? 'large' :
                 amount >= 25 ? 'medium' : 'small';

    try {
      const prompt = `Write a warm, personalized thank-you message for ${donorName} who just donated $${amount} to "${campaign.title}".

The message should:
- Address them by name
- Mention their specific donation amount
- Explain the impact their donation will have
- Be genuine and heartfelt
- Be 2-3 sentences
- ${tier === 'mega' || tier === 'major' ? 'Emphasize their extraordinary generosity' : 'Show sincere gratitude'}

Write only the thank-you message, no subject line.`;

      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.9,
        maxTokens: 150,
      });

      return response.content.trim();
    } catch (error) {
      console.error('Error generating personalized thank-you:', error);
      return `Dear ${donorName}, thank you so much for your generous donation of $${amount}! Your support means the world to us and will help us achieve our goal. We're deeply grateful!`;
    }
  }
}

export const donorEngagementAgent = new DonorEngagementAgent();

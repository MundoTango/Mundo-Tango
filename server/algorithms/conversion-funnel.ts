/**
 * A25: CONVERSION FUNNEL ANALYSIS ALGORITHM
 * Analyzes user journey through conversion funnels
 */

interface FunnelStep {
  name: string;
  users: number;
  conversions: number;
  dropoff: number;
}

interface FunnelAnalysis {
  steps: FunnelStep[];
  overallConversion: number;
  bottlenecks: string[];
  recommendations: string[];
}

export class ConversionFunnelAlgorithm {
  async analyzeFunnel(funnelData: any[]): Promise<FunnelAnalysis> {
    const steps = this.calculateSteps(funnelData);
    const overall = this.calculateOverallConversion(steps);
    const bottlenecks = this.identifyBottlenecks(steps);
    const recommendations = this.generateRecommendations(bottlenecks, steps);

    return {
      steps,
      overallConversion: overall,
      bottlenecks,
      recommendations,
    };
  }

  private calculateSteps(data: any[]): FunnelStep[] {
    const stepNames = ['visit', 'signup', 'profile_complete', 'first_post', 'engaged_user'];
    
    return stepNames.map((name, i) => {
      const users = data.filter(d => d.step >= i).length;
      const conversions = i < stepNames.length - 1 
        ? data.filter(d => d.step > i).length 
        : users;
      const dropoff = users - conversions;

      return {
        name,
        users,
        conversions,
        dropoff: users > 0 ? (dropoff / users) * 100 : 0,
      };
    });
  }

  private calculateOverallConversion(steps: FunnelStep[]): number {
    if (steps.length === 0 || steps[0].users === 0) return 0;
    const lastStep = steps[steps.length - 1];
    return (lastStep.users / steps[0].users) * 100;
  }

  private identifyBottlenecks(steps: FunnelStep[]): string[] {
    return steps
      .filter(step => step.dropoff > 30)
      .map(step => `${step.name}: ${step.dropoff.toFixed(1)}% dropoff`);
  }

  private generateRecommendations(bottlenecks: string[], steps: FunnelStep[]): string[] {
    const recs: string[] = [];

    bottlenecks.forEach(bottleneck => {
      if (bottleneck.includes('signup')) {
        recs.push("Simplify signup process or add social login");
      }
      if (bottleneck.includes('profile_complete')) {
        recs.push("Add guided onboarding tour");
      }
      if (bottleneck.includes('first_post')) {
        recs.push("Prompt users to create first post with templates");
      }
    });

    return recs;
  }
}

export const conversionFunnel = new ConversionFunnelAlgorithm();

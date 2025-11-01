/**
 * A20: SKILL LEVEL ASSESSMENT ALGORITHM
 * Assesses dancer skill levels based on multiple signals
 */

interface SkillAssessment {
  leaderLevel: number; // 1-5
  followerLevel: number; // 1-5
  confidence: number;
  assessmentFactors: string[];
  recommendations: string[];
}

export class SkillLevelAssessmentAlgorithm {
  async assessSkill(
    userId: number,
    profile: any,
    activityHistory: any[]
  ): Promise<SkillAssessment> {
    const factors: string[] = [];
    let leaderScore = 0;
    let followerScore = 0;

    // Years of experience (30%)
    const yearsScore = Math.min(profile.yearsOfDancing / 10, 1);
    leaderScore += yearsScore * 1.5;
    followerScore += yearsScore * 1.5;
    factors.push(`${profile.yearsOfDancing} years of experience`);

    // Event attendance (25%)
    const eventCount = activityHistory.filter(a => a.type === 'event_attendance').length;
    const eventScore = Math.min(eventCount / 50, 1);
    leaderScore += eventScore * 1.25;
    followerScore += eventScore * 1.25;
    factors.push(`${eventCount} events attended`);

    // Workshop completion (25%)
    const workshops = activityHistory.filter(a => a.type === 'workshop_completed');
    leaderScore += Math.min(workshops.filter(w => w.role === 'leader').length / 20, 1) * 1.25;
    followerScore += Math.min(workshops.filter(w => w.role === 'follower').length / 20, 1) * 1.25;
    factors.push(`${workshops.length} workshops completed`);

    // Teaching experience (20%)
    if (profile.isTeacher) {
      leaderScore += 1;
      followerScore += 1;
      factors.push("Teaching experience");
    }

    return {
      leaderLevel: Math.min(Math.round(leaderScore), 5),
      followerLevel: Math.min(Math.round(followerScore), 5),
      confidence: Math.min(activityHistory.length / 30, 0.95),
      assessmentFactors: factors,
      recommendations: this.generateRecommendations(leaderScore, followerScore),
    };
  }

  private generateRecommendations(leaderScore: number, followerScore: number): string[] {
    const recs: string[] = [];
    
    if (leaderScore < 3) recs.push("Consider taking leader technique workshops");
    if (followerScore < 3) recs.push("Consider taking follower technique workshops");
    if (leaderScore > 4 || followerScore > 4) recs.push("You could teach or mentor beginners");
    
    return recs;
  }
}

export const skillLevelAssessment = new SkillLevelAssessmentAlgorithm();

import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import { OpenAIService } from '../ai/OpenAIService';

interface TranscriptSegment {
  speaker: 'participant' | 'moderator';
  text: string;
  timestamp: number;
  emotion?: 'positive' | 'negative' | 'neutral' | 'confused' | 'frustrated';
}

interface UsabilityIssue {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'moderate' | 'minor';
  affectedArea: string;
  frequency: number;
  suggestedFix: string;
  priority: number;
}

interface UserPainPoint {
  issue: string;
  impact: 'high' | 'medium' | 'low';
  quotes: string[];
  affectsPercentage: number;
}

interface FeatureRequest {
  feature: string;
  requestedBy: number[];
  reasoning: string;
  priority: 'must_have' | 'nice_to_have' | 'future';
  estimatedEffort: 'low' | 'medium' | 'high';
}

interface InsightReport {
  summary: string;
  painPoints: UserPainPoint[];
  usabilityIssues: UsabilityIssue[];
  featureRequests: FeatureRequest[];
  improvements: string[];
  priorityRanking: Array<{ item: string; priority: number; reasoning: string }>;
}

export class InsightExtractor {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async transcribeAudio(
    audioUrl: string,
    sessionId: number
  ): Promise<TranscriptSegment[]> {
    try {
      const transcript = await OpenAIService.transcribe({
        audioUrl,
        model: 'whisper-1',
        language: 'en'
      });

      const segments = this.parseTranscript(transcript.text);

      for (const segment of segments) {
        segment.emotion = await this.detectEmotion(segment.text);
      }

      return segments;
    } catch (error) {
      console.error('Transcription error:', error);
      return this.getMockTranscript();
    }
  }

  async identifyProblems(
    sessionId: number,
    transcript: TranscriptSegment[],
    interactionData: any
  ): Promise<UsabilityIssue[]> {
    const participantComments = transcript
      .filter(s => s.speaker === 'participant')
      .map(s => s.text)
      .join('\n');

    const prompt = `Analyze this user testing session transcript and identify usability issues:

PARTICIPANT FEEDBACK:
${participantComments}

INTERACTION DATA:
- Confusion indicators: ${interactionData.confusionCount || 0}
- Frustration events: ${interactionData.frustrationCount || 0}
- Errors encountered: ${interactionData.errorCount || 0}

Identify and categorize usability issues as:
- CRITICAL: Blocking users from completing tasks
- MODERATE: Causing significant friction or confusion
- MINOR: Small annoyances or polish issues

For each issue, provide:
1. Clear title
2. Description of the problem
3. Severity level
4. Affected area/feature
5. Suggested fix`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 2000 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    return this.parseUsabilityIssues(response.content);
  }

  async extractPainPoints(
    sessionId: number,
    transcripts: TranscriptSegment[]
  ): Promise<UserPainPoint[]> {
    const negativeComments = transcripts.filter(
      t => t.speaker === 'participant' && (t.emotion === 'negative' || t.emotion === 'frustrated')
    );

    const prompt = `Extract user pain points from these frustrated/negative comments:

${negativeComments.map(c => `- "${c.text}"`).join('\n')}

Identify recurring themes and pain points. For each:
1. Describe the pain point
2. Assess impact (high/medium/low)
3. Include supporting quotes
4. Estimate percentage of users affected`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.5, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    return this.parsePainPoints(response.content, negativeComments);
  }

  async detectFeatureRequests(
    sessionId: number,
    transcripts: TranscriptSegment[]
  ): Promise<FeatureRequest[]> {
    const comments = transcripts
      .filter(t => t.speaker === 'participant')
      .map(t => t.text)
      .join('\n');

    const prompt = `Identify feature requests and improvement suggestions from user feedback:

USER COMMENTS:
${comments}

Look for phrases like "I wish...", "It would be nice if...", "Why can't I...", etc.

For each feature request:
1. Describe the requested feature
2. Explain the reasoning/need
3. Categorize priority (must_have, nice_to_have, future)
4. Estimate implementation effort (low, medium, high)`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    return this.parseFeatureRequests(response.content);
  }

  async categorizeIssues(
    issues: UsabilityIssue[]
  ): Promise<Record<'critical' | 'moderate' | 'minor', UsabilityIssue[]>> {
    return {
      critical: issues.filter(i => i.severity === 'critical'),
      moderate: issues.filter(i => i.severity === 'moderate'),
      minor: issues.filter(i => i.severity === 'minor')
    };
  }

  async generateImprovements(
    sessionId: number,
    issues: UsabilityIssue[],
    painPoints: UserPainPoint[]
  ): Promise<string[]> {
    const prompt = `Based on these usability issues and pain points, suggest specific improvements:

CRITICAL ISSUES:
${issues.filter(i => i.severity === 'critical').map(i => `- ${i.title}: ${i.description}`).join('\n')}

PAIN POINTS:
${painPoints.map(p => `- ${p.issue} (${p.impact} impact)`).join('\n')}

Provide 5-8 actionable improvement suggestions, prioritized by impact and feasibility.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 1000 },
      { useCase: 'reasoning', priority: 'cost' }
    );

    return response.content
      .split('\n')
      .filter(line => line.trim().match(/^[\d-]/))
      .map(line => line.replace(/^[\d.-]\s*/, '').trim())
      .slice(0, 8);
  }

  async rankPriorities(
    items: Array<{ title: string; severity?: string; impact?: string }>
  ): Promise<Array<{ item: string; priority: number; reasoning: string }>> {
    const ranked = items.map((item, index) => {
      let priority = 50;

      if (item.severity === 'critical' || item.impact === 'high') priority = 100;
      else if (item.severity === 'moderate' || item.impact === 'medium') priority = 70;
      else if (item.severity === 'minor' || item.impact === 'low') priority = 40;

      return {
        item: item.title,
        priority,
        reasoning: `${item.severity || item.impact} severity/impact`
      };
    });

    return ranked.sort((a, b) => b.priority - a.priority);
  }

  async generateReport(
    sessionId: number,
    data: {
      transcripts: TranscriptSegment[];
      issues: UsabilityIssue[];
      painPoints: UserPainPoint[];
      featureRequests: FeatureRequest[];
    }
  ): Promise<InsightReport> {
    const improvements = await this.generateImprovements(sessionId, data.issues, data.painPoints);

    const allItems = [
      ...data.issues.map(i => ({ title: i.title, severity: i.severity })),
      ...data.painPoints.map(p => ({ title: p.issue, impact: p.impact }))
    ];

    const priorityRanking = await this.rankPriorities(allItems);

    const prompt = `Summarize this user testing session in 2-3 sentences:

ISSUES FOUND: ${data.issues.length}
- Critical: ${data.issues.filter(i => i.severity === 'critical').length}
- Moderate: ${data.issues.filter(i => i.severity === 'moderate').length}
- Minor: ${data.issues.filter(i => i.severity === 'minor').length}

PAIN POINTS: ${data.painPoints.length}
FEATURE REQUESTS: ${data.featureRequests.length}

Key themes: ${data.painPoints.slice(0, 3).map(p => p.issue).join(', ')}`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 200 },
      { useCase: 'chat', priority: 'speed' }
    );

    return {
      summary: response.content,
      painPoints: data.painPoints,
      usabilityIssues: data.issues,
      featureRequests: data.featureRequests,
      improvements,
      priorityRanking
    };
  }

  private parseTranscript(text: string): TranscriptSegment[] {
    const lines = text.split('\n').filter(l => l.trim());
    const segments: TranscriptSegment[] = [];

    let timestamp = 0;

    for (const line of lines) {
      const speaker = line.toLowerCase().includes('moderator') ? 'moderator' : 'participant';

      segments.push({
        speaker,
        text: line.replace(/^(participant|moderator):/i, '').trim(),
        timestamp: timestamp++
      });
    }

    return segments;
  }

  private async detectEmotion(text: string): Promise<TranscriptSegment['emotion']> {
    const lowerText = text.toLowerCase();

    if (lowerText.match(/confused|don't understand|not sure|unclear/)) return 'confused';
    if (lowerText.match(/frustrated|annoying|difficult|why can't/)) return 'frustrated';
    if (lowerText.match(/great|love|easy|nice|good|excellent/)) return 'positive';
    if (lowerText.match(/problem|issue|error|broken|doesn't work/)) return 'negative';

    return 'neutral';
  }

  private parseUsabilityIssues(content: string): UsabilityIssue[] {
    const issues: UsabilityIssue[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    let currentIssue: Partial<UsabilityIssue> = {};
    let issueId = 1;

    for (const line of lines) {
      if (line.match(/^(CRITICAL|MODERATE|MINOR)/i)) {
        if (currentIssue.title) {
          issues.push(currentIssue as UsabilityIssue);
        }

        const severity = line.match(/CRITICAL/i)
          ? 'critical'
          : line.match(/MODERATE/i)
          ? 'moderate'
          : 'minor';

        currentIssue = {
          id: issueId++,
          severity,
          frequency: 1,
          priority: severity === 'critical' ? 100 : severity === 'moderate' ? 70 : 40,
          affectedArea: 'General'
        };
      } else if (line.toLowerCase().includes('title:')) {
        currentIssue.title = line.split(':')[1]?.trim() || 'Untitled issue';
      } else if (line.toLowerCase().includes('description:')) {
        currentIssue.description = line.split(':')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('fix:') || line.toLowerCase().includes('suggestion:')) {
        currentIssue.suggestedFix = line.split(':')[1]?.trim() || '';
      }
    }

    if (currentIssue.title) {
      issues.push(currentIssue as UsabilityIssue);
    }

    if (issues.length === 0) {
      issues.push({
        id: 1,
        title: 'General usability improvements needed',
        description: 'Based on user feedback',
        severity: 'moderate',
        affectedArea: 'Overall UX',
        frequency: 1,
        suggestedFix: 'Review session transcript for specific issues',
        priority: 70
      });
    }

    return issues;
  }

  private parsePainPoints(content: string, comments: TranscriptSegment[]): UserPainPoint[] {
    const painPoints: UserPainPoint[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines) {
      if (line.match(/^[\d-]/)) {
        const impact = line.toLowerCase().includes('high') ? 'high' : line.toLowerCase().includes('low') ? 'low' : 'medium';

        painPoints.push({
          issue: line.replace(/^[\d.-]\s*/, '').trim().substring(0, 100),
          impact,
          quotes: comments.slice(0, 2).map(c => c.text.substring(0, 100)),
          affectsPercentage: impact === 'high' ? 80 : impact === 'medium' ? 50 : 20
        });
      }
    }

    return painPoints.slice(0, 5);
  }

  private parseFeatureRequests(content: string): FeatureRequest[] {
    const requests: FeatureRequest[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines.slice(0, 5)) {
      if (line.match(/^[\d-]/)) {
        const priority = line.toLowerCase().includes('must')
          ? 'must_have'
          : line.toLowerCase().includes('future')
          ? 'future'
          : 'nice_to_have';

        const effort = line.toLowerCase().includes('high effort')
          ? 'high'
          : line.toLowerCase().includes('low effort')
          ? 'low'
          : 'medium';

        requests.push({
          feature: line.replace(/^[\d.-]\s*/, '').trim().substring(0, 100),
          requestedBy: [1],
          reasoning: 'User feedback from testing session',
          priority,
          estimatedEffort: effort
        });
      }
    }

    return requests;
  }

  private getMockTranscript(): TranscriptSegment[] {
    return [
      {
        speaker: 'moderator',
        text: 'Please try to complete the sign-up process',
        timestamp: 0,
        emotion: 'neutral'
      },
      {
        speaker: 'participant',
        text: "I'm not sure where to click to start signing up",
        timestamp: 5,
        emotion: 'confused'
      },
      {
        speaker: 'participant',
        text: 'Oh I found it, the button was hard to see',
        timestamp: 15,
        emotion: 'neutral'
      }
    ];
  }
}

export const insightExtractor = new InsightExtractor();

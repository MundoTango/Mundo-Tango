import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
  type: 'move' | 'click' | 'scroll';
}

interface ClickPattern {
  element: string;
  clickCount: number;
  avgTimeBetweenClicks: number;
  location: { x: number; y: number };
}

interface ScrollBehavior {
  totalScrollDistance: number;
  scrollSpeed: number;
  rapidScrolls: number;
  backScrolls: number;
}

interface HeatmapData {
  clicks: Array<{ x: number; y: number; intensity: number }>;
  hovers: Array<{ x: number; y: number; duration: number }>;
  scrollDepth: number[];
}

interface InteractionAnalysis {
  heatmap: HeatmapData;
  clickPatterns: ClickPattern[];
  scrollBehavior: ScrollBehavior;
  timeOnTask: number;
  confusionIndicators: string[];
  frustrationScore: number;
  successPaths: string[];
  failurePaths: string[];
}

export class InteractionAnalyzer {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async analyzeMouseMovements(
    sessionId: number,
    mouseEvents: MouseEvent[]
  ): Promise<HeatmapData> {
    const clicks = mouseEvents
      .filter(e => e.type === 'click')
      .reduce((acc, event) => {
        const existing = acc.find(c => Math.abs(c.x - event.x) < 20 && Math.abs(c.y - event.y) < 20);
        if (existing) {
          existing.intensity++;
        } else {
          acc.push({ x: event.x, y: event.y, intensity: 1 });
        }
        return acc;
      }, [] as Array<{ x: number; y: number; intensity: number }>);

    const moves = mouseEvents.filter(e => e.type === 'move');
    const hovers: Array<{ x: number; y: number; duration: number }> = [];
    let lastPos = moves[0];
    let hoverStart = moves[0]?.timestamp || 0;

    for (let i = 1; i < moves.length; i++) {
      const current = moves[i];
      const distance = Math.sqrt(
        Math.pow(current.x - lastPos.x, 2) + Math.pow(current.y - lastPos.y, 2)
      );

      if (distance < 10 && current.timestamp - lastPos.timestamp > 1000) {
        hovers.push({
          x: current.x,
          y: current.y,
          duration: current.timestamp - hoverStart
        });
      } else if (distance >= 10) {
        hoverStart = current.timestamp;
      }

      lastPos = current;
    }

    const scrollEvents = mouseEvents.filter(e => e.type === 'scroll');
    const scrollDepth = scrollEvents.map(e => e.y);

    return { clicks, hovers, scrollDepth };
  }

  async analyzeClickPatterns(
    sessionId: number,
    clickEvents: Array<{ element: string; timestamp: number; x: number; y: number }>
  ): Promise<ClickPattern[]> {
    const elementClicks = clickEvents.reduce((acc, click) => {
      if (!acc[click.element]) {
        acc[click.element] = [];
      }
      acc[click.element].push(click);
      return acc;
    }, {} as Record<string, Array<{ element: string; timestamp: number; x: number; y: number }>>);

    const patterns: ClickPattern[] = [];

    for (const [element, clicks] of Object.entries(elementClicks)) {
      if (clicks.length === 0) continue;

      const timestamps = clicks.map(c => c.timestamp).sort((a, b) => a - b);
      let totalTimeBetween = 0;

      for (let i = 1; i < timestamps.length; i++) {
        totalTimeBetween += timestamps[i] - timestamps[i - 1];
      }

      const avgTimeBetween = timestamps.length > 1 ? totalTimeBetween / (timestamps.length - 1) : 0;

      const avgX = clicks.reduce((sum, c) => sum + c.x, 0) / clicks.length;
      const avgY = clicks.reduce((sum, c) => sum + c.y, 0) / clicks.length;

      patterns.push({
        element,
        clickCount: clicks.length,
        avgTimeBetweenClicks: avgTimeBetween,
        location: { x: avgX, y: avgY }
      });
    }

    return patterns.sort((a, b) => b.clickCount - a.clickCount);
  }

  async trackScrollBehavior(
    sessionId: number,
    scrollEvents: Array<{ position: number; timestamp: number; direction: 'up' | 'down' }>
  ): Promise<ScrollBehavior> {
    const totalDistance = scrollEvents.reduce((sum, event, i) => {
      if (i === 0) return 0;
      return sum + Math.abs(event.position - scrollEvents[i - 1].position);
    }, 0);

    const duration = scrollEvents.length > 0
      ? scrollEvents[scrollEvents.length - 1].timestamp - scrollEvents[0].timestamp
      : 1;

    const scrollSpeed = totalDistance / (duration / 1000);

    const rapidScrolls = scrollEvents.filter((event, i) => {
      if (i === 0) return false;
      const timeDiff = event.timestamp - scrollEvents[i - 1].timestamp;
      const distance = Math.abs(event.position - scrollEvents[i - 1].position);
      return timeDiff < 100 && distance > 200;
    }).length;

    const backScrolls = scrollEvents.filter(event => event.direction === 'up').length;

    return {
      totalScrollDistance: totalDistance,
      scrollSpeed,
      rapidScrolls,
      backScrolls
    };
  }

  async measureTimeOnTask(
    sessionId: number,
    taskId: number,
    events: Array<{ timestamp: number; taskCompleted?: boolean }>
  ): Promise<number> {
    if (events.length === 0) return 0;

    const startTime = events[0].timestamp;
    const completionEvent = events.find(e => e.taskCompleted);
    const endTime = completionEvent?.timestamp || events[events.length - 1].timestamp;

    return (endTime - startTime) / 1000;
  }

  async detectConfusion(
    sessionId: number,
    interactions: {
      backButtonClicks: number;
      rapidClicks: number;
      longPauses: number;
      errorMessages: number;
      repeatedActions: number;
    }
  ): Promise<string[]> {
    const indicators: string[] = [];

    if (interactions.backButtonClicks >= 3) {
      indicators.push(`Frequent back button usage (${interactions.backButtonClicks} times)`);
    }

    if (interactions.rapidClicks >= 5) {
      indicators.push(`Rapid clicking detected (${interactions.rapidClicks} rapid clicks)`);
    }

    if (interactions.longPauses >= 3) {
      indicators.push(`Multiple long pauses (${interactions.longPauses} pauses > 30s)`);
    }

    if (interactions.errorMessages >= 2) {
      indicators.push(`Error messages encountered (${interactions.errorMessages} errors)`);
    }

    if (interactions.repeatedActions >= 4) {
      indicators.push(`Repeated similar actions (${interactions.repeatedActions} repetitions)`);
    }

    return indicators;
  }

  async detectFrustration(
    sessionId: number,
    behaviors: {
      rapidClicksOnSameElement: number;
      cursorShaking: number;
      abandonedActions: number;
      verbalFrustration: boolean;
    }
  ): Promise<{ score: number; level: 'low' | 'medium' | 'high'; indicators: string[] }> {
    let score = 0;
    const indicators: string[] = [];

    if (behaviors.rapidClicksOnSameElement >= 3) {
      score += 25;
      indicators.push('Rapid clicking on unresponsive element');
    }

    if (behaviors.cursorShaking >= 2) {
      score += 20;
      indicators.push('Erratic cursor movements');
    }

    if (behaviors.abandonedActions >= 2) {
      score += 30;
      indicators.push('Multiple abandoned attempts');
    }

    if (behaviors.verbalFrustration) {
      score += 25;
      indicators.push('Expressed verbal frustration');
    }

    const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

    return { score, level, indicators };
  }

  async identifySuccessPaths(
    sessionId: number,
    completedTasks: Array<{
      taskId: number;
      steps: string[];
      completionTime: number;
      successful: boolean;
    }>
  ): Promise<string[]> {
    const successfulTasks = completedTasks.filter(t => t.successful);

    if (successfulTasks.length === 0) return [];

    const paths: string[] = [];

    for (const task of successfulTasks) {
      const path = task.steps.join(' → ');
      paths.push(`Task ${task.taskId}: ${path} (${task.completionTime}s)`);
    }

    return paths;
  }

  async generateReport(
    sessionId: number,
    analysis: Partial<InteractionAnalysis>
  ): Promise<string> {
    const prompt = `Generate a concise UX analysis report based on these user interaction metrics:

HEATMAP DATA:
- Click hotspots: ${analysis.heatmap?.clicks.length || 0} locations
- Hover areas: ${analysis.heatmap?.hovers.length || 0} regions

CLICK PATTERNS:
${analysis.clickPatterns?.slice(0, 3).map(p => `- ${p.element}: ${p.clickCount} clicks`).join('\n') || 'None'}

SCROLL BEHAVIOR:
- Total distance: ${analysis.scrollBehavior?.totalScrollDistance || 0}px
- Back scrolls: ${analysis.scrollBehavior?.backScrolls || 0}

CONFUSION INDICATORS:
${analysis.confusionIndicators?.join('\n- ') || 'None detected'}

FRUSTRATION SCORE: ${analysis.frustrationScore || 0}/100

Summarize key findings and actionable UX improvements in 3-5 bullet points.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.6, maxTokens: 500 },
      { useCase: 'reasoning', priority: 'cost' }
    );

    return response.content;
  }
}

export const interactionAnalyzer = new InteractionAnalyzer();

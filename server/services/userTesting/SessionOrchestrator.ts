import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface TestSession {
  id: number;
  projectId: number;
  testType: 'usability' | 'exploratory' | 'task_based' | 'a_b_test';
  duration: number;
  participants: number;
  tasks: TestTask[];
  scheduledAt: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface TestTask {
  id: number;
  title: string;
  description: string;
  expectedDuration: number;
  successCriteria: string[];
  priority: 'low' | 'medium' | 'high';
}

interface ParticipantMatch {
  userId: number;
  name: string;
  experience: string;
  availability: string[];
  matchScore: number;
  skills: string[];
}

interface SessionPlan {
  sessionId: number;
  duration: number;
  tasks: TestTask[];
  schedule: Array<{ task: TestTask; startTime: string; endTime: string }>;
  participants: ParticipantMatch[];
  recordingSetup: {
    screenRecording: boolean;
    audioRecording: boolean;
    webcamRecording: boolean;
    platform: string;
  };
  guidance: string[];
}

export class SessionOrchestrator {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async scheduleSession(
    projectId: number,
    requirements: {
      testType: 'usability' | 'exploratory' | 'task_based' | 'a_b_test';
      duration: number;
      participantCount: number;
      targetAudience?: string;
      objectives: string[];
    }
  ): Promise<SessionPlan> {
    const prompt = `You are a UX research expert. Design an optimal user testing session plan:

PROJECT: ${projectId}
TEST TYPE: ${requirements.testType}
DURATION: ${requirements.duration} minutes
PARTICIPANTS: ${requirements.participantCount}
TARGET AUDIENCE: ${requirements.targetAudience || 'General users'}
OBJECTIVES:
${requirements.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Create a detailed session plan including:
1. Optimal test tasks (3-5 tasks)
2. Time allocation for each task
3. Success criteria for each task
4. Participant profile requirements
5. Recording setup recommendations
6. Real-time guidance suggestions for moderators`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'quality' }
    );

    const tasks = this.generateTestTasks(requirements);
    const schedule = this.createSchedule(tasks, requirements.duration);
    const participants = await this.matchParticipants(requirements);

    return {
      sessionId: Math.floor(Math.random() * 10000),
      duration: requirements.duration,
      tasks,
      schedule,
      participants,
      recordingSetup: {
        screenRecording: true,
        audioRecording: true,
        webcamRecording: requirements.testType === 'usability',
        platform: 'Daily.co'
      },
      guidance: this.extractGuidance(response.content)
    };
  }

  async matchParticipants(
    requirements: {
      participantCount: number;
      targetAudience?: string;
      experience?: string;
    }
  ): Promise<ParticipantMatch[]> {
    const mockParticipants: ParticipantMatch[] = [
      {
        userId: 1,
        name: 'Alex Johnson',
        experience: 'intermediate',
        availability: ['Monday 2-4PM', 'Wednesday 10AM-12PM'],
        matchScore: 95,
        skills: ['web navigation', 'mobile apps', 'video calls']
      },
      {
        userId: 2,
        name: 'Maria Garcia',
        experience: 'beginner',
        availability: ['Tuesday 1-3PM', 'Thursday 3-5PM'],
        matchScore: 88,
        skills: ['basic computer use', 'social media']
      },
      {
        userId: 3,
        name: 'David Chen',
        experience: 'advanced',
        availability: ['Friday 9-11AM', 'Saturday 2-4PM'],
        matchScore: 92,
        skills: ['tech-savvy', 'software testing', 'UI feedback']
      }
    ];

    return mockParticipants
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, requirements.participantCount);
  }

  async optimizeDuration(
    tasks: TestTask[]
  ): Promise<{ optimal: number; breakdown: Record<string, number> }> {
    const taskDurations = tasks.reduce((acc, task) => {
      acc[task.title] = task.expectedDuration;
      return acc;
    }, {} as Record<string, number>);

    const totalTaskTime = tasks.reduce((sum, task) => sum + task.expectedDuration, 0);
    const bufferTime = Math.ceil(totalTaskTime * 0.2);
    const introOutroTime = 10;

    const optimal = totalTaskTime + bufferTime + introOutroTime;

    return {
      optimal,
      breakdown: {
        ...taskDurations,
        'Buffer time': bufferTime,
        'Intro/Outro': introOutroTime
      }
    };
  }

  async monitorRecordingQuality(
    sessionId: number,
    metrics: {
      videoQuality: number;
      audioLevel: number;
      connectionStability: number;
    }
  ): Promise<{
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
  }> {
    const avgQuality =
      (metrics.videoQuality + metrics.audioLevel + metrics.connectionStability) / 3;

    const status =
      avgQuality >= 90
        ? 'excellent'
        : avgQuality >= 75
        ? 'good'
        : avgQuality >= 60
        ? 'fair'
        : 'poor';

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (metrics.videoQuality < 70) {
      issues.push('Low video quality detected');
      recommendations.push('Ask participant to reduce video resolution or close other applications');
    }

    if (metrics.audioLevel < 60) {
      issues.push('Low audio level');
      recommendations.push('Check microphone settings or ask participant to speak louder');
    }

    if (metrics.connectionStability < 80) {
      issues.push('Unstable connection');
      recommendations.push('Suggest participant switch to wired connection or move closer to router');
    }

    return { status, issues, recommendations };
  }

  async provideRealTimeGuidance(
    sessionId: number,
    currentTask: TestTask,
    participantBehavior: {
      stuckDuration: number;
      retryCount: number;
      confusionSignals: string[];
    }
  ): Promise<string[]> {
    const guidance: string[] = [];

    if (participantBehavior.stuckDuration > 60) {
      guidance.push('💡 Participant has been stuck for over 1 minute. Consider offering a hint.');
    }

    if (participantBehavior.retryCount >= 3) {
      guidance.push('⚠️ Multiple retry attempts detected. This may indicate a usability issue.');
    }

    if (participantBehavior.confusionSignals.length > 0) {
      guidance.push(
        `🔍 Confusion signals detected: ${participantBehavior.confusionSignals.join(', ')}`
      );
      guidance.push('Ask participant to verbalize their thought process');
    }

    return guidance;
  }

  private generateTestTasks(requirements: {
    testType: string;
    objectives: string[];
  }): TestTask[] {
    const baseTasks: TestTask[] = [];

    if (requirements.testType === 'usability') {
      baseTasks.push({
        id: 1,
        title: 'Complete sign-up process',
        description: 'Create a new account and complete the onboarding flow',
        expectedDuration: 5,
        successCriteria: ['Account created', 'Profile completed', 'No errors encountered'],
        priority: 'high'
      });

      baseTasks.push({
        id: 2,
        title: 'Navigate to key feature',
        description: 'Find and use the primary feature of the application',
        expectedDuration: 8,
        successCriteria: ['Feature located within 2 minutes', 'Feature used successfully'],
        priority: 'high'
      });

      baseTasks.push({
        id: 3,
        title: 'Complete a transaction',
        description: 'Attempt to complete a purchase or booking',
        expectedDuration: 7,
        successCriteria: ['Transaction initiated', 'Payment flow understood', 'Confirmation received'],
        priority: 'medium'
      });
    }

    if (requirements.testType === 'exploratory') {
      baseTasks.push({
        id: 4,
        title: 'Free exploration',
        description: 'Explore the application freely for 10 minutes',
        expectedDuration: 10,
        successCriteria: ['Discovered 3+ features', 'Provided feedback on layout'],
        priority: 'medium'
      });
    }

    return baseTasks.slice(0, 5);
  }

  private createSchedule(
    tasks: TestTask[],
    totalDuration: number
  ): Array<{ task: TestTask; startTime: string; endTime: string }> {
    const schedule: Array<{ task: TestTask; startTime: string; endTime: string }> = [];
    let currentMinute = 5;

    for (const task of tasks) {
      const startTime = `${Math.floor(currentMinute / 60)}:${String(currentMinute % 60).padStart(2, '0')}`;
      currentMinute += task.expectedDuration;
      const endTime = `${Math.floor(currentMinute / 60)}:${String(currentMinute % 60).padStart(2, '0')}`;

      schedule.push({ task, startTime, endTime });
    }

    return schedule;
  }

  private extractGuidance(content: string): string[] {
    const lines = content.split('\n').filter(l => l.trim());
    const guidance: string[] = [];

    for (const line of lines) {
      if (
        line.toLowerCase().includes('tip') ||
        line.toLowerCase().includes('remember') ||
        line.toLowerCase().includes('important')
      ) {
        guidance.push(line.trim());
      }
    }

    if (guidance.length === 0) {
      guidance.push('Welcome participants and explain the session format');
      guidance.push('Remind participants to think aloud during tasks');
      guidance.push('Take notes on pain points and positive reactions');
    }

    return guidance.slice(0, 5);
  }
}

export const sessionOrchestrator = new SessionOrchestrator();

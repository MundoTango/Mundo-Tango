import { db } from "@db";
import { userTelemetry, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { Step } from "react-joyride";

export interface TourStep extends Step {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  disableBeacon?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  feature: string;
  steps: TourStep[];
  createdAt: Date;
}

const PREDEFINED_TOURS: Record<string, Omit<Tour, 'id' | 'createdAt'>> = {
  onboarding: {
    name: 'Platform Onboarding',
    feature: 'onboarding',
    steps: [
      {
        target: '[data-testid="sidebar-navigation"]',
        content: 'Welcome to Mundo Tango! This is your main navigation sidebar. Here you can access all key features of the platform.',
        title: 'Welcome! 👋',
        placement: 'right',
        disableBeacon: true
      },
      {
        target: '[data-testid="link-feed"]',
        content: 'The Feed is where you see updates from friends and the tango community.',
        title: 'Your Feed',
        placement: 'right'
      },
      {
        target: '[data-testid="link-events"]',
        content: 'Discover tango events happening near you or around the world.',
        title: 'Events',
        placement: 'right'
      },
      {
        target: '[data-testid="link-groups"]',
        content: 'Join groups to connect with dancers who share your interests.',
        title: 'Groups',
        placement: 'right'
      },
      {
        target: '[data-testid="button-create-post"]',
        content: 'Share your tango journey by creating posts, photos, and updates.',
        title: 'Share Your Story',
        placement: 'bottom'
      }
    ]
  },
  visualEditor: {
    name: 'Visual Editor Tour',
    feature: 'visual_editor',
    steps: [
      {
        target: '[data-visual-editor="preview-panel"]',
        content: 'This is your live preview. Click any element to select and edit it.',
        title: 'Live Preview',
        placement: 'left',
        disableBeacon: true
      },
      {
        target: '[data-testid="select-preview-page"]',
        content: 'Switch between different pages to edit various parts of the site.',
        title: 'Page Selector',
        placement: 'bottom'
      },
      {
        target: '[data-visual-editor="mrblue-panel"]',
        content: 'Chat with Mr. Blue AI to make changes using natural language.',
        title: 'Mr. Blue AI Assistant',
        placement: 'left'
      },
      {
        target: '[data-testid="button-generate-code"]',
        content: 'Generate production-ready code from your visual edits.',
        title: 'Code Generation',
        placement: 'bottom'
      },
      {
        target: '[data-testid="button-save-changes"]',
        content: 'Save your changes and create a commit for review.',
        title: 'Save & Commit',
        placement: 'bottom'
      }
    ]
  },
  events: {
    name: 'Events Feature Tour',
    feature: 'events',
    steps: [
      {
        target: '[data-testid="button-create-event"]',
        content: 'Create a new tango event - milonga, workshop, or festival.',
        title: 'Create Events',
        placement: 'bottom',
        disableBeacon: true
      },
      {
        target: '[data-testid="event-filters"]',
        content: 'Filter events by type, location, date, and more.',
        title: 'Filter Events',
        placement: 'bottom'
      },
      {
        target: '[data-testid="event-map"]',
        content: 'View events on a map to find those near you.',
        title: 'Event Map',
        placement: 'top'
      }
    ]
  },
  messaging: {
    name: 'Messaging Tour',
    feature: 'messaging',
    steps: [
      {
        target: '[data-testid="messages-list"]',
        content: 'All your conversations in one place.',
        title: 'Your Messages',
        placement: 'right',
        disableBeacon: true
      },
      {
        target: '[data-testid="button-new-message"]',
        content: 'Start a new conversation with any user.',
        title: 'New Message',
        placement: 'bottom'
      },
      {
        target: '[data-testid="message-input"]',
        content: 'Type your message here. You can also attach photos and files.',
        title: 'Send Messages',
        placement: 'top'
      }
    ]
  }
};

export class TourGuideAgent {
  async createTour(userId: number, feature: string): Promise<Tour> {
    const template = PREDEFINED_TOURS[feature];
    
    if (!template) {
      throw new Error(`Tour for feature "${feature}" not found`);
    }

    const tour: Tour = {
      id: `tour-${feature}-${Date.now()}`,
      name: template.name,
      feature: template.feature,
      steps: template.steps,
      createdAt: new Date()
    };

    await this.trackProgress(userId, tour.id, 0);

    return tour;
  }

  async trackProgress(userId: number, tourId: string, step: number): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        sessionId: tourId,
        eventType: 'tour_progress',
        pagePath: window?.location?.pathname || '/unknown',
        elementId: tourId,
        value: step.toString(),
        metadata: {
          tourId,
          currentStep: step,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[TourGuideAgent] Failed to track progress:', error);
    }
  }

  async completeTour(userId: number, tourId: string): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        sessionId: tourId,
        eventType: 'tour_completed',
        pagePath: window?.location?.pathname || '/unknown',
        elementId: tourId,
        value: 'completed',
        metadata: {
          tourId,
          completedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[TourGuideAgent] Failed to mark tour as complete:', error);
    }
  }

  async getTourProgress(userId: number, tourId: string): Promise<number> {
    try {
      const progress = await db.query.userTelemetry.findMany({
        where: and(
          eq(userTelemetry.userId, userId),
          eq(userTelemetry.sessionId, tourId),
          eq(userTelemetry.eventType, 'tour_progress')
        ),
        orderBy: (telemetry, { desc }) => [desc(telemetry.timestamp)]
      });

      if (progress.length > 0) {
        return parseInt(progress[0].value || '0');
      }

      return 0;
    } catch (error) {
      console.error('[TourGuideAgent] Failed to get tour progress:', error);
      return 0;
    }
  }

  async hasCompletedTour(userId: number, feature: string): Promise<boolean> {
    try {
      const completed = await db.query.userTelemetry.findFirst({
        where: and(
          eq(userTelemetry.userId, userId),
          eq(userTelemetry.eventType, 'tour_completed'),
          eq(userTelemetry.value, 'completed')
        )
      });

      return !!completed;
    } catch (error) {
      console.error('[TourGuideAgent] Failed to check tour completion:', error);
      return false;
    }
  }

  getAvailableTours(): Array<{ feature: string; name: string }> {
    return Object.entries(PREDEFINED_TOURS).map(([feature, tour]) => ({
      feature,
      name: tour.name
    }));
  }

  getTourByFeature(feature: string): Tour | null {
    const template = PREDEFINED_TOURS[feature];
    if (!template) return null;

    return {
      id: `tour-${feature}-${Date.now()}`,
      name: template.name,
      feature: template.feature,
      steps: template.steps,
      createdAt: new Date()
    };
  }
}

export const tourGuideAgent = new TourGuideAgent();

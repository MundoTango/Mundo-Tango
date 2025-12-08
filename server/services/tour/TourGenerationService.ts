/**
 * Tour Generation Service
 * Generates Mr Blue user tours from page audit data
 * 
 * MB.MD Pattern 52: Multi-Perspective Audit Protocol
 * MB.MD Pattern 0: MB.MD v9.9.4 Methodology
 */

import { db } from '../../db';
import { pageInventory, auditIssues } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'center';
  disableBeacon?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  feature: string;
  category: string;
  steps: TourStep[];
  createdAt: string;
  pageCount: number;
  status: 'draft' | 'active' | 'archived';
}

export interface TourGenerationResult {
  success: boolean;
  tour?: Tour;
  error?: string;
}

const CATEGORY_TOURS: Record<string, { name: string; description: string; feature: string }> = {
  dashboard: {
    name: 'Dashboard Overview',
    description: 'Learn how to navigate the main dashboard and access key features',
    feature: 'dashboard'
  },
  events: {
    name: 'Events & Milongas',
    description: 'Discover how to find, create, and manage tango events',
    feature: 'events'
  },
  profile: {
    name: 'Your Profile',
    description: 'Set up and customize your tango dancer profile',
    feature: 'profile'
  },
  groups: {
    name: 'Groups & Communities',
    description: 'Connect with tango groups and communities worldwide',
    feature: 'groups'
  },
  messages: {
    name: 'Messaging',
    description: 'Send and receive messages from other dancers',
    feature: 'messages'
  },
  mrblue: {
    name: 'Mr Blue AI Assistant',
    description: 'Get help from Mr Blue, your AI-powered tango assistant',
    feature: 'mrblue'
  },
  lifeceo: {
    name: 'LIFE CEO',
    description: 'Organize your tango life with LIFE CEO productivity tools',
    feature: 'lifeceo'
  },
  marketing: {
    name: 'Getting Started',
    description: 'Welcome to Mundo Tango - your journey starts here',
    feature: 'onboarding'
  },
  admin: {
    name: 'Admin Dashboard',
    description: 'Manage platform settings and user permissions',
    feature: 'admin'
  },
  settings: {
    name: 'Settings & Preferences',
    description: 'Customize your Mundo Tango experience',
    feature: 'settings'
  }
};

export class TourGenerationService {
  
  async generateToursFromAuditData(): Promise<Tour[]> {
    const tours: Tour[] = [];
    
    const pages = await db.select().from(pageInventory).orderBy(desc(pageInventory.priority));
    
    const categories = [...new Set(pages.map(p => p.category))];
    
    for (const category of categories) {
      const categoryPages = pages.filter(p => p.category === category);
      const tourConfig = CATEGORY_TOURS[category];
      
      if (!tourConfig || categoryPages.length === 0) continue;
      
      const steps: TourStep[] = categoryPages.slice(0, 5).map((page, index) => ({
        target: `[data-tour="${page.id}"], [data-testid="link-${page.path.replace(/\//g, '-').slice(1)}"], a[href="${page.path}"]`,
        title: page.name,
        content: `Navigate to ${page.name} to explore this feature.`,
        placement: index === 0 ? 'center' : 'bottom',
        disableBeacon: index === 0
      }));
      
      if (steps.length > 0) {
        tours.push({
          id: `tour-${category}`,
          name: tourConfig.name,
          description: tourConfig.description,
          feature: tourConfig.feature,
          category,
          steps,
          createdAt: new Date().toISOString(),
          pageCount: categoryPages.length,
          status: 'active'
        });
      }
    }
    
    return tours;
  }
  
  async generateTourForFeature(feature: string): Promise<TourGenerationResult> {
    try {
      const categoryMatch = Object.entries(CATEGORY_TOURS).find(([, config]) => config.feature === feature);
      
      if (!categoryMatch) {
        return { success: false, error: `Unknown feature: ${feature}` };
      }
      
      const [category, tourConfig] = categoryMatch;
      
      const pages = await db.select()
        .from(pageInventory)
        .where(eq(pageInventory.category, category))
        .orderBy(desc(pageInventory.priority));
      
      if (pages.length === 0) {
        return { success: false, error: `No pages found for category: ${category}` };
      }
      
      const steps: TourStep[] = pages.slice(0, 5).map((page, index) => ({
        target: `[data-tour="${page.id}"], [data-testid="link-${page.path.replace(/\//g, '-').slice(1)}"]`,
        title: page.name,
        content: `Explore ${page.name} - a key part of ${tourConfig.name}.`,
        placement: index === 0 ? 'center' : 'bottom',
        disableBeacon: index === 0
      }));
      
      const tour: Tour = {
        id: `tour-${category}-${Date.now()}`,
        name: tourConfig.name,
        description: tourConfig.description,
        feature: tourConfig.feature,
        category,
        steps,
        createdAt: new Date().toISOString(),
        pageCount: pages.length,
        status: 'active'
      };
      
      return { success: true, tour };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  
  async getTourById(tourId: string): Promise<Tour | null> {
    const tours = await this.generateToursFromAuditData();
    return tours.find(t => t.id === tourId) || null;
  }
  
  async getTourByFeature(feature: string): Promise<Tour | null> {
    const result = await this.generateTourForFeature(feature);
    return result.success ? result.tour || null : null;
  }
  
  async getTourStats(): Promise<{ totalTours: number; totalSteps: number; categories: string[] }> {
    const tours = await this.generateToursFromAuditData();
    
    return {
      totalTours: tours.length,
      totalSteps: tours.reduce((sum, t) => sum + t.steps.length, 0),
      categories: tours.map(t => t.category)
    };
  }
}

export const tourGenerationService = new TourGenerationService();

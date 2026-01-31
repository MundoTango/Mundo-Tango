/**
 * EMPTY STATE RESOLVER - Role-Aware Empty States
 * MB.MD v9.9.3 - Encouraging UX for New Users
 * 
 * Provides motivational empty states based on:
 * - User role level (RBAC)
 * - Feature area
 * - User journey stage
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  Crown, 
  Calendar, 
  Users, 
  Home, 
  MessageSquare,
  Image,
  BookOpen,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  Music
} from 'lucide-react';
import { Link } from 'wouter';

// ============================================================================
// TYPES
// ============================================================================

export type EmptyStateFeature = 
  | 'events'
  | 'groups'
  | 'messages'
  | 'housing'
  | 'media'
  | 'learning'
  | 'profile'
  | 'connections'
  | 'posts'
  | 'reviews'
  | 'ai-agents'
  | 'workflows';

export interface EmptyStateConfig {
  feature: EmptyStateFeature;
  roleLevel: number;
  hasCompletedOnboarding?: boolean;
  journeyStage?: number;
}

interface EmptyStateContent {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  secondaryCta?: string;
  secondaryCtaLink?: string;
  encouragement?: string;
}

// ============================================================================
// ROLE LEVEL NAMES
// ============================================================================

const ROLE_NAMES: Record<number, string> = {
  1: 'Standard',
  2: 'PRO',
  3: 'Teacher',
  4: 'Organizer',
  5: 'Business',
  6: 'Admin',
  7: 'Super Admin',
  8: 'God Level'
};

// ============================================================================
// EMPTY STATE CONTENT BY FEATURE AND ROLE
// ============================================================================

function getEmptyStateContent(config: EmptyStateConfig): EmptyStateContent {
  const { feature, roleLevel, journeyStage = 1 } = config;

  // Feature-specific empty states with role awareness
  switch (feature) {
    case 'events':
      if (roleLevel >= 4) {
        return {
          icon: Calendar,
          title: 'Create Your First Event',
          description: 'As an organizer, you can create milongas, practicas, festivals and workshops. Your events will be visible to the global tango community.',
          cta: 'Create Event',
          ctaLink: '/events/new',
          encouragement: 'Organizers like you bring dancers together!'
        };
      }
      return {
        icon: Calendar,
        title: 'Discover Tango Events',
        description: 'Find milongas, practicas, and festivals near you or anywhere in the world. Connect with the global tango community.',
        cta: 'Find Events',
        ctaLink: '/events',
        secondaryCta: 'Become an Organizer',
        secondaryCtaLink: '/pricing',
        encouragement: 'Your next dance partner might be waiting at the next milonga!'
      };

    case 'groups':
      return {
        icon: Users,
        title: roleLevel >= 3 ? 'Start a Tango Community' : 'Join Tango Groups',
        description: roleLevel >= 3 
          ? 'Create groups for your city, dance style, or community. Build connections that last a lifetime.'
          : 'Connect with tango dancers in your city or around the world. Share experiences and find dance partners.',
        cta: roleLevel >= 3 ? 'Create Group' : 'Explore Groups',
        ctaLink: roleLevel >= 3 ? '/groups/new' : '/groups',
        encouragement: 'The tango community grows stronger together!'
      };

    case 'messages':
      return {
        icon: MessageSquare,
        title: 'Start a Conversation',
        description: 'Connect with dancers, teachers, and organizers. Plan your next dance or coordinate events.',
        cta: 'Find Dancers',
        ctaLink: '/discover',
        encouragement: 'Every great tango partnership starts with a hello!'
      };

    case 'housing':
      if (roleLevel < 2) {
        return {
          icon: Home,
          title: 'Tango Housing Exchange',
          description: 'Find accommodation from fellow dancers when traveling or offer your space to visitors. Upgrade to PRO to access housing features.',
          cta: 'Upgrade to PRO',
          ctaLink: '/pricing',
          encouragement: 'PRO members save money and make friends worldwide!'
        };
      }
      return {
        icon: Home,
        title: 'Find or Offer Housing',
        description: 'Connect with dancers worldwide for housing exchanges. Save on travel and make lasting friendships.',
        cta: 'Browse Listings',
        ctaLink: '/housing',
        secondaryCta: 'Offer Your Space',
        secondaryCtaLink: '/housing/create',
        encouragement: 'The tango community takes care of its own!'
      };

    case 'media':
      if (roleLevel < 2) {
        return {
          icon: Image,
          title: 'AI Media Creation',
          description: 'Create stunning event posters, promotional videos, and marketing content with AI. Upgrade to PRO to unlock AI media tools.',
          cta: 'Upgrade to PRO',
          ctaLink: '/pricing',
          encouragement: 'PRO members create professional content in seconds!'
        };
      }
      return {
        icon: Image,
        title: 'Create AI-Powered Media',
        description: 'Generate beautiful event posters, promotional videos, and social media content using our AI tools.',
        cta: 'Start Creating',
        ctaLink: '/media/create',
        encouragement: 'Your creativity + AI = Amazing results!'
      };

    case 'learning':
      return {
        icon: BookOpen,
        title: 'Start Your AI Learning Journey',
        description: roleLevel >= 2 
          ? 'Access advanced AI courses and certifications. Master prompt engineering and AI orchestration.'
          : 'Learn about AI and how it can enhance your tango experience. Start with free beginner modules.',
        cta: 'Browse Courses',
        ctaLink: '/learning',
        secondaryCta: roleLevel < 2 ? 'Unlock All Courses' : undefined,
        secondaryCtaLink: roleLevel < 2 ? '/pricing' : undefined,
        encouragement: 'Knowledge is the foundation of mastery!'
      };

    case 'profile':
      return {
        icon: Star,
        title: 'Complete Your Profile',
        description: 'Help other dancers find you by completing your profile. Add your dance styles, experience, and a photo.',
        cta: 'Edit Profile',
        ctaLink: '/profile/edit',
        encouragement: 'Complete profiles get 5x more connection requests!'
      };

    case 'connections':
      return {
        icon: Users,
        title: 'Build Your Tango Network',
        description: 'Connect with dancers, teachers, and DJs from around the world. Your network is your greatest asset.',
        cta: 'Find Dancers',
        ctaLink: '/discover',
        encouragement: 'Every milonga is better with friends!'
      };

    case 'posts':
      return {
        icon: Music,
        title: 'Share Your Tango Journey',
        description: 'Post about your experiences, share videos, and inspire the community. Your story matters!',
        cta: 'Create Post',
        ctaLink: '/feed',
        encouragement: 'Your journey inspires others!'
      };

    case 'reviews':
      return {
        icon: Star,
        title: 'Share Your Experience',
        description: 'Help the community by reviewing events, teachers, and venues you\'ve visited.',
        cta: 'Write a Review',
        ctaLink: '/reviews/new',
        encouragement: 'Your feedback helps dancers find the best experiences!'
      };

    case 'ai-agents':
      if (roleLevel < 6) {
        return {
          icon: Zap,
          title: 'AI Agent Patterns',
          description: 'Access advanced AI agent orchestration patterns. This feature is available for administrators.',
          cta: 'Learn More',
          ctaLink: '/learning',
          encouragement: 'Explore our AI learning modules to get started!'
        };
      }
      return {
        icon: Zap,
        title: 'Configure AI Agents',
        description: 'Access the full library of AI agent patterns and orchestration workflows.',
        cta: 'View Patterns',
        ctaLink: '/admin/ai-agents',
        encouragement: 'The power of 1,218 agents at your fingertips!'
      };

    case 'workflows':
      if (roleLevel < 5) {
        return {
          icon: TrendingUp,
          title: 'Business Automation Workflows',
          description: 'Automate your business processes with AI-powered workflows. Upgrade to Business tier to access.',
          cta: 'Upgrade to Business',
          ctaLink: '/pricing',
          encouragement: 'Business users save 10+ hours per week!'
        };
      }
      return {
        icon: TrendingUp,
        title: 'Create Automation Workflows',
        description: 'Set up automated workflows for event management, marketing, and community engagement.',
        cta: 'Create Workflow',
        ctaLink: '/workflows/new',
        encouragement: 'Automation frees you to focus on what matters!'
      };

    default:
      return {
        icon: Sparkles,
        title: 'Get Started',
        description: 'Begin your journey with Mundo Tango. Connect, learn, and dance with the global community.',
        cta: 'Explore',
        ctaLink: '/discover',
        encouragement: 'The world of tango awaits!'
      };
  }
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateResolverProps {
  feature: EmptyStateFeature;
  roleLevel: number;
  hasCompletedOnboarding?: boolean;
  journeyStage?: number;
  className?: string;
}

export function EmptyStateResolver({
  feature,
  roleLevel,
  hasCompletedOnboarding = true,
  journeyStage = 1,
  className = ''
}: EmptyStateResolverProps) {
  const content = getEmptyStateContent({ feature, roleLevel, hasCompletedOnboarding, journeyStage });
  const Icon = content.icon;
  const roleName = ROLE_NAMES[roleLevel] || 'User';

  return (
    <Card className={`border-dashed ${className}`} data-testid={`empty-state-${feature}`}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl" data-testid={`empty-title-${feature}`}>
          {content.title}
        </CardTitle>
        <CardDescription className="text-base max-w-md mx-auto" data-testid={`empty-description-${feature}`}>
          {content.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {content.encouragement && (
          <p className="text-sm text-muted-foreground italic" data-testid={`empty-encouragement-${feature}`}>
            {content.encouragement}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={content.ctaLink}>
            <Button 
              className="gap-2" 
              data-testid={`button-empty-${feature}-cta`}
            >
              {content.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          
          {content.secondaryCta && content.secondaryCtaLink && (
            <Link href={content.secondaryCtaLink}>
              <Button 
                variant="outline" 
                className="gap-2"
                data-testid={`button-empty-${feature}-secondary`}
              >
                <Crown className="h-4 w-4" />
                {content.secondaryCta}
              </Button>
            </Link>
          )}
        </div>

        {roleLevel < 2 && (
          <p className="text-xs text-muted-foreground mt-4">
            Current plan: <span className="font-medium">{roleName}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPACT EMPTY STATE (for inline use)
// ============================================================================

interface CompactEmptyStateProps {
  feature: EmptyStateFeature;
  roleLevel: number;
  className?: string;
}

export function CompactEmptyState({ feature, roleLevel, className = '' }: CompactEmptyStateProps) {
  const content = getEmptyStateContent({ feature, roleLevel });
  const Icon = content.icon;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border border-dashed ${className}`} data-testid={`compact-empty-${feature}`}>
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{content.title}</p>
        <p className="text-xs text-muted-foreground truncate">{content.encouragement}</p>
      </div>
      <Link href={content.ctaLink}>
        <Button size="sm" variant="outline" data-testid={`button-compact-${feature}`}>
          {content.cta}
        </Button>
      </Link>
    </div>
  );
}

export default EmptyStateResolver;

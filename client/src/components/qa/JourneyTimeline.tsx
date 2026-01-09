/**
 * JourneyTimeline - Visual display of user navigation path
 * Shows breadcrumb trail with icons for different action types
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 */

import { 
  Navigation, 
  MousePointer, 
  Eye, 
  AlertTriangle, 
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyStep {
  timestamp: number;
  path: string;
  action?: string;
  element?: string;
  details?: Record<string, unknown>;
}

interface JourneyTimelineProps {
  journey: JourneyStep[];
  maxSteps?: number;
  compact?: boolean;
}

function getActionIcon(action?: string) {
  switch (action) {
    case 'tab_switch':
      return <Layers className="h-3 w-3" />;
    case 'nav_click':
      return <Navigation className="h-3 w-3" />;
    case 'navigation':
    case 'page_load':
      return <Eye className="h-3 w-3" />;
    case 'click':
    default:
      return <MousePointer className="h-3 w-3" />;
  }
}

function formatElement(element?: string): string {
  if (!element) return '';
  
  // Clean up element names for display
  if (element.startsWith('tab:')) {
    return element.replace('tab:', 'Tab: ');
  }
  if (element.startsWith('section:')) {
    return element.replace('section:', '');
  }
  if (element.startsWith('button:')) {
    return element.replace('button:', 'Clicked ');
  }
  if (element.startsWith('nav:')) {
    return element.replace('nav:', 'Nav: ');
  }
  
  return element;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

function getActionColor(action?: string): string {
  switch (action) {
    case 'tab_switch':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'nav_click':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'navigation':
    case 'page_load':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'click':
    default:
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  }
}

export function JourneyTimeline({ journey, maxSteps = 10, compact = false }: JourneyTimelineProps) {
  const displaySteps = journey.slice(-maxSteps);
  
  if (displaySteps.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No journey data captured yet
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {displaySteps.map((step, index) => (
          <div key={step.timestamp} className="flex items-center gap-1">
            <span className={cn(
              "px-2 py-0.5 rounded-full border",
              getActionColor(step.action)
            )}>
              {step.action === 'page_load' ? step.path : formatElement(step.element)}
            </span>
            {index < displaySteps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {displaySteps.map((step, index) => (
        <div 
          key={step.timestamp}
          className="flex items-start gap-3"
        >
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center border",
              getActionColor(step.action)
            )}>
              {getActionIcon(step.action)}
            </div>
            {index < displaySteps.length - 1 && (
              <div className="w-px h-4 bg-border" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {step.action === 'page_load' ? 'Loaded' : 
                 step.action === 'tab_switch' ? 'Switched to' :
                 step.action === 'nav_click' ? 'Navigated' :
                 'Clicked'}
              </span>
              <span className="text-foreground truncate">
                {step.action === 'page_load' ? step.path : formatElement(step.element)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTime(step.timestamp)}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{step.path}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JourneyTimeline;

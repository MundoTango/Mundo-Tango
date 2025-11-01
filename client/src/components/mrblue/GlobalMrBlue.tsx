import { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'wouter';
import { MrBlueAvatar2D } from './MrBlueAvatar2D';
import { ErrorBoundary } from './ErrorBoundary';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AVATAR_CONFIG, shouldUse3D } from '@/lib/avatarConfig';

// Lazy load 3D component (only loads if needed)
const MrBlueAvatar3D = lazy(() => import('./MrBlueAvatar3D'));

type AvatarExpression = 'happy' | 'thoughtful' | 'excited' | 'focused' | 'friendly' | 'confident' | 'playful' | 'professional';

type PageContext = {
  path: string;
  expression: AvatarExpression;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'hidden';
  message?: string;
};

/**
 * Context-aware avatar behavior
 * Maps page paths to appropriate expressions and positions
 */
const PAGE_CONTEXTS: Record<string, Omit<PageContext, 'path'>> = {
  '/feed': {
    expression: 'friendly',
    position: 'bottom-right',
    message: 'Check out the latest from your tango community!'
  },
  '/events': {
    expression: 'excited',
    position: 'bottom-right',
    message: 'So many amazing tango events coming up!'
  },
  '/settings': {
    expression: 'thoughtful',
    position: 'bottom-right',
    message: 'Let me know if you need help with any settings.'
  },
  '/life-ceo': {
    expression: 'professional',
    position: 'bottom-right',
    message: 'Your Life CEO agents are ready to assist!'
  },
  '/admin': {
    expression: 'focused',
    position: 'bottom-left',
    message: 'Admin mode activated. I\'m here to help.'
  },
  '/chat': {
    expression: 'happy',
    position: 'hidden', // Chat page has its own avatar
  },
};

/**
 * GlobalMrBlue - Persistent AI companion across all pages
 * 
 * Features:
 * - Context-aware positioning and expressions
 * - Page-specific behaviors
 * - Smooth transitions between pages
 * - Minimizable/hideable
 * - Click to open full chat
 */
export function GlobalMrBlue() {
  const [location] = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [modelAvailable, setModelAvailable] = useState(false);
  const [context, setContext] = useState<PageContext>({
    path: location,
    expression: 'friendly',
    position: 'bottom-right'
  });

  // Check if 3D model is available
  useEffect(() => {
    if (!AVATAR_CONFIG.model.autoCheck) return;

    const checkModel = async () => {
      try {
        const response = await fetch('/api/avatar/info');
        if (response.ok) {
          const data = await response.json();
          const available = data.modelExists || false;
          setModelAvailable(available);
          setUse3D(shouldUse3D(available));
        }
      } catch (error) {
        console.log('3D model check failed, using 2D');
        setUse3D(false);
      }
    };

    checkModel();
    
    // Periodic check
    const interval = setInterval(checkModel, AVATAR_CONFIG.model.checkInterval);
    return () => clearInterval(interval);
  }, []);

  // Update context when location changes
  useEffect(() => {
    // Find matching context
    const matchingPath = Object.keys(PAGE_CONTEXTS).find(path => 
      location.startsWith(path)
    );

    const newContext = matchingPath 
      ? { ...PAGE_CONTEXTS[matchingPath], path: location }
      : { expression: 'friendly' as AvatarExpression, position: 'bottom-right' as const, path: location };

    setContext(newContext);

    // Hide on chat page (has its own avatar)
    if (location.startsWith('/chat')) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  }, [location]);

  // Position styles
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'hidden': 'hidden'
  };

  const handleInteraction = () => {
    // Navigate to MrBlue chat
    window.location.href = '/chat';
  };

  if (isHidden || context.position === 'hidden') {
    return null;
  }

  return (
    <div 
      className={`fixed ${positionClasses[context.position]} z-50 transition-all duration-300 ${
        isMinimized ? 'scale-50 opacity-50' : 'scale-100 opacity-100'
      }`}
      data-testid="global-mr-blue"
    >
      {/* Avatar - 3D or 2D based on config */}
      <div className="relative">
        {use3D ? (
          <Suspense fallback={
            <MrBlueAvatar2D
              size={isMinimized ? 80 : 160}
              expression={context.expression}
              isActive={!isMinimized}
              onInteraction={handleInteraction}
            />
          }>
            <ErrorBoundary fallback={
              <MrBlueAvatar2D
                size={isMinimized ? 80 : 160}
                expression={context.expression}
                isActive={!isMinimized}
                onInteraction={handleInteraction}
              />
            }>
              <div onClick={handleInteraction} style={{ cursor: 'pointer' }}>
                <MrBlueAvatar3D
                  size={isMinimized ? 80 : 160}
                  expression={context.expression}
                />
              </div>
            </ErrorBoundary>
          </Suspense>
        ) : (
          <MrBlueAvatar2D
            size={isMinimized ? 80 : 160}
            expression={context.expression}
            isActive={!isMinimized}
            onInteraction={handleInteraction}
          />
        )}

        {/* Control Buttons */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          <Button
            size="icon"
            variant="outline"
            className="w-6 h-6 rounded-full shadow-lg bg-background"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-avatar"
          >
            {isMinimized ? '+' : '−'}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="w-6 h-6 rounded-full shadow-lg bg-background"
            onClick={() => setIsHidden(true)}
            data-testid="button-hide-avatar"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Context Message */}
        {!isMinimized && context.message && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-48">
            <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm text-center">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-card border-r border-b border-border" />
              {context.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

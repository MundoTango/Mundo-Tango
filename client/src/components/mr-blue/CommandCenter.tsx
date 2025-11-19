import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  MessageSquare, 
  Code, 
  Mic, 
  Facebook, 
  Brain, 
  Box, 
  Film,
  Sparkles,
  Target,
  Paintbrush
} from 'lucide-react';
import { useMrBlue } from '@/contexts/MrBlueContext';
import { FocusMode } from './FocusMode';
import { AvatarCanvas } from './AvatarCanvas';

/**
 * COMMAND CENTER - 9-card grid view
 * 
 * Shows all Mr Blue systems as clickable cards:
 * 1. Chat - Conversational AI
 * 2. The Plan - Roadmap view
 * 3. Visual Editor - Live page editing
 * 4. Video - Live video calls
 * 5. Vibe Code - Natural language coding
 * 6. Voice - Voice cloning studio
 * 7. Messenger - Facebook integration
 * 8. Memory - Long-term context
 * 9. Focus Mode - Pomodoro timer (integrated BlitzNow)
 * 
 * Plus: 3D Creator & AI Video Studio tabs
 */

interface SystemCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
  badge?: string;
  testId: string;
}

interface CommandCenterProps {
  onNavigateToSystem: (systemId: string) => void;
  onSwitchMode: (mode: 'command-center' | 'the-plan' | 'visual-editor') => void;
}

export function CommandCenter({ onNavigateToSystem, onSwitchMode }: CommandCenterProps) {
  const { avatarState, inCall, setAvatarState } = useMrBlue();
  const [expandedTab, setExpandedTab] = useState<string | null>(null);

  const systemCards: SystemCard[] = [
    {
      id: 'chat',
      title: 'Chat',
      description: 'Talk with Mr Blue AI',
      icon: MessageSquare,
      color: 'text-blue-500',
      action: () => onNavigateToSystem('chat'),
      badge: 'Context-Aware',
      testId: 'card-chat'
    },
    {
      id: 'the-plan',
      title: 'The Plan',
      description: '927 Features Roadmap',
      icon: Target,
      color: 'text-purple-500',
      action: () => onSwitchMode('the-plan'),
      badge: 'Week 9-12',
      testId: 'card-the-plan'
    },
    {
      id: 'visual-editor',
      title: 'Visual Editor',
      description: 'Edit pages live',
      icon: Paintbrush,
      color: 'text-pink-500',
      action: () => onSwitchMode('visual-editor'),
      badge: 'Replit Style',
      testId: 'card-visual-editor'
    },
    {
      id: 'video',
      title: 'Video Call',
      description: 'Live calls with avatar',
      icon: Video,
      color: 'text-red-500',
      action: () => onNavigateToSystem('video'),
      badge: inCall ? '🔴 Live' : 'Daily.co',
      testId: 'card-video'
    },
    {
      id: 'vibecode',
      title: 'Vibe Code',
      description: 'Natural language coding',
      icon: Code,
      color: 'text-green-500',
      action: () => onNavigateToSystem('vibecode'),
      badge: 'Llama 3.1',
      testId: 'card-vibecode'
    },
    {
      id: 'voice',
      title: 'Voice Clone',
      description: 'TTS voice studio',
      icon: Mic,
      color: 'text-orange-500',
      action: () => onNavigateToSystem('voice'),
      badge: 'ElevenLabs',
      testId: 'card-voice'
    },
    {
      id: 'messenger',
      title: 'Messenger',
      description: 'Facebook integration',
      icon: Facebook,
      color: 'text-blue-600',
      action: () => onNavigateToSystem('messenger'),
      badge: 'Two-Way',
      testId: 'card-messenger'
    },
    {
      id: 'memory',
      title: 'Memory',
      description: 'Long-term context',
      icon: Brain,
      color: 'text-indigo-500',
      action: () => onNavigateToSystem('memory'),
      badge: 'LanceDB',
      testId: 'card-memory'
    }
  ];

  const additionalTabs = [
    {
      id: '3d-creator',
      title: '3D Creator',
      description: 'Create 3D models',
      icon: Box,
      color: 'text-cyan-500',
      action: () => setExpandedTab(expandedTab === '3d-creator' ? null : '3d-creator'),
      badge: 'Experimental',
      testId: 'card-3d-creator'
    },
    {
      id: 'ai-video',
      title: 'AI Video',
      description: 'Generate AI videos',
      icon: Film,
      color: 'text-violet-500',
      action: () => setExpandedTab(expandedTab === 'ai-video' ? null : 'ai-video'),
      badge: 'D-ID',
      testId: 'card-ai-video'
    }
  ];

  return (
    <div className="space-y-6 p-6" data-testid="mode-command-center">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          ✨ Mr Blue Command Center
        </h2>
        <p className="text-muted-foreground">
          Your AI Development Partner - All Systems Unified
        </p>
        {inCall && (
          <Badge variant="default" className="animate-pulse">
            <Video className="h-3 w-3 mr-1" />
            Live Call Active
          </Badge>
        )}
      </div>

      {/* Avatar Status */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Mr Blue Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Temporarily disabled Avatar to fix R3F crash - will re-enable after fixing */}
          <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white animate-pulse" />
          </div>
          <Badge variant="outline">
            {avatarState.charAt(0).toUpperCase() + avatarState.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {/* Main System Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.id}
              className="hover-elevate cursor-pointer transition-all"
              onClick={card.action}
              data-testid={card.testId}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                    {card.title}
                  </div>
                  {card.badge && (
                    <Badge variant="outline" className="text-xs">
                      {card.badge}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Focus Mode Card (9th system - BlitzNow integrated) */}
      <div className="max-w-md mx-auto">
        <FocusMode />
      </div>

      {/* Additional Systems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {additionalTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Card 
              key={tab.id}
              className="hover-elevate cursor-pointer transition-all"
              onClick={tab.action}
              data-testid={tab.testId}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${tab.color}`} />
                    {tab.title}
                  </div>
                  {tab.badge && (
                    <Badge variant="outline" className="text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tab.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center space-y-1">
              <Badge variant="default" className="w-full">✅ Ready</Badge>
              <div className="text-xs text-muted-foreground">8 Core Systems</div>
            </div>
            <div className="text-center space-y-1">
              <Badge variant="default" className="w-full">✅ Active</Badge>
              <div className="text-xs text-muted-foreground">134K Context</div>
            </div>
            <div className="text-center space-y-1">
              <Badge variant={inCall ? "default" : "outline"} className="w-full">
                {inCall ? "🔴 Live" : "⚪ Ready"}
              </Badge>
              <div className="text-xs text-muted-foreground">Video System</div>
            </div>
            <div className="text-center space-y-1">
              <Badge variant="default" className="w-full">✅ Online</Badge>
              <div className="text-xs text-muted-foreground">All Services</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MB.MD Achievement */}
      <Card className="border-blue-500/50">
        <CardHeader>
          <CardTitle className="text-center">🎉 Week 1-8 Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            All 8 Mr Blue systems built and integrated. Ready for autonomous Mundo Tango development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

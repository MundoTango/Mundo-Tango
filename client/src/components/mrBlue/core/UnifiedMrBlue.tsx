import { useState, Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  Target, 
  Paintbrush,
  ArrowLeft,
  Video,
  MessageSquare,
  Code,
  Mic,
  Facebook,
  Brain,
  Box,
  Film
} from 'lucide-react';
import { useMrBlue } from '@/contexts/MrBlueContext';
import { CommandCenter } from './CommandCenter';
import { ThePlanView } from './ThePlanView';
import { VisualEditorMode } from './VisualEditorMode';
import { LoadingFallback } from '@/components/LoadingFallback';

// Lazy load heavy components from MrBlueStudio
const VideoConference = lazy(() => import('./VideoConference').then(m => ({ default: m.VideoConference })));
const VibeCodingInterface = lazy(() => import('./VibeCodingInterface').then(m => ({ default: m.VibeCodingInterface })));
const VoiceCloning = lazy(() => import('./VoiceCloning').then(m => ({ default: m.VoiceCloning })));
const MessengerIntegration = lazy(() => import('./MessengerIntegration').then(m => ({ default: m.MessengerIntegration })));
const MemoryDashboard = lazy(() => import('./MemoryDashboard').then(m => ({ default: m.MemoryDashboard })));
const ThreeDCreatorTab = lazy(() => import('./ThreeDCreatorTab').then(m => ({ default: m.ThreeDCreatorTab })));
const AIVideoStudioTab = lazy(() => import('./AIVideoStudioTab').then(m => ({ default: m.AIVideoStudioTab })));

/**
 * UNIFIED MR BLUE - Single Interface at /mr-blue
 * 
 * 3 Adaptive Modes:
 * 1. COMMAND CENTER - 9-card grid showing all systems
 * 2. THE PLAN - Roadmap visualization (927 features, Week 9-12)
 * 3. VISUAL EDITOR - Embedded split-pane editing
 * 
 * Integrates:
 * - MrBlueStudio (8 tabs: Video, Chat, Vibe Code, Voice, Messenger, Memory, 3D, AI Video)
 * - Visual Editor (conversational page editing)
 * - BlitzNow (integrated as Focus Mode card)
 * - The Plan (MB_MD_FINAL_PLAN.md roadmap)
 * 
 * Avatar state shared across all modes via MrBlueContext
 */

export default function UnifiedMrBlue() {
  const { unifiedMode, setUnifiedMode, avatarState, setAvatarState, setInCall } = useMrBlue();
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  const handleNavigateToSystem = (systemId: string) => {
    setActiveSystem(systemId);
  };

  const handleBackToCommandCenter = () => {
    setActiveSystem(null);
    setUnifiedMode('command-center');
  };

  const handleCallStart = () => {
    setInCall(true);
    setAvatarState('listening');
  };

  const handleCallEnd = () => {
    setInCall(false);
    setAvatarState('idle');
  };

  const handleUserSpeaking = (level: number) => {
    if (level > 0.3) {
      setAvatarState('listening');
    }
  };

  const handleMrBlueSpeaking = () => {
    setAvatarState('speaking');
  };

  // If viewing a specific system, show just that system
  if (activeSystem) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleBackToCommandCenter}
              data-testid="button-back-to-command-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Command Center
            </Button>
            <Badge variant="outline">
              {activeSystem.charAt(0).toUpperCase() + activeSystem.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-6">
          <Suspense fallback={<LoadingFallback message={`Loading ${activeSystem}...`} />}>
            {activeSystem === 'video' && (
              <VideoConference
                onCallStart={handleCallStart}
                onCallEnd={handleCallEnd}
                onUserSpeaking={handleUserSpeaking}
                onMrBlueSpeaking={handleMrBlueSpeaking}
                showChatIntegration={true}
              />
            )}
            {activeSystem === 'chat' && (
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Mr Blue Chat</h2>
                  <p className="text-muted-foreground">
                    Context-aware chat with semantic search over 134,648 lines of documentation.
                  </p>
                  <Button variant="default" data-testid="button-open-chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Chat Interface
                  </Button>
                </div>
              </Card>
            )}
            {activeSystem === 'vibecode' && <VibeCodingInterface />}
            {activeSystem === 'voice' && <VoiceCloning />}
            {activeSystem === 'messenger' && <MessengerIntegration />}
            {activeSystem === 'memory' && <MemoryDashboard />}
            {activeSystem === '3d-creator' && <ThreeDCreatorTab />}
            {activeSystem === 'ai-video' && <AIVideoStudioTab />}
          </Suspense>
        </div>
      </div>
    );
  }

  // Main 3-mode interface
  return (
    <div className="min-h-screen bg-background" data-testid="page-mr-blue">
      {/* Header with Mode Switcher */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Mr Blue AI Partner
            </h1>
            
            <div className="flex items-center gap-2">
              <Button
                variant={unifiedMode === 'command-center' ? 'default' : 'outline'}
                onClick={() => setUnifiedMode('command-center')}
                data-testid="button-mode-command-center"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Command Center
              </Button>
              <Button
                variant={unifiedMode === 'the-plan' ? 'default' : 'outline'}
                onClick={() => setUnifiedMode('the-plan')}
                data-testid="button-mode-the-plan"
              >
                <Target className="h-4 w-4 mr-2" />
                The Plan
              </Button>
              <Button
                variant={unifiedMode === 'visual-editor' ? 'default' : 'outline'}
                onClick={() => setUnifiedMode('visual-editor')}
                data-testid="button-mode-visual-editor"
              >
                <Paintbrush className="h-4 w-4 mr-2" />
                Visual Editor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {unifiedMode === 'command-center' && (
          <CommandCenter 
            onNavigateToSystem={handleNavigateToSystem}
            onSwitchMode={setUnifiedMode}
          />
        )}
        
        {unifiedMode === 'the-plan' && (
          <ThePlanView />
        )}
        
        {unifiedMode === 'visual-editor' && (
          <div className="h-[calc(100vh-80px)]">
            <VisualEditorMode />
          </div>
        )}
      </div>
    </div>
  );
}

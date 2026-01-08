import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { CommandCenter } from '../advanced/CommandCenter';
import { ThePlanView } from '../advanced/ThePlanView';
import { VisualEditorMode } from '../advanced/VisualEditorMode';

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
          {activeSystem === 'video' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Video Conference</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === 'chat' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Mr Blue Chat</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === 'vibecode' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Code className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Vibe Coding</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === 'voice' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Mic className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Voice Cloning</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === 'messenger' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Facebook className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Messenger Integration</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === 'memory' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Memory Dashboard</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === '3d-creator' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Box className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">3D Creator</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
          {activeSystem === 'ai-video' && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">AI Video Studio</h2>
                <p className="text-muted-foreground">Coming soon.</p>
              </div>
            </Card>
          )}
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

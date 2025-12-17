import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MrBlueAvatarVideo } from '@/components/mrblue/MrBlueAvatarVideo';
import type { VideoState } from '@/hooks/useVideoStateManager';
import { Sparkles, Brain, Smile, Mic, MessageSquare, ThumbsUp, PartyPopper, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

const VIDEO_STATES: { state: VideoState; icon: any; label: string; description: string }[] = [
  { state: 'idle', icon: Smile, label: 'Idle', description: 'Relaxed, gentle breathing' },
  { state: 'listening', icon: Mic, label: 'Listening', description: 'Attentive, focused' },
  { state: 'speaking', icon: MessageSquare, label: 'Speaking', description: 'Animated, expressive' },
  { state: 'happy', icon: PartyPopper, label: 'Happy', description: 'Joyful, energetic' },
  { state: 'thinking', icon: Brain, label: 'Thinking', description: 'Contemplative, pondering' },
  { state: 'excited', icon: Sparkles, label: 'Excited', description: 'Enthusiastic, vibrant' },
  { state: 'surprised', icon: AlertCircle, label: 'Surprised', description: 'Wide-eyed, amazed' },
  { state: 'nodding', icon: CheckCircle, label: 'Nodding', description: 'Agreeable, supportive' },
  { state: 'walk-left', icon: ArrowLeft, label: 'Walk Left', description: 'Walking animation' },
  { state: 'walk-right', icon: ArrowRight, label: 'Walk Right', description: 'Walking animation' },
];

export default function MrBlueVideoDemo() {
  const [selectedState, setSelectedState] = useState<VideoState>('idle');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/mrblue/generate-all-states', {
        method: 'POST',
      });
      const data = await response.json();
      console.log('Generation started:', data);
      alert(`Started ${data.generations?.length || 0}/10 video generations!\nCheck console for details.`);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to start generation. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Mr Blue Video Demo" fallbackRoute="/dashboard">
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🎬 Mr. Blue Video States Demo
          </h1>
          <p className="text-muted-foreground">
            Pixar-style AI companion with 10 dynamic expression states
          </p>
          <Button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            variant="default"
            data-testid="button-generate-all"
          >
            {isGenerating ? '⏳ Generating...' : '🎬 Generate All Videos'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Live Preview: {selectedState.charAt(0).toUpperCase() + selectedState.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[400px]">
                <MrBlueAvatarVideo
                  size={300}
                  initialState={selectedState}
                  enableStateTransitions={true}
                  data-testid="mr-blue-demo-avatar"
                />
              </CardContent>
            </Card>
          </div>

          {/* State Selector */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expression States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {VIDEO_STATES.map(({ state, icon: Icon, label, description }) => (
                    <Button
                      key={state}
                      variant={selectedState === state ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedState(state)}
                      data-testid={`button-state-${state}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video Status Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Video Generation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {VIDEO_STATES.map(({ state, icon: Icon, label }) => (
                <div
                  key={state}
                  className="flex flex-col items-center gap-2 p-4 border rounded-lg hover-elevate cursor-pointer"
                  onClick={() => setSelectedState(state)}
                  data-testid={`status-card-${state}`}
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <div className="text-sm font-medium text-center">{label}</div>
                  <Badge variant="outline" className="text-xs">
                    Queued
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Model</div>
                <div className="text-lg font-semibold">Luma Ray-2</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Aspect Ratio</div>
                <div className="text-lg font-semibold">1:1 (Square)</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Duration</div>
                <div className="text-lg font-semibold">5 seconds</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Cost per Video</div>
                <div className="text-lg font-semibold">$0.40</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Total Cost</div>
                <div className="text-lg font-semibold">~$4.00</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Generation Time</div>
                <div className="text-lg font-semibold">~2 min/video</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </SelfHealingErrorBoundary>
  );
}

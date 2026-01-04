import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AvatarCanvas } from '@/components/mrBlue/advanced/AvatarCanvas';
import type { AvatarState } from '@/components/mrBlue/advanced/PixarAvatar';
import {
  Sparkles,
  Brain,
  Smile,
  Mic,
  MessageSquare,
  PartyPopper,
  Volume2,
  Zap,
  Settings,
} from 'lucide-react';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

interface StateConfig {
  state: AvatarState;
  icon: any;
  label: string;
  description: string;
  color: string;
}

const getAvatarStates = (t: any): StateConfig[] => [
  {
    state: 'idle',
    icon: Smile,
    label: t('pages:mrBlueAvatarDemo.stateIdle', 'Idle'),
    description: t('pages:mrBlueAvatarDemo.stateIdleDesc', 'Relaxed breathing, gentle floating'),
    color: 'bg-blue-500',
  },
  {
    state: 'listening',
    icon: Mic,
    label: t('pages:mrBlueAvatarDemo.stateListening', 'Listening'),
    description: t('pages:mrBlueAvatarDemo.stateListeningDesc', 'Attentive, focused, brighter glow'),
    color: 'bg-cyan-500',
  },
  {
    state: 'speaking',
    icon: MessageSquare,
    label: t('pages:mrBlueAvatarDemo.stateSpeaking', 'Speaking'),
    description: t('pages:mrBlueAvatarDemo.stateSpeakingDesc', 'Animated, pulsing, expressive'),
    color: 'bg-blue-600',
  },
  {
    state: 'thinking',
    icon: Brain,
    label: t('pages:mrBlueAvatarDemo.stateThinking', 'Thinking'),
    description: t('pages:mrBlueAvatarDemo.stateThinkingDesc', 'Contemplative, slower movement'),
    color: 'bg-purple-500',
  },
  {
    state: 'happy',
    icon: PartyPopper,
    label: t('pages:mrBlueAvatarDemo.stateHappy', 'Happy'),
    description: t('pages:mrBlueAvatarDemo.stateHappyDesc', 'Joyful, energetic, golden glow'),
    color: 'bg-yellow-500',
  },
  {
    state: 'excited',
    icon: Sparkles,
    label: t('pages:mrBlueAvatarDemo.stateExcited', 'Excited'),
    description: t('pages:mrBlueAvatarDemo.stateExcitedDesc', 'Vibrant, rapid movement, intense'),
    color: 'bg-pink-500',
  },
];

export default function MrBlueAvatarDemo() {
  const { t } = useTranslation(["pages", "common"]);
  const AVATAR_STATES = getAvatarStates(t);
  const [selectedState, setSelectedState] = useState<AvatarState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [enableControls, setEnableControls] = useState(false);
  const [isAutoDemo, setIsAutoDemo] = useState(false);
  const [avatarSize, setAvatarSize] = useState(400);

  // Auto-cycle through states for demo
  useEffect(() => {
    if (!isAutoDemo) return;

    const interval = setInterval(() => {
      setSelectedState((current) => {
        const currentIndex = AVATAR_STATES.findIndex((s) => s.state === current);
        const nextIndex = (currentIndex + 1) % AVATAR_STATES.length;
        return AVATAR_STATES[nextIndex].state;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoDemo, AVATAR_STATES]);

  // Simulate audio level fluctuation
  useEffect(() => {
    if (selectedState !== 'speaking') {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 0.8 + 0.2);
    }, 100);

    return () => clearInterval(interval);
  }, [selectedState]);

  const currentConfig = AVATAR_STATES.find((s) => s.state === selectedState) || AVATAR_STATES[0];

  return (
    <SelfHealingErrorBoundary pageName={t('pages:mrBlueAvatarDemo.pageName', 'Mr Blue Avatar Demo')} fallbackRoute="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                {t('pages:mrBlueAvatarDemo.title', 'Mr. Blue Pixar Avatar')}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pages:mrBlueAvatarDemo.subtitle', 'Beautiful 3D animated sphere avatar with emotional states and voice reactivity')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Avatar Display */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <currentConfig.icon className="h-5 w-5" />
                      {currentConfig.label} {t('pages:mrBlueAvatarDemo.state', 'State')}
                    </CardTitle>
                    <Badge className={`${currentConfig.color} text-white`}>
                      {t('pages:mrBlueAvatarDemo.livePreview', 'Live Preview')}
                    </Badge>
                  </div>
                  <CardDescription>{currentConfig.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-12">
                  <AvatarCanvas
                    state={selectedState}
                    audioLevel={audioLevel}
                    size={avatarSize}
                    enableControls={enableControls}
                    data-testid="pixar-avatar-canvas"
                  />
                </CardContent>
              </Card>

              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    {t('pages:mrBlueAvatarDemo.controls', 'Controls')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Audio Level */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        {t('pages:mrBlueAvatarDemo.audioLevel', 'Audio Level (Speaking State)')}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(audioLevel * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[audioLevel * 100]}
                      onValueChange={([value]) => setAudioLevel(value / 100)}
                      max={100}
                      step={1}
                      disabled={selectedState !== 'speaking'}
                      data-testid="slider-audio-level"
                    />
                  </div>

                  {/* Avatar Size */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {t('pages:mrBlueAvatarDemo.avatarSize', 'Avatar Size')}
                      </label>
                      <span className="text-sm text-muted-foreground">{avatarSize}px</span>
                    </div>
                    <Slider
                      value={[avatarSize]}
                      onValueChange={([value]) => setAvatarSize(value)}
                      min={200}
                      max={600}
                      step={50}
                      data-testid="slider-avatar-size"
                    />
                  </div>

                  {/* Toggle Controls */}
                  <div className="flex gap-3">
                    <Button
                      variant={enableControls ? 'default' : 'outline'}
                      onClick={() => setEnableControls(!enableControls)}
                      className="flex-1"
                      data-testid="button-toggle-controls"
                    >
                      {enableControls ? t('pages:mrBlueAvatarDemo.disable', 'Disable') : t('pages:mrBlueAvatarDemo.enable', 'Enable')} {t('pages:mrBlueAvatarDemo.orbitControls', 'Orbit Controls')}
                    </Button>
                    <Button
                      variant={isAutoDemo ? 'default' : 'outline'}
                      onClick={() => setIsAutoDemo(!isAutoDemo)}
                      className="flex-1"
                      data-testid="button-auto-demo"
                    >
                      {isAutoDemo ? t('pages:mrBlueAvatarDemo.stop', 'Stop') : t('pages:mrBlueAvatarDemo.start', 'Start')} {t('pages:mrBlueAvatarDemo.autoDemo', 'Auto Demo')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* State Selector */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pages:mrBlueAvatarDemo.emotionalStates', 'Emotional States')}</CardTitle>
                  <CardDescription>{t('pages:mrBlueAvatarDemo.clickToSwitch', 'Click to switch between states')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {AVATAR_STATES.map(({ state, icon: Icon, label, description, color }) => (
                      <Button
                        key={state}
                        variant={selectedState === state ? 'default' : 'outline'}
                        className="w-full justify-start h-auto py-3"
                        onClick={() => {
                          setSelectedState(state);
                          setIsAutoDemo(false);
                        }}
                        data-testid={`button-state-${state}`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={`${color} p-2 rounded-lg shrink-0`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{label}</div>
                            <div className="text-xs text-muted-foreground font-normal">
                              {description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:mrBlueAvatarDemo.technicalDetails', 'Technical Details')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">{t('pages:mrBlueAvatarDemo.framework', 'Framework')}</div>
                  <div className="text-lg font-semibold">{t('pages:mrBlueAvatarDemo.reactThreeFiber', 'React Three Fiber')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">{t('pages:mrBlueAvatarDemo.performance', 'Performance')}</div>
                  <div className="text-lg font-semibold">{t('pages:mrBlueAvatarDemo.fpsTarget', '60 FPS Target')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">{t('pages:mrBlueAvatarDemo.states', 'States')}</div>
                  <div className="text-lg font-semibold">{t('pages:mrBlueAvatarDemo.sixStates', '6 Emotional States')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">{t('pages:mrBlueAvatarDemo.features', 'Features')}</div>
                  <div className="text-lg font-semibold">{t('pages:mrBlueAvatarDemo.voiceReactive', 'Voice Reactive')}</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">{t('pages:mrBlueAvatarDemo.featuresLabel', 'Features:')}</h4>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('pages:mrBlueAvatarDemo.featureSmooth', 'Smooth state transitions')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('pages:mrBlueAvatarDemo.featureVoice', 'Voice-reactive pulsing')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('pages:mrBlueAvatarDemo.featureFloating', 'Floating/bobbing animation')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('pages:mrBlueAvatarDemo.featureLighting', 'Dynamic lighting effects')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('pages:mrBlueAvatarDemo.featureGlass', 'Glassmorphic materials')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('pages:mrBlueAvatarDemo.featureOptimized', 'Performance optimized')}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}

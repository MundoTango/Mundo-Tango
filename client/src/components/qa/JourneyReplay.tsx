import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, AlertTriangle, Globe, Mouse, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JourneyStep } from '@/hooks/useJourneyTracker';

interface JourneyReplayProps {
  journey: JourneyStep[];
  networkFailures?: { url: string; method: string; status: number; timestamp: number }[];
  consoleErrors?: { message: string; type: string; timestamp: number }[];
  rageClicks?: { element: string; count: number; timestamp: number }[];
}

export function JourneyReplay({ journey, networkFailures = [], consoleErrors = [], rageClicks = [] }: JourneyReplayProps) {
  const { t } = useTranslation('common');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const allEvents = [...journey.map(j => ({ ...j, type: 'journey' as const })),
    ...networkFailures.map(n => ({ ...n, type: 'network' as const })),
    ...consoleErrors.map(c => ({ ...c, type: 'error' as const })),
    ...rageClicks.map(r => ({ ...r, type: 'rage' as const }))
  ].sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (isPlaying && currentIndex < allEvents.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1000);
    } else if (currentIndex >= allEvents.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, allEvents.length]);

  const handlePlayPause = () => {
    if (currentIndex >= allEvents.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.min(allEvents.length - 1, prev + 1));
  };

  const progress = allEvents.length > 0 ? ((currentIndex + 1) / allEvents.length) * 100 : 0;
  const currentEvent = allEvents[currentIndex];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Globe className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'rage':
        return <Mouse className="h-4 w-4 text-yellow-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventDescription = (event: typeof allEvents[0]) => {
    switch (event.type) {
      case 'network':
        return `API ${(event as any).method} ${(event as any).url} failed (${(event as any).status})`;
      case 'error':
        return `Console ${(event as any).type}: ${(event as any).message?.substring(0, 80)}`;
      case 'rage':
        return `Rage clicked ${(event as any).count}x on ${(event as any).element}`;
      default:
        return `${(event as any).action || 'navigation'}: ${(event as any).path}`;
    }
  };

  if (allEvents.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          {t('bugReport.noJourneyData', 'No journey data to replay')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30" data-testid="journey-replay">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4" />
          {t('bugReport.journeyReplay', 'User Journey Replay')}
          <Badge variant="outline" className="ml-auto text-xs">
            {currentIndex + 1} / {allEvents.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-2" />

        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            data-testid="button-replay-prev"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={isPlaying ? "secondary" : "default"}
            onClick={handlePlayPause}
            data-testid="button-replay-play"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex >= allEvents.length - 1}
            data-testid="button-replay-next"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {currentEvent && (
          <div className="flex items-start gap-3 p-3 bg-background rounded-md border">
            {getEventIcon(currentEvent.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium capitalize">
                {currentEvent.type === 'journey' ? 'Navigation' : currentEvent.type}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {getEventDescription(currentEvent)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(currentEvent.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        <div className="max-h-32 overflow-y-auto space-y-1">
          {allEvents.map((event, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                idx === currentIndex 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(idx);
              }}
              data-testid={`replay-step-${idx}`}
            >
              {getEventIcon(event.type)}
              <span className="truncate flex-1">{getEventDescription(event)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

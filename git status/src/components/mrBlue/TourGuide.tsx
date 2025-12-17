import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface TourGuideProps {
  feature: string;
  userId: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export default function TourGuide({ feature, userId, autoStart = false, onComplete }: TourGuideProps) {
  const [run, setRun] = useState(autoStart);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourId, setTourId] = useState<string>('');

  const { data: tourData, isLoading } = useQuery({
    queryKey: ['/api/mr-blue/agents/tour', feature],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/mr-blue/agents/tour/${feature}`);
      return response.json();
    },
    enabled: !!feature
  });

  useEffect(() => {
    if (tourData?.success && tourData.data) {
      setTourId(tourData.data.id);
    }
  }, [tourData]);

  useEffect(() => {
    if (autoStart && tourData?.success) {
      setRun(true);
    }
  }, [autoStart, tourData]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, type, index } = data;

    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
      
      if (tourId && userId) {
        try {
          await apiRequest('POST', '/api/mr-blue/agents/tour/progress', {
            userId,
            tourId,
            step: index + 1
          });
        } catch (error) {
          console.error('[TourGuide] Failed to track progress:', error);
        }
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      
      if (status === STATUS.FINISHED && tourId && userId) {
        try {
          await apiRequest('POST', '/api/mr-blue/agents/tour/complete', {
            userId,
            tourId
          });
        } catch (error) {
          console.error('[TourGuide] Failed to complete tour:', error);
        }
      }

      if (onComplete) {
        onComplete();
      }
    }
  };

  const startTour = () => {
    setRun(true);
    setStepIndex(0);
  };

  if (isLoading || !tourData?.success || !tourData.data) {
    return null;
  }

  const steps: Step[] = tourData.data.steps.map((step: any) => ({
    target: step.target,
    content: step.content,
    title: step.title,
    placement: step.placement || 'auto',
    disableBeacon: step.disableBeacon || false
  }));

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
            arrowColor: 'hsl(var(--background))',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000
          },
          tooltip: {
            borderRadius: 8,
            padding: 20
          },
          buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            borderRadius: 6,
            padding: '8px 16px'
          },
          buttonBack: {
            color: 'hsl(var(--muted-foreground))',
            marginRight: 10
          },
          buttonSkip: {
            color: 'hsl(var(--muted-foreground))'
          }
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip tour'
        }}
      />

      {!run && (
        <button
          onClick={startTour}
          className="hidden"
          data-testid="button-start-tour"
          aria-label="Start tour"
        />
      )}
    </>
  );
}

export function useTourGuide(feature: string, userId?: number) {
  const [showTour, setShowTour] = useState(false);

  const startTour = () => {
    setShowTour(true);
  };

  const stopTour = () => {
    setShowTour(false);
  };

  const TourComponent = userId ? (
    <TourGuide 
      feature={feature} 
      userId={userId}
      autoStart={showTour}
      onComplete={stopTour}
    />
  ) : null;

  return {
    showTour,
    startTour,
    stopTour,
    TourComponent
  };
}

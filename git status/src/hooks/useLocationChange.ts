import { useRef, useState, useCallback } from 'react';
import { 
  triggerLocationChangeEffects, 
  detectLocationChange, 
  formatWelcomeMessage, 
  LocationChangeEvent, 
  LocationChangeEffects 
} from '@/lib/locationChangeEffects';
import { useToast } from '@/hooks/use-toast';

interface PreviousLocation {
  city?: string;
  country?: string;
}

interface UseLocationChangeOptions {
  userId: number;
  onEffectsTriggered?: (effects: LocationChangeEffects) => void;
}

interface UseLocationChangeReturn {
  isProcessing: boolean;
  lastEffects: LocationChangeEffects | null;
  checkAndTriggerEffects: (newCity: string, newCountry: string) => Promise<LocationChangeEffects | null>;
  updatePreviousLocation: (city?: string, country?: string) => void;
  previousLocation: PreviousLocation;
}

export function useLocationChange({ userId, onEffectsTriggered }: UseLocationChangeOptions): UseLocationChangeReturn {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEffects, setLastEffects] = useState<LocationChangeEffects | null>(null);
  const previousLocationRef = useRef<PreviousLocation>({});

  const updatePreviousLocation = useCallback((city?: string, country?: string) => {
    previousLocationRef.current = { city, country };
  }, []);

  const checkAndTriggerEffects = useCallback(async (
    newCity: string, 
    newCountry: string
  ): Promise<LocationChangeEffects | null> => {
    const previousLocation = previousLocationRef.current;
    
    const hasLocationChanged = detectLocationChange(
      previousLocation.city || previousLocation.country ? previousLocation : null,
      newCity,
      newCountry
    );

    if (!hasLocationChanged) {
      return null;
    }

    setIsProcessing(true);

    try {
      const event: LocationChangeEvent = {
        previousCity: previousLocation.city,
        previousCountry: previousLocation.country,
        newCity,
        newCountry,
        userId,
        timestamp: new Date(),
      };

      const effects = await triggerLocationChangeEffects(event);
      setLastEffects(effects);

      const welcomeMessage = formatWelcomeMessage(effects, newCity);
      toast({
        title: 'Location Updated',
        description: welcomeMessage,
      });

      previousLocationRef.current = { city: newCity, country: newCountry };

      if (onEffectsTriggered) {
        onEffectsTriggered(effects);
      }

      return effects;
    } catch (error) {
      console.error('[useLocationChange] Failed to trigger effects:', error);
      toast({
        title: 'Location Updated',
        description: `Welcome to ${newCity}!`,
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [userId, toast, onEffectsTriggered]);

  return {
    isProcessing,
    lastEffects,
    checkAndTriggerEffects,
    updatePreviousLocation,
    previousLocation: previousLocationRef.current,
  };
}

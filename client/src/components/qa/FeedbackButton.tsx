import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracker } from '@/hooks/useJourneyTracker';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useMrBlue } from '@/hooks/useMrBlue';

export function FeedbackButton() {
  const { user } = useAuth();
  const { getSnapshot, sessionId } = useJourneyTracker(user?.id);
  const { toast } = useToast();
  const { t } = useTranslation(['common']);
  const { openChat } = useMrBlue();

  const openMrBlueChat = (context: string) => {
    openChat(context);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openMrBlueChat('Help')}
        className="gap-2"
        data-testid="button-help"
      >
        ? Help
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openMrBlueChat('Features')}
        className="gap-2"
        data-testid="button-features"
      >
        ✨ Features
      </Button>
    </div>
  );
}

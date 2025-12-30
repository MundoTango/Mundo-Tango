import { HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMrBlue } from '@/contexts/MrBlueContext';

/**
 * FeedbackButton - Opens Mr. Blue chat for QA assistance
 * The actual QA system (Help/Features/Bug Report) is now integrated
 * directly into the Mr. Blue chat interface with journey tracking
 */
export function FeedbackButton() {
  const { openChat } = useMrBlue();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openChat()}
        className="gap-1.5"
        data-testid="button-help"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        Help
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openChat()}
        className="gap-1.5"
        data-testid="button-features"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Features
      </Button>
    </div>
  );
}

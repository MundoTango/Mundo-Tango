import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface CharacterCounterProps {
  count: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ count, max, className = "" }: CharacterCounterProps) {
  const percentage = (count / max) * 100;
  const isWarning = percentage >= 90;
  const isError = percentage >= 100;

  const wordCount = count > 0 ? count.toString().split(/\s+/).filter(w => w.length > 0).length : 0;

  return (
    <div className={`flex items-center justify-between text-sm ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span data-testid="text-word-count">{wordCount} words</span>
      </div>
      <div className="flex items-center gap-2">
        {isError && <AlertCircle className="h-4 w-4 text-destructive" />}
        <Badge
          variant={isError ? "destructive" : isWarning ? "default" : "secondary"}
          className="font-mono"
          data-testid="badge-character-count"
        >
          {count.toLocaleString()} / {max.toLocaleString()}
        </Badge>
      </div>
    </div>
  );
}

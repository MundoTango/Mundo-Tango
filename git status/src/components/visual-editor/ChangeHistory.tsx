import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Undo, Redo, Clock } from 'lucide-react';
import type { StyleChange } from '@/lib/iframeInjector';

export function ChangeHistory({ changes, currentIndex, onUndo, onRedo, onJumpTo }: ChangeHistoryProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Change History
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            disabled={currentIndex < 0}
            data-testid="button-undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRedo}
            disabled={currentIndex >= changes.length - 1}
            data-testid="button-redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {changes.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No changes yet. Start editing to see history.
            </div>
          ) : (
            changes.map((change, index) => (
              <div
                key={index}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  index <= currentIndex
                    ? 'bg-primary/10 hover-elevate active-elevate-2'
                    : 'bg-muted/50 hover-elevate'
                }`}
                onClick={() => onJumpTo(index)}
                data-testid={`change-item-${index}`}
              >
                <div className="text-sm font-medium">
                  {change.property}: {change.previousValue || '(none)'} → {change.newValue}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(change.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

interface ChangeHistoryProps {
  changes: StyleChange[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (index: number) => void;
}

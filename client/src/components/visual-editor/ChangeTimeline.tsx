/**
 * Change Timeline Component
 * Chronological history of all visual editor changes with restore functionality
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VisualDiffViewer, type ChangeMetadata } from './VisualDiffViewer';
import { getScreenshot } from '@/lib/screenshotCapture';
import {
  Clock,
  FileCode,
  RotateCcw,
  Trash2,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';

interface ChangeTimelineProps {
  changes: ChangeMetadata[];
  onRestore?: (changeId: string) => void;
  onDelete?: (changeId: string) => void;
}

export function ChangeTimeline({ changes, onRestore, onDelete }: ChangeTimelineProps) {
  const [expandedChange, setExpandedChange] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Load thumbnails for timeline
  useEffect(() => {
    async function loadThumbnails() {
      const thumbs: Record<string, string> = {};
      for (const change of changes) {
        const afterImg = await getScreenshot(change.afterScreenshot);
        if (afterImg) {
          thumbs[change.id] = afterImg;
        }
      }
      setThumbnails(thumbs);
    }

    if (changes.length > 0) {
      loadThumbnails();
    }
  }, [changes]);

  const handleRestoreClick = (changeId: string) => {
    setSelectedChangeId(changeId);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = () => {
    if (selectedChangeId && onRestore) {
      onRestore(selectedChangeId);
    }
    setRestoreDialogOpen(false);
    setSelectedChangeId(null);
  };

  const sortedChanges = [...changes].sort((a, b) => b.timestamp - a.timestamp);

  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No Changes Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your change history will appear here as you make edits in the Visual Editor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="change-timeline">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Change History
              </span>
              <Badge variant="secondary">
                {changes.length} change{changes.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 pr-4">
            {sortedChanges.map((change, index) => (
              <div key={change.id} className="relative">
                {/* Timeline connector line */}
                {index < sortedChanges.length - 1 && (
                  <div className="absolute left-6 top-20 bottom-0 w-px bg-border" />
                )}

                <Card className="relative overflow-hidden hover-elevate">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(change.timestamp), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">
                          {change.prompt}
                        </p>
                      </div>

                      {/* Thumbnail */}
                      {thumbnails[change.id] && (
                        <div className="shrink-0 w-24 h-16 border rounded overflow-hidden bg-muted">
                          <img
                            src={thumbnails[change.id]}
                            alt="Change preview"
                            className="w-full h-full object-cover"
                            data-testid={`timeline-thumbnail-${change.id}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-2 pt-2">
                      <Badge variant="outline" className="text-xs gap-1">
                        <FileCode className="h-3 w-3" />
                        {change.files.length} file{change.files.length !== 1 ? 's' : ''}
                      </Badge>
                      {change.changedElements && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {change.changedElements} element{change.changedElements !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Accordion
                        type="single"
                        collapsible
                        value={expandedChange === change.id ? change.id : ''}
                        onValueChange={(value) => setExpandedChange(value || null)}
                        className="flex-1"
                      >
                        <AccordionItem value={change.id} className="border-0">
                          <AccordionTrigger className="py-2 hover:no-underline">
                            <span className="text-sm font-medium flex items-center gap-1">
                              View Details
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <VisualDiffViewer change={change} showCodeDiff={true} />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="flex gap-2">
                        {onRestore && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreClick(change.id)}
                            data-testid={`button-restore-${change.id}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(change.id)}
                            data-testid={`button-delete-${change.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore to this point?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert all changes made after this point. The current state will be lost.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Change Timeline Component
 * Chronological history of all visual editor changes with restore and replay functionality
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Search,
  Filter,
  FileJson,
  RotateCcwSquare,
  Keyboard,
} from 'lucide-react';

interface ChangeTimelineProps {
  changes: ChangeMetadata[];
  currentIndex?: number;
  isReplaying?: boolean;
  onRestore?: (changeId: string) => void;
  onDelete?: (changeId: string) => void;
  onReplay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBack?: () => void;
  onJumpTo?: (index: number) => void;
  onDownload?: (screenshot: string, filename: string) => void;
  onBatchUndo?: (count: number) => void;
  onExportHistory?: () => string;
}

export function ChangeTimeline({ 
  changes, 
  currentIndex = -1,
  isReplaying = false,
  onRestore, 
  onDelete,
  onReplay,
  onPause,
  onStepForward,
  onStepBack,
  onJumpTo,
  onDownload,
  onBatchUndo,
  onExportHistory,
}: ChangeTimelineProps) {
  const [expandedChange, setExpandedChange] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

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

  const handleExportHistory = () => {
    if (!onExportHistory) return;
    
    const historyJson = onExportHistory();
    const blob = new Blob([historyJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visual-editor-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchUndo = (count: number) => {
    if (onBatchUndo) {
      onBatchUndo(count);
    }
  };

  // Filter and search changes
  const filteredChanges = changes.filter((change) => {
    // Filter by type
    if (filterType !== 'all') {
      const changeType = (change as any).type || 'unknown';
      if (changeType !== filterType) return false;
    }

    // Search in description and prompt
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesPrompt = change.prompt.toLowerCase().includes(query);
      const matchesDescription = (change as any).description?.toLowerCase().includes(query);
      return matchesPrompt || matchesDescription;
    }

    return true;
  });

  const sortedChanges = [...filteredChanges].sort((a, b) => b.timestamp - a.timestamp);

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
                Change Timeline
              </span>
              <div className="flex items-center gap-2">
                {/* Replay Controls */}
                {(onReplay || onPause || onStepForward || onStepBack) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onStepBack}
                      disabled={!onStepBack || currentIndex <= 0}
                      data-testid="button-step-back"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={isReplaying ? onPause : onReplay}
                      disabled={changes.length === 0 || (!onReplay && !onPause)}
                      data-testid="button-replay"
                    >
                      {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onStepForward}
                      disabled={!onStepForward || currentIndex >= changes.length - 1}
                      data-testid="button-step-forward"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                  </>
                )}
                <Badge variant="secondary">
                  {filteredChanges.length} / {changes.length} change{changes.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Search and Filter Toolbar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search changes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  data-testid="input-search-changes"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32" data-testid="select-filter-type">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="style">Style</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Batch Undo Popover */}
              {onBatchUndo && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="outline" data-testid="button-batch-undo">
                      <RotateCcwSquare className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Batch Undo</h4>
                      <p className="text-xs text-muted-foreground">
                        Undo multiple changes at once
                      </p>
                      <div className="space-y-2">
                        {[3, 5, 10].map((count) => (
                          <Button
                            key={count}
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleBatchUndo(count)}
                            disabled={currentIndex < count - 1}
                            data-testid={`button-batch-undo-${count}`}
                          >
                            Undo Last {count} Changes
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
              {/* Export History */}
              {onExportHistory && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportHistory}
                  data-testid="button-export-history"
                >
                  <FileJson className="w-4 h-4" />
                </Button>
              )}
              
              {/* Keyboard Shortcuts */}
              <Popover open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" data-testid="button-keyboard-shortcuts">
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Undo</span>
                        <Badge variant="outline" className="font-mono">
                          Ctrl+Z
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Redo</span>
                        <Badge variant="outline" className="font-mono">
                          Ctrl+Y
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Redo (Alt)</span>
                        <Badge variant="outline" className="font-mono">
                          Ctrl+Shift+Z
                        </Badge>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 pr-4">
            {sortedChanges.map((change, index) => {
              const reverseIndex = sortedChanges.length - 1 - index;
              const isCurrentChange = reverseIndex === currentIndex;
              const isPastChange = reverseIndex <= currentIndex;
              
              return (
                <div 
                  key={change.id} 
                  className="relative"
                  onClick={() => onJumpTo && onJumpTo(reverseIndex)}
                >
                  {/* Timeline connector line */}
                  {index < sortedChanges.length - 1 && (
                    <div className="absolute left-6 top-20 bottom-0 w-px bg-border" />
                  )}

                  <Card className={`relative overflow-hidden hover-elevate cursor-pointer transition-all ${
                    isPastChange ? 'opacity-100' : 'opacity-50'
                  }`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isCurrentChange ? 'bg-primary' : 'bg-primary/30'
                    }`} />
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full -translate-x-1/2 ${
                              isCurrentChange
                                ? 'bg-primary scale-150'
                                : 'bg-primary/50'
                            }`} />
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
                        {thumbnails[change.id] && onDownload && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(thumbnails[change.id], `change-${index}.png`);
                            }}
                            data-testid={`button-download-screenshot-${index}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {onRestore && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(change.id);
                            }}
                            data-testid={`button-restore-${change.id}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(change.id);
                            }}
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
              );
            })}
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

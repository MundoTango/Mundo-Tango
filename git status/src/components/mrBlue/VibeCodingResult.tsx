import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, FileCode, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FileChange {
  filePath: string;
  action: 'modify' | 'create';
  reason: string;
  oldContent?: string;
  newContent: string;
}

interface VibeCodingResultProps {
  sessionId: string;
  fileChanges: FileChange[];
  onApplySuccess?: () => void;
}

export function VibeCodingResult({ sessionId, fileChanges, onApplySuccess }: VibeCodingResultProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [appliedFiles, setAppliedFiles] = useState<Set<string>>(new Set());
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set([fileChanges[0]?.filePath]));
  const { toast } = useToast();

  const toggleFile = (filePath: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  const applyChanges = async () => {
    setIsApplying(true);
    try {
      const response = await apiRequest('/api/mrblue/vibecoding/apply', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          fileChanges,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAppliedFiles(new Set(result.appliedFiles || fileChanges.map(fc => fc.filePath)));
        
        toast({
          title: "✅ Changes Applied!",
          description: `Successfully updated ${fileChanges.length} file(s)`,
        });

        onApplySuccess?.();
      } else {
        throw new Error('Failed to apply changes');
      }
    } catch (error) {
      console.error('[VibeCodingResult] Apply failed:', error);
      toast({
        title: "❌ Failed to Apply Changes",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const allApplied = fileChanges.every(fc => appliedFiles.has(fc.filePath));

  return (
    <Card className="border-primary/20" data-testid="vibecoding-result">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">🔨 Code Changes Generated</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {fileChanges.length} file{fileChanges.length !== 1 ? 's' : ''} • Session: {sessionId.slice(-8)}
              </p>
            </div>
          </div>
          
          <Button
            onClick={applyChanges}
            disabled={isApplying || allApplied}
            className="gap-2"
            data-testid="button-apply-changes"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : allApplied ? (
              <>
                <Check className="h-4 w-4" />
                Applied
              </>
            ) : (
              <>
                Apply Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-[600px]">
          <div className="divide-y">
            {fileChanges.map((change, index) => {
              const isExpanded = expandedFiles.has(change.filePath);
              const isApplied = appliedFiles.has(change.filePath);

              return (
                <div key={index} className="p-4">
                  {/* File Header */}
                  <button
                    onClick={() => toggleFile(change.filePath)}
                    className="w-full flex items-center justify-between gap-3 text-left hover-elevate active-elevate-2 p-3 rounded-lg"
                    data-testid={`file-toggle-${index}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant={change.action === 'create' ? 'default' : 'secondary'}>
                        {change.action}
                      </Badge>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-medium truncate">
                          {change.filePath}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {change.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isApplied && (
                        <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                          <Check className="h-3 w-3" />
                          Applied
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Code Diff */}
                  {isExpanded && (
                    <div className="mt-4">
                      {change.action === 'create' ? (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/50 px-4 py-2 border-b">
                            <p className="text-sm font-medium">New File Content</p>
                          </div>
                          <pre className="p-4 text-sm overflow-x-auto bg-card">
                            <code>{change.newContent}</code>
                          </pre>
                        </div>
                      ) : (
                        <ReactDiffViewer
                          oldValue={change.oldContent || ''}
                          newValue={change.newContent}
                          splitView={true}
                          showDiffOnly={false}
                          useDarkTheme={true}
                          leftTitle="Current"
                          rightTitle="Generated"
                          styles={{
                            diffContainer: {
                              fontSize: '13px',
                              fontFamily: 'monospace',
                            },
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Info Footer */}
        <div className="px-4 py-3 bg-muted/20 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Review the changes above, then click "Apply Changes" to update your files. 
              Changes are saved automatically to your project.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

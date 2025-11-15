/**
 * Visual Diff Viewer Component
 * Side-by-side before/after comparison with code diffs
 */

import { useState, useEffect } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getScreenshot } from '@/lib/screenshotCapture';
import { 
  Image as ImageIcon, 
  FileCode, 
  TrendingUp, 
  Loader2,
  Eye,
  Code2
} from 'lucide-react';

export interface ChangeMetadata {
  id: string;
  timestamp: number;
  prompt: string;
  beforeScreenshot: string;
  afterScreenshot: string;
  files: Array<{
    path: string;
    before: string;
    after: string;
  }>;
  css?: Record<string, any>;
  changedElements?: number;
}

interface VisualDiffViewerProps {
  change: ChangeMetadata;
  showCodeDiff?: boolean;
}

export function VisualDiffViewer({ change, showCodeDiff = true }: VisualDiffViewerProps) {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'split' | 'unified'>('split');

  useEffect(() => {
    async function loadScreenshots() {
      setIsLoading(true);
      try {
        const [before, after] = await Promise.all([
          getScreenshot(change.beforeScreenshot),
          getScreenshot(change.afterScreenshot)
        ]);
        setBeforeImage(before);
        setAfterImage(after);
      } catch (error) {
        console.error('[VisualDiffViewer] Failed to load screenshots:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadScreenshots();
  }, [change.beforeScreenshot, change.afterScreenshot]);

  // Calculate metrics
  const totalFiles = change.files.length;
  const totalLines = change.files.reduce((sum, file) => {
    const beforeLines = file.before.split('\n').length;
    const afterLines = file.after.split('\n').length;
    return sum + Math.abs(afterLines - beforeLines);
  }, 0);

  return (
    <div className="space-y-6" data-testid="visual-diff-viewer">
      {/* Metrics Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Change Summary</CardTitle>
              <CardDescription className="text-sm mt-1">
                {new Date(change.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <FileCode className="h-3 w-3" />
                {totalFiles} file{totalFiles !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {totalLines} line{totalLines !== 1 ? 's' : ''}
              </Badge>
              {change.changedElements && (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  {change.changedElements} element{change.changedElements !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Prompt:</span> {change.prompt}
          </p>
        </CardContent>
      </Card>

      {/* Visual Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Visual Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Before</Badge>
                </div>
                <div className="border rounded-lg overflow-hidden bg-muted/50">
                  {beforeImage ? (
                    <img 
                      src={beforeImage} 
                      alt="Before" 
                      className="w-full h-auto"
                      data-testid="screenshot-before"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No screenshot available
                    </div>
                  )}
                </div>
              </div>

              {/* After */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">After</Badge>
                </div>
                <div className="border rounded-lg overflow-hidden bg-muted/50">
                  {afterImage ? (
                    <img 
                      src={afterImage} 
                      alt="After" 
                      className="w-full h-auto"
                      data-testid="screenshot-after"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No screenshot available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Diff */}
      {showCodeDiff && change.files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Code Changes
              </CardTitle>
              <Tabs value={view} onValueChange={(v) => setView(v as 'split' | 'unified')}>
                <TabsList className="h-8">
                  <TabsTrigger value="split" className="text-xs">Split</TabsTrigger>
                  <TabsTrigger value="unified" className="text-xs">Unified</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-4 p-6">
                {change.files.map((file, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2 pb-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {file.path}
                      </Badge>
                    </div>
                    <div 
                      className="border rounded-lg overflow-hidden"
                      data-testid={`code-diff-${index}`}
                    >
                      <ReactDiffViewer
                        oldValue={file.before}
                        newValue={file.after}
                        splitView={view === 'split'}
                        showDiffOnly={true}
                        useDarkTheme={false}
                        styles={{
                          variables: {
                            light: {
                              diffViewerBackground: 'hsl(var(--background))',
                              diffViewerColor: 'hsl(var(--foreground))',
                              addedBackground: 'hsl(var(--success) / 0.1)',
                              addedColor: 'hsl(var(--success-foreground))',
                              removedBackground: 'hsl(var(--destructive) / 0.1)',
                              removedColor: 'hsl(var(--destructive-foreground))',
                              wordAddedBackground: 'hsl(var(--success) / 0.2)',
                              wordRemovedBackground: 'hsl(var(--destructive) / 0.2)',
                              addedGutterBackground: 'hsl(var(--success) / 0.15)',
                              removedGutterBackground: 'hsl(var(--destructive) / 0.15)',
                              gutterBackground: 'hsl(var(--muted))',
                              gutterBackgroundDark: 'hsl(var(--muted))',
                              highlightBackground: 'hsl(var(--accent))',
                              highlightGutterBackground: 'hsl(var(--accent))',
                            }
                          },
                          line: {
                            fontSize: '13px',
                            lineHeight: '20px',
                          }
                        }}
                      />
                    </div>
                    {index < change.files.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* CSS Changes (if any) */}
      {change.css && Object.keys(change.css).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">CSS Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(change.css, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

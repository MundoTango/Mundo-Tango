/**
 * VIBE CODING INTERFACE
 * Natural Language → Production Code UI
 * 
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Natural language input
 * - Code preview with syntax highlighting
 * - Multi-file change timeline
 * - Approve/Reject controls
 * - Real-time progress updates
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Sparkles, 
  FileCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  GitCommit,
  Play,
  Info
} from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface FileChange {
  filePath: string;
  originalContent: string;
  newContent: string;
  diff: string;
  action: 'create' | 'modify' | 'delete';
  reason: string;
}

interface VibeCodeResult {
  success: boolean;
  sessionId: string;
  request: string;
  interpretation: string;
  fileChanges: FileChange[];
  validationResults: {
    syntax: boolean;
    lsp: boolean;
    safety: boolean;
    warnings: string[];
  };
  estimatedImpact: string;
}

export function VibeCodingInterface() {
  const [request, setRequest] = useState('');
  const [result, setResult] = useState<VibeCodeResult | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Generate code mutation
  const generateMutation = useMutation({
    mutationFn: async (naturalLanguage: string) => {
      const res = await apiRequest('POST', '/api/mrblue/vibecode/generate', { 
        naturalLanguage 
      });
      return await res.json();
    },
    onSuccess: (data: { success: boolean; data: VibeCodeResult }) => {
      if (data.success) {
        setResult(data.data);
      }
    },
  });

  // Apply changes mutation
  const applyMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest('POST', '/api/mrblue/vibecode/apply', { 
        sessionId 
      });
      return await res.json();
    },
    onSuccess: (data: { success: boolean }) => {
      if (data.success) {
        setResult(null);
        setRequest('');
      }
    },
  });

  const handleGenerate = () => {
    if (!request.trim()) return;
    generateMutation.mutate(request);
  };

  const handleApply = () => {
    if (!result?.sessionId) return;
    applyMutation.mutate(result.sessionId);
  };

  const handleReject = () => {
    setResult(null);
  };

  const isLoading = generateMutation.isPending || applyMutation.isPending;
  const hasResult = result && result.success;
  const selectedFile = result?.fileChanges[selectedFileIndex];

  return (
    <div className="flex flex-col h-full space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Vibe Coding Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Natural language → Production code with GROQ Llama-3.1-70b
          </p>
        </div>
        
        <Badge variant="outline" className="h-8">
          <GitCommit className="w-4 h-4 mr-2" />
          Git Protected
        </Badge>
      </div>

      <Separator />

      {/* Input Section */}
      {!hasResult && (
        <Card>
          <CardHeader>
            <CardTitle>Describe what you want to build</CardTitle>
            <CardDescription>
              Use natural language to describe code changes. Examples: "add login button", "create user profile page", "fix navigation menu styling"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              data-testid="input-vibe-request"
              placeholder="Type your request here... (e.g., 'Add a responsive navbar with logo and menu items')"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {request.length} / 1000 characters
              </div>
              
              <Button 
                data-testid="button-generate-code"
                onClick={handleGenerate}
                disabled={!request.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !hasResult && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">Analyzing your request...</p>
              <p className="text-sm text-muted-foreground">
                GROQ is generating production-ready code
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {hasResult && (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Interpretation & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Interpretation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.interpretation}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Files</span>
                  <Badge variant="secondary">{result.fileChanges.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <Badge variant={
                    result.estimatedImpact.includes('Low') ? 'default' :
                    result.estimatedImpact.includes('Medium') ? 'secondary' :
                    'destructive'
                  }>
                    {result.estimatedImpact.split('-')[0].trim()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Status */}
          {result.validationResults.warnings.length > 0 && (
            <Alert variant={result.validationResults.safety ? 'default' : 'destructive'}>
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Validation Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {result.validationResults.warnings.map((warning, i) => (
                    <li key={i} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* File Changes */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                File Changes ({result.fileChanges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* File Timeline */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {result.fileChanges.map((file, index) => (
                  <Button
                    key={index}
                    data-testid={`button-file-${index}`}
                    variant={selectedFileIndex === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFileIndex(index)}
                    className="shrink-0"
                  >
                    <Badge 
                      variant={file.action === 'create' ? 'default' : 'secondary'}
                      className="mr-2"
                    >
                      {file.action}
                    </Badge>
                    {file.filePath.split('/').pop()}
                  </Button>
                ))}
              </div>

              {/* File Preview */}
              {selectedFile && (
                <Tabs defaultValue="diff" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="diff" data-testid="tab-diff">
                      Diff View
                    </TabsTrigger>
                    <TabsTrigger value="new" data-testid="tab-new">
                      New Code
                    </TabsTrigger>
                    <TabsTrigger value="info" data-testid="tab-info">
                      Info
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="diff" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full rounded-md border">
                      <ReactDiffViewer
                        oldValue={selectedFile.originalContent || '// New file'}
                        newValue={selectedFile.newContent}
                        splitView={true}
                        showDiffOnly={false}
                        useDarkTheme={false}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="new" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full rounded-md border">
                      <pre className="p-4 text-sm">
                        <code>{selectedFile.newContent}</code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="info" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="space-y-4 p-4">
                        <div>
                          <h4 className="font-semibold mb-2">File Path</h4>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {selectedFile.filePath}
                          </code>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Action</h4>
                          <Badge variant={
                            selectedFile.action === 'create' ? 'default' : 'secondary'
                          }>
                            {selectedFile.action}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Reason</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedFile.reason}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Changes</h4>
                          <div className="text-sm space-y-1">
                            <p>Original: {selectedFile.originalContent.split('\n').length} lines</p>
                            <p>New: {selectedFile.newContent.split('\n').length} lines</p>
                            <p>Diff: {selectedFile.diff.split('\n').length} lines</p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              data-testid="button-reject"
              variant="outline"
              onClick={handleReject}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Changes
            </Button>

            <div className="flex gap-2">
              <Button
                data-testid="button-preview"
                variant="secondary"
                disabled={isLoading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview in Editor
              </Button>

              <Button
                data-testid="button-apply"
                onClick={handleApply}
                disabled={isLoading || !result.validationResults.safety}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Apply Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {(generateMutation.isError || applyMutation.isError) && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(generateMutation.error as Error)?.message || 
             (applyMutation.error as Error)?.message || 
             'An error occurred'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

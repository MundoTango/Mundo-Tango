import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GitCommit, Sparkles, RefreshCw, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface FileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  selected: boolean;
}

interface CommitHistory {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
}

export function GitCommitPanel() {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [manualMessage, setManualMessage] = useState('');
  const [useAIMessage, setUseAIMessage] = useState(true);

  // Query: Get changed files
  const { data: files = [], isLoading: filesLoading, refetch: refetchFiles } = useQuery<FileStatus[]>({
    queryKey: ['/api/mrblue/git/status'],
    refetchInterval: 10000, // Refresh every 10s
  });

  // Query: Get commit history
  const { data: history = [], isLoading: historyLoading } = useQuery<CommitHistory[]>({
    queryKey: ['/api/mrblue/git/history'],
  });

  // Mutation: Generate AI commit message
  const generateMessage = useMutation({
    mutationFn: async (filePaths: string[]) => {
      return await apiRequest('/api/mrblue/git/generate-message', {
        method: 'POST',
        body: { filePaths }
      });
    },
    onSuccess: (data) => {
      if (data.message) {
        setManualMessage(data.message);
        setUseAIMessage(true);
      }
    }
  });

  // Mutation: Execute commit
  const commitMutation = useMutation({
    mutationFn: async ({ message, files }: { message: string; files: string[] }) => {
      return await apiRequest('/api/mrblue/git/commit', {
        method: 'POST',
        body: { message, files }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Commit Successful',
        description: 'Changes have been committed to the repository.',
      });
      setSelectedFiles(new Set());
      setManualMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/git/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/git/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Commit Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const toggleFileSelection = (filePath: string) => {
    const newSet = new Set(selectedFiles);
    if (newSet.has(filePath)) {
      newSet.delete(filePath);
    } else {
      newSet.add(filePath);
    }
    setSelectedFiles(newSet);
  };

  const handleGenerateMessage = () => {
    const selectedFilePaths = Array.from(selectedFiles);
    if (selectedFilePaths.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one file to generate a commit message.',
        variant: 'destructive',
      });
      return;
    }
    generateMessage.mutate(selectedFilePaths);
  };

  const handleCommit = () => {
    if (!manualMessage.trim()) {
      toast({
        title: 'Empty Commit Message',
        description: 'Please provide a commit message.',
        variant: 'destructive',
      });
      return;
    }
    if (selectedFiles.size === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one file to commit.',
        variant: 'destructive',
      });
      return;
    }
    commitMutation.mutate({
      message: manualMessage,
      files: Array.from(selectedFiles)
    });
  };

  const selectedCount = selectedFiles.size;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="panel-git-commit">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GitCommit className="h-6 w-6" />
              Git Commit Assistant
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered commit messages and version control
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchFiles()}
            data-testid="button-refresh-files"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
        {/* Left: File Selection */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Changed Files ({files.length})</CardTitle>
            <CardDescription>
              Select files to include in this commit
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {filesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Check className="h-8 w-8 mb-2" />
                  <p className="text-sm">No uncommitted changes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                      data-testid={`file-item-${file.path}`}
                    >
                      <Checkbox
                        checked={selectedFiles.has(file.path)}
                        onCheckedChange={() => toggleFileSelection(file.path)}
                        data-testid={`checkbox-file-${file.path}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{file.path}</p>
                      </div>
                      <Badge
                        variant={
                          file.status === 'added' ? 'default' :
                          file.status === 'deleted' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {file.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Commit Message & History */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commit Message</CardTitle>
              <CardDescription>
                AI-generated or write your own ({selectedCount} {selectedCount === 1 ? 'file' : 'files'} selected)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commit-message">Message</Label>
                <textarea
                  id="commit-message"
                  className="w-full min-h-24 px-3 py-2 text-sm rounded-md border bg-background"
                  placeholder="Enter commit message..."
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  data-testid="textarea-commit-message"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateMessage}
                  disabled={selectedCount === 0 || generateMessage.isPending}
                  className="flex-1"
                  data-testid="button-generate-message"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generateMessage.isPending ? 'Generating...' : 'AI Generate'}
                </Button>
                <Button
                  onClick={handleCommit}
                  disabled={!manualMessage.trim() || selectedCount === 0 || commitMutation.isPending}
                  className="flex-1"
                  data-testid="button-commit"
                >
                  <GitCommit className="h-4 w-4 mr-2" />
                  {commitMutation.isPending ? 'Committing...' : 'Commit'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Recent Commits</CardTitle>
              <CardDescription>
                Commit history for this repository
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2" />
                    <p className="text-sm">No commit history</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((commit, index) => (
                      <div key={commit.hash}>
                        {index > 0 && <Separator className="my-2" />}
                        <div className="space-y-1" data-testid={`commit-${commit.hash}`}>
                          <p className="text-sm font-medium">{commit.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{commit.hash.substring(0, 7)}</span>
                            <span>•</span>
                            <span>{commit.author}</span>
                            <span>•</span>
                            <span>{new Date(commit.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {commit.filesChanged} {commit.filesChanged === 1 ? 'file' : 'files'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

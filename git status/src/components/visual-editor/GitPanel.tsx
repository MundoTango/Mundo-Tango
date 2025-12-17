/**
 * Git Panel Component
 * Shows commit history, diffs, and branch management for Visual Editor
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  GitBranch,
  GitCommit,
  GitMerge,
  History,
  Download,
  X,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  User,
  FileText,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";

interface Commit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
}

interface Branch {
  name: string;
  current: boolean;
}

interface GitPanelProps {
  currentFile: string;
  onBranchSwitch?: (branch: string) => void;
}

export function GitPanel({ currentFile, onBranchSwitch }: GitPanelProps) {
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showCreateBranchDialog, setShowCreateBranchDialog] = useState(false);
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [revertCommit, setRevertCommit] = useState<Commit | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch commit history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/visual-editor/git/history', currentFile],
    enabled: !!currentFile,
  });

  // Fetch branches
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ['/api/visual-editor/git/branches'],
  });

  // Fetch diff for selected commit
  const { data: diffData, isLoading: diffLoading } = useQuery({
    queryKey: ['/api/visual-editor/git/diff', selectedCommit?.hash],
    enabled: !!selectedCommit && showDiffModal,
  });

  // Create branch mutation
  const createBranchMutation = useMutation({
    mutationFn: async (branchName: string) => {
      return apiRequest('/api/visual-editor/git/branch', {
        method: 'POST',
        body: JSON.stringify({ name: branchName }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/visual-editor/git/branches'] });
      setShowCreateBranchDialog(false);
      setNewBranchName("");
      toast({
        title: "Branch Created",
        description: `Created and switched to branch "${data.branchName}"`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Branch",
        description: error.message || "Could not create branch",
      });
    },
  });

  // Switch branch mutation
  const switchBranchMutation = useMutation({
    mutationFn: async (branchName: string) => {
      return apiRequest('/api/visual-editor/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify({ branchName }),
      });
    },
    onSuccess: (data, branchName) => {
      queryClient.invalidateQueries({ queryKey: ['/api/visual-editor/git/branches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visual-editor/git/history'] });
      setShowSwitchWarning(false);
      setTargetBranch("");
      toast({
        title: "Branch Switched",
        description: `Switched to branch "${branchName}"`,
      });
      onBranchSwitch?.(branchName);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Switch Branch",
        description: error.message || "Could not switch branch",
      });
      setShowSwitchWarning(false);
    },
  });

  // Revert mutation
  const revertMutation = useMutation({
    mutationFn: async (commitHash: string) => {
      return apiRequest('/api/visual-editor/revert', {
        method: 'POST',
        body: JSON.stringify({
          pagePath: currentFile,
          commitHash,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visual-editor/git/history'] });
      setShowRevertConfirm(false);
      setRevertCommit(null);
      toast({
        title: "Reverted Successfully",
        description: "File has been reverted to the selected commit",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Revert Failed",
        description: error.message || "Could not revert changes",
      });
      setShowRevertConfirm(false);
    },
  });

  const commits: Commit[] = historyData?.commits || [];
  const branches: Branch[] = branchesData?.branches || [];
  const currentBranch = branchesData?.currentBranch || 'main';

  const handleViewDiff = (commit: Commit) => {
    setSelectedCommit(commit);
    setShowDiffModal(true);
  };

  const handleDownloadDiff = () => {
    if (!diffData?.diff) return;
    
    const blob = new Blob([diffData.diff], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCommit?.hash.substring(0, 7)}.patch`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Diff Downloaded",
      description: `Saved as ${selectedCommit?.hash.substring(0, 7)}.patch`,
    });
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Branch Name",
        description: "Please enter a valid branch name",
      });
      return;
    }

    createBranchMutation.mutate(newBranchName.trim());
  };

  const handleSwitchBranch = (branchName: string) => {
    if (branchName === currentBranch) return;
    
    setTargetBranch(branchName);
    setShowSwitchWarning(true);
  };

  const confirmSwitchBranch = () => {
    switchBranchMutation.mutate(targetBranch);
  };

  const handleRevert = (commit: Commit) => {
    setRevertCommit(commit);
    setShowRevertConfirm(true);
  };

  const confirmRevert = () => {
    if (revertCommit) {
      revertMutation.mutate(revertCommit.hash);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="history" className="flex-1 flex flex-col">
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="diff" disabled={!selectedCommit} data-testid="tab-diff">
              <FileText className="w-4 h-4 mr-2" />
              Diff
            </TabsTrigger>
            <TabsTrigger value="branches" data-testid="tab-branches">
              <GitBranch className="w-4 h-4 mr-2" />
              Branches
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Commit History Tab */}
          <TabsContent value="history" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {historyLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading commit history...
                  </div>
                )}

                {!historyLoading && commits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitCommit className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No commits yet</p>
                    <p className="text-sm">Make some changes and save to create your first commit</p>
                  </div>
                )}

                {commits.map((commit, index) => (
                  <Card
                    key={commit.hash}
                    className="hover-elevate cursor-pointer transition-all"
                    data-testid={`commit-${index}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {commit.hash.substring(0, 7)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(commit.date), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="font-medium text-sm mb-1 line-clamp-2">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{commit.author}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDiff(commit)}
                            data-testid={`button-view-diff-${index}`}
                          >
                            View Diff
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevert(commit)}
                            data-testid={`button-revert-${index}`}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Revert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Diff Viewer Tab */}
          <TabsContent value="diff" className="h-full m-0 p-0">
            {selectedCommit && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Commit Diff</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDownloadDiff}
                      disabled={!diffData?.diff}
                      data-testid="button-download-diff"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download .patch
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {selectedCommit.hash.substring(0, 7)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedCommit.message}
                    </span>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {diffLoading && (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading diff...
                      </div>
                    )}

                    {!diffLoading && diffData?.diff && (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                        <code>{diffData.diff}</code>
                      </pre>
                    )}

                    {!diffLoading && !diffData?.diff && (
                      <div className="text-center py-8 text-muted-foreground">
                        No diff available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="h-full m-0 p-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <Button
                  size="sm"
                  onClick={() => setShowCreateBranchDialog(true)}
                  className="w-full"
                  data-testid="button-create-branch"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Branch
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {branchesLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading branches...
                    </div>
                  )}

                  {!branchesLoading && branches.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No branches found</p>
                    </div>
                  )}

                  {branches.map((branch, index) => (
                    <Card
                      key={branch.name}
                      className={`hover-elevate transition-all ${
                        branch.current ? 'border-primary' : ''
                      }`}
                      data-testid={`branch-${index}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GitBranch
                              className={`w-5 h-5 ${
                                branch.current ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            />
                            <div>
                              <p className="font-medium">{branch.name}</p>
                              {branch.current && (
                                <Badge variant="default" className="mt-1">
                                  <Check className="w-3 h-3 mr-1" />
                                  Current
                                </Badge>
                              )}
                            </div>
                          </div>

                          {!branch.current && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSwitchBranch(branch.name)}
                              data-testid={`button-switch-${index}`}
                            >
                              Switch
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateBranchDialog} onOpenChange={setShowCreateBranchDialog}>
        <DialogContent data-testid="dialog-create-branch">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch from the current state
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="feature/my-new-feature"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateBranch();
                }
              }}
              data-testid="input-branch-name"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateBranchDialog(false);
                setNewBranchName("");
              }}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={createBranchMutation.isPending || !newBranchName.trim()}
              data-testid="button-confirm-create"
            >
              {createBranchMutation.isPending ? 'Creating...' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Branch Warning */}
      <AlertDialog open={showSwitchWarning} onOpenChange={setShowSwitchWarning}>
        <AlertDialogContent data-testid="dialog-switch-warning">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Switch Branch?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to switch to branch <strong>{targetBranch}</strong>.
              Make sure all your changes are saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-switch">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSwitchBranch}
              disabled={switchBranchMutation.isPending}
              data-testid="button-confirm-switch"
            >
              {switchBranchMutation.isPending ? 'Switching...' : 'Switch Branch'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert Confirmation */}
      <AlertDialog open={showRevertConfirm} onOpenChange={setShowRevertConfirm}>
        <AlertDialogContent data-testid="dialog-revert-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Revert to Previous Commit?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will revert the file to commit{' '}
              <strong>{revertCommit?.hash.substring(0, 7)}</strong>.
              A new commit will be created with the reverted changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revert">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevert}
              disabled={revertMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-revert"
            >
              {revertMutation.isPending ? 'Reverting...' : 'Revert'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

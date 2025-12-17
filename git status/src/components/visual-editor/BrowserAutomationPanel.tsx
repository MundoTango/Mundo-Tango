/**
 * Browser Automation Panel - Record and playback browser actions
 * 
 * Features:
 * - View/create/edit recordings
 * - Execute recordings
 * - View execution history
 * - Screenshot playback
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, Pause, Plus, Edit, Trash2, Loader2, Clock, 
  CheckCircle2, XCircle, AlertCircle, Image, Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Recording {
  id: number;
  name: string;
  description?: string;
  actions: BrowserAction[];
  startUrl: string;
  status: string;
  executionCount: number;
  lastExecutedAt?: string;
  successRate?: number;
  averageDuration?: number;
  createdAt: string;
}

interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot' | 'extract' | 'scroll';
  selector?: string;
  value?: string;
  wait?: number;
  url?: string;
}

interface Execution {
  id: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage?: string;
  screenshots?: Array<{ step: number; base64: string; action: string }>;
}

export function BrowserAutomationPanel() {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for new recording
  const [newRecording, setNewRecording] = useState({
    name: '',
    description: '',
    startUrl: '',
    actions: [] as BrowserAction[]
  });

  // Fetch recordings
  const { data: recordingsData, isLoading: recordingsLoading } = useQuery<{ success: boolean; data: Recording[] }>({
    queryKey: ['/api/v1/orchestration/browser-automation/recordings'],
    refetchInterval: 30000,
  });

  const recordings = recordingsData?.data || [];

  // Fetch execution history for selected recording
  const { data: executionsData } = useQuery<{ success: boolean; data: Execution[] }>({
    queryKey: ['/api/v1/orchestration/browser-automation/recordings', selectedRecording?.id, 'executions'],
    enabled: !!selectedRecording,
  });

  const executions = executionsData?.data || [];

  // Create recording mutation
  const createMutation = useMutation({
    mutationFn: async (recording: typeof newRecording) => {
      const response = await apiRequest('POST', '/api/v1/orchestration/browser-automation/recordings', recording);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recording Created",
        description: "Browser automation recording saved successfully",
      });
      setShowCreateDialog(false);
      setNewRecording({ name: '', description: '', startUrl: '', actions: [] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/orchestration/browser-automation/recordings'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create recording",
      });
    },
  });

  // Execute recording mutation
  const executeMutation = useMutation({
    mutationFn: async (recordingId: number) => {
      const response = await apiRequest('POST', `/api/v1/orchestration/browser-automation/recordings/${recordingId}/execute`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      setExecutionResult(data);
      setShowExecutionDialog(true);
      setSelectedScreenshot(0);
      
      if (data.success) {
        toast({
          title: "Execution Complete",
          description: `Recording executed successfully`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Execution Failed",
          description: data.error || "Recording execution failed",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/v1/orchestration/browser-automation/recordings'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: error.message || "Could not execute recording",
      });
    },
  });

  // Delete recording mutation
  const deleteMutation = useMutation({
    mutationFn: async (recordingId: number) => {
      const response = await apiRequest('DELETE', `/api/v1/orchestration/browser-automation/recordings/${recordingId}`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recording Deleted",
        description: "Recording removed successfully",
      });
      setSelectedRecording(null);
      queryClient.invalidateQueries({ queryKey: ['/api/v1/orchestration/browser-automation/recordings'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete recording",
      });
    },
  });

  const handleCreateRecording = () => {
    if (!newRecording.name || !newRecording.startUrl || newRecording.actions.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one action",
      });
      return;
    }
    createMutation.mutate(newRecording);
  };

  const addAction = () => {
    setNewRecording(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'navigate', url: '' }]
    }));
  };

  const updateAction = (index: number, updates: Partial<BrowserAction>) => {
    setNewRecording(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => i === index ? { ...action, ...updates } : action)
    }));
  };

  const removeAction = (index: number) => {
    setNewRecording(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4 p-4" data-testid="browser-automation-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Browser Automation</h3>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-recording">
              <Plus className="w-4 h-4 mr-2" />
              New Recording
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create Browser Recording</DialogTitle>
              <DialogDescription>
                Define a sequence of browser actions to automate
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Login to Dashboard"
                    value={newRecording.name}
                    onChange={(e) => setNewRecording(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-recording-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="What does this recording do?"
                    value={newRecording.description}
                    onChange={(e) => setNewRecording(prev => ({ ...prev, description: e.target.value }))}
                    data-testid="textarea-recording-description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start URL</label>
                  <Input
                    placeholder="https://example.com"
                    value={newRecording.startUrl}
                    onChange={(e) => setNewRecording(prev => ({ ...prev, startUrl: e.target.value }))}
                    data-testid="input-start-url"
                  />
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Actions</label>
                    <Button size="sm" variant="outline" onClick={addAction} data-testid="button-add-action">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Action
                    </Button>
                  </div>
                  
                  {newRecording.actions.map((action, index) => (
                    <Card key={index} className="mb-2 p-3" data-testid={`action-card-${index}`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Select
                            value={action.type}
                            onValueChange={(value: any) => updateAction(index, { type: value })}
                          >
                            <SelectTrigger className="w-40" data-testid={`select-action-type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="navigate">Navigate</SelectItem>
                              <SelectItem value="click">Click</SelectItem>
                              <SelectItem value="type">Type</SelectItem>
                              <SelectItem value="wait">Wait</SelectItem>
                              <SelectItem value="screenshot">Screenshot</SelectItem>
                              <SelectItem value="extract">Extract</SelectItem>
                              <SelectItem value="scroll">Scroll</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAction(index)}
                            data-testid={`button-remove-action-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {action.type === 'navigate' && (
                          <Input
                            placeholder="URL"
                            value={action.url || ''}
                            onChange={(e) => updateAction(index, { url: e.target.value })}
                            data-testid={`input-action-url-${index}`}
                          />
                        )}
                        
                        {(action.type === 'click' || action.type === 'type' || action.type === 'extract') && (
                          <Input
                            placeholder="CSS Selector (e.g., #submit-button)"
                            value={action.selector || ''}
                            onChange={(e) => updateAction(index, { selector: e.target.value })}
                            data-testid={`input-action-selector-${index}`}
                          />
                        )}
                        
                        {action.type === 'type' && (
                          <Input
                            placeholder="Text to type"
                            value={action.value || ''}
                            onChange={(e) => updateAction(index, { value: e.target.value })}
                            data-testid={`input-action-value-${index}`}
                          />
                        )}
                        
                        {(action.type === 'wait' || action.type === 'click') && (
                          <Input
                            type="number"
                            placeholder="Wait time (ms)"
                            value={action.wait || ''}
                            onChange={(e) => updateAction(index, { wait: parseInt(e.target.value) })}
                            data-testid={`input-action-wait-${index}`}
                          />
                        )}
                        
                        {action.type === 'scroll' && (
                          <Input
                            type="number"
                            placeholder="Scroll distance (px)"
                            value={action.value || ''}
                            onChange={(e) => updateAction(index, { value: e.target.value })}
                            data-testid={`input-action-scroll-${index}`}
                          />
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {newRecording.actions.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No actions defined. Click "Add Action" to start building your automation.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRecording} 
                disabled={createMutation.isPending}
                data-testid="button-save-recording"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Recording
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recordings List */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {recordingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : recordings.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No recordings yet. Create your first browser automation to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <Card
                key={recording.id}
                className={selectedRecording?.id === recording.id ? 'ring-2 ring-primary' : ''}
                data-testid={`recording-card-${recording.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{recording.name}</CardTitle>
                      {recording.description && (
                        <p className="text-sm text-muted-foreground mt-1">{recording.description}</p>
                      )}
                    </div>
                    <Badge variant={recording.status === 'active' ? 'default' : 'secondary'}>
                      {recording.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Actions:</span>
                      <span className="ml-2 font-medium">{recording.actions.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Executions:</span>
                      <span className="ml-2 font-medium">{recording.executionCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="ml-2 font-medium">
                        {recording.successRate ? `${Math.round(recording.successRate * 100)}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Duration:</span>
                      <span className="ml-2 font-medium">{formatDuration(recording.averageDuration)}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Last run: {formatDate(recording.lastExecutedAt)}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRecording(recording);
                        executeMutation.mutate(recording.id);
                      }}
                      disabled={executeMutation.isPending}
                      data-testid={`button-execute-${recording.id}`}
                    >
                      {executeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRecording(recording)}
                      data-testid={`button-view-${recording.id}`}
                    >
                      View History
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(recording.id)}
                      data-testid={`button-delete-${recording.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Execution Result Dialog */}
      <Dialog open={showExecutionDialog} onOpenChange={setShowExecutionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Execution Result</DialogTitle>
            <DialogDescription>
              {executionResult?.success ? (
                <span className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed successfully
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Failed: {executionResult?.error}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {executionResult?.screenshots && executionResult.screenshots.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Screenshot {selectedScreenshot + 1} of {executionResult.screenshots.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedScreenshot(Math.max(0, selectedScreenshot - 1))}
                    disabled={selectedScreenshot === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedScreenshot(Math.min(executionResult.screenshots.length - 1, selectedScreenshot + 1))}
                    disabled={selectedScreenshot === executionResult.screenshots.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-2 bg-muted">
                <p className="text-sm mb-2">
                  Step {executionResult.screenshots[selectedScreenshot].step}: {executionResult.screenshots[selectedScreenshot].action}
                </p>
                <img
                  src={`data:image/png;base64,${executionResult.screenshots[selectedScreenshot].base64}`}
                  alt={`Screenshot ${selectedScreenshot + 1}`}
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          )}
          
          {executionResult?.data && Object.keys(executionResult.data).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Extracted Data:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(executionResult.data, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
